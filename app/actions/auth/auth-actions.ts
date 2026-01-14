"use server";

import { supabaseServer } from "@/util/supabase-server";
import { twilioClient } from "@/util/twilio";
import crypto from "crypto";

export type UserType = "auth_user" | "missionary" | "not_found";

export interface CheckEmailResult {
  userType: UserType;
  exists: boolean;
}

export async function checkEmailExists(
  email: string
): Promise<CheckEmailResult> {
  // First, check if email exists in users table
  const { data: authUser, error: authError } = await supabaseServer
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (authUser && !authError) {
    return { userType: "auth_user", exists: true };
  }

  // If not in users, check missionaries table
  const { data: missionary, error: missionaryError } = await supabaseServer
    .from("missionaries")
    .select("id")
    .eq("email", email)
    .single();

  if (missionary && !missionaryError) {
    return { userType: "missionary", exists: true };
  }

  // Email not found in either table
  return { userType: "not_found", exists: false };
}

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabaseServer.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
}

export async function verifyMissionaryToken(email: string, token: string) {
  // Basic validation first
  if (!/^\d{6}$/.test(token)) {
    return { success: false, error: "Invalid code format" };
  }

  // Ensure missionary exists
  const { data: missionary, error: missionaryError } = await supabaseServer
    .from("missionaries")
    .select("id,email,first_name,last_name")
    .eq("email", email)
    .single();

  if (missionaryError || !missionary) {
    return { success: false, error: "Missionary not found" };
  }

  // Fetch latest unused token for this email
  const { data: tokens, error: tokenQueryError } = await supabaseServer
    .from("missionary_tokens")
    .select("id, token_hash, expires_at")
    .eq("email", email)
    .eq("used", false)
    .order("created_at", { ascending: false })
    .limit(1);

  if (tokenQueryError) {
    // If table doesn't exist or other error, provide helpful message
    return {
      success: false,
      error:
        "Verification service unavailable. Please contact support or request a new code.",
    };
  }

  if (!tokens || tokens.length === 0) {
    return { success: false, error: "No active code. Request a new one." };
  }

  const record = tokens[0];
  const now = Date.now();
  const expiresAt = new Date(record.expires_at).getTime();
  if (now > expiresAt) {
    return { success: false, error: "Code expired. Request a new one." };
  }

  const incomingHash = crypto.createHash("sha256").update(token).digest("hex");

  if (incomingHash !== record.token_hash) {
    return { success: false, error: "Incorrect code" };
  }

  // Mark token as used
  await supabaseServer
    .from("missionary_tokens")
    .update({ used: true })
    .eq("id", record.id);

  // Create or get auth user for the missionary
  let authUserId: string;
  
  // Check if auth user already exists
  const { data: existingUsers } = await supabaseServer.auth.admin.listUsers();
  const existingAuthUser = existingUsers?.users.find((u: any) => u.email === email);

  if (existingAuthUser) {
    authUserId = existingAuthUser.id;
  } else {
    // Create auth user for missionary
    const { data: newAuthUser, error: createAuthError } =
      await supabaseServer.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          first_name: missionary.first_name,
          last_name: missionary.last_name,
          is_missionary: true,
        },
      });

    if (createAuthError || !newAuthUser.user) {
      console.error("Failed to create auth user for missionary:", createAuthError);
      return {
        success: false,
        error: "Failed to create authentication session",
      };
    }

    authUserId = newAuthUser.user.id;
  }

  // Generate a session for the auth user
  const { data: sessionData, error: sessionError } =
    await supabaseServer.auth.admin.createSession({
      user_id: authUserId,
    });

  if (sessionError || !sessionData) {
    console.error("Failed to create session for missionary:", sessionError);
    return {
      success: false,
      error: "Failed to create authentication session",
    };
  }

  return {
    success: true,
    missionary,
    session: sessionData.session,
  };
}

/**
 * Generate, store, and send a 6-digit verification code to a missionary's phone.
 * Creates a new row in `missionary_tokens` table with hashed token and expiry.
 */
export async function sendMissionaryToken(email: string) {
  // Locate missionary & phone number (attempt multiple possible field names)
  const { data: missionary, error } = await supabaseServer
    .from("missionaries")
    .select("id,email,phone,phone_number,phoneNumber,mobile,mobile_number")
    .eq("email", email)
    .single();

  if (error || !missionary) {
    return { success: false, error: "Missionary not found" };
  }

  const phone: string | undefined =
    (missionary as any).phone ||
    (missionary as any).phone_number ||
    (missionary as any).phoneNumber ||
    (missionary as any).mobile ||
    (missionary as any).mobile_number;

  if (!phone) {
    return { success: false, error: "No phone number on file" };
  }

  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const ttlMinutes = parseInt(
    process.env.MISSIONARY_TOKEN_TTL_MINUTES || "10",
    10
  );
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000).toISOString();

  // Optional: invalidate previous unused tokens for this email (cleanup)
  await supabaseServer
    .from("missionary_tokens")
    .update({ used: true })
    .eq("email", email)
    .eq("used", false);

  const insertPayload = {
    email,
    token_hash: tokenHash,
    expires_at: expiresAt,
    used: false,
  };

  const { error: insertError } = await supabaseServer
    .from("missionary_tokens")
    .insert(insertPayload);

  if (insertError) {
    return { success: false, error: "Failed to store code" };
  }

  // Send SMS via Twilio
  try {
    if (!process.env.TWILIO_FROM_NUMBER) {
      return { success: false, error: "Missing Twilio FROM number env" };
    }
    await twilioClient.messages.create({
      to: phone,
      from: process.env.TWILIO_FROM_NUMBER,
      body: `Your MyHometown verification code is ${token}. It expires in ${ttlMinutes} minutes.`,
    });
  } catch (smsError: any) {
    return {
      success: false,
      error: smsError?.message || "Failed to send SMS",
    };
  }

  return { success: true };
}

/**
 * Convenience: request a new token (resend) while invalidating current one.
 */
export async function resendMissionaryToken(email: string) {
  // Just call sendMissionaryToken (it invalidates previous unused tokens)
  return sendMissionaryToken(email);
}
