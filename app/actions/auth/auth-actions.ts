"use server";

import { supabaseServer } from "@/util/supabase-server";

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
  // Verify the token matches what was sent
  // For now, this is a placeholder - you'll integrate Twilio later
  const { data: missionary, error } = await supabaseServer
    .from("missionaries")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !missionary) {
    return { success: false, error: "Missionary not found" };
  }

  // TODO: Verify token with Twilio or your token storage
  // For now, we'll accept any 6-digit token as valid
  if (token.length === 6 && /^\d+$/.test(token)) {
    return { success: true, missionary };
  }

  return { success: false, error: "Invalid token" };
}
