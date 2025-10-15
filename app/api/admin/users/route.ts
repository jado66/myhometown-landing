import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { myHometownTransporter } from "@/util/email/transporter";
import { UserPermissions } from "@/types/user";

// Service role client (server only)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/admin/users -> list users with expanded city & community details
export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .order("last_active_at", { ascending: false });
    if (error) throw error;

    if (!users || users.length === 0) {
      return NextResponse.json([]);
    }

    // Aggregate unique city & community ids
    const cityIds = Array.from(
      new Set(
        users
          .flatMap((u: any) => (Array.isArray(u.cities) ? u.cities : []))
          .filter(Boolean)
      )
    );
    const communityIds = Array.from(
      new Set(
        users
          .flatMap((u: any) =>
            Array.isArray(u.communities) ? u.communities : []
          )
          .filter(Boolean)
      )
    );

    // Fetch details (ignore errors individually; empty arrays if fails)
    const [citiesRes, communitiesRes] = await Promise.all([
      cityIds.length
        ? supabase.from("cities").select("*").in("id", cityIds)
        : Promise.resolve({ data: [], error: null }),
      communityIds.length
        ? supabase.from("communities").select("*").in("id", communityIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const citiesById: Record<string, any> = {};
    (citiesRes.data || []).forEach((c: any) => (citiesById[c.id] = c));
    const communitiesById: Record<string, any> = {};
    (communitiesRes.data || []).forEach(
      (c: any) => (communitiesById[c.id] = c)
    );

    const enriched = users.map((u: any) => ({
      ...u,
      cities_details: (u.cities || [])
        .map((id: string) => citiesById[id])
        .filter(Boolean),
      communities_details: (u.communities || [])
        .map((id: string) => communitiesById[id])
        .filter(Boolean),
    }));

    return NextResponse.json(enriched);
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users -> create user
// Invitation HTML (simplified, can be shared later)
const formattedInviteHtml = (
  firstName: string,
  lastName: string,
  inviteLink: string
): string => `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /><title>Welcome to myHometown</title><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:#f8f9fa;padding:20px;text-align:center;border-bottom:2px solid #dee2e6}.content{padding:30px 20px;background:#fff}.button{display:inline-block;padding:12px 24px;background:#318d43;color:#fff;text-decoration:none;border-radius:4px;margin:20px 0}.footer{text-align:center;padding:20px;font-size:12px;color:#6c757d}a.button{color:#fff!important;text-decoration:none!important}</style></head><body><div class="container"><div class="header"><h1>Welcome to myHometown!</h1></div><div class="content"><p>Hello ${firstName} ${lastName},</p><p>You've been invited to join the myHometown Admin Dashboard. Click below to set up your account.</p><p style="text-align:center"><a href="${inviteLink}" class="button">Set Up Your Account</a></p><p>This invitation link will remain active until used.</p><p>If you didn't expect this invitation you can ignore this email.</p></div><div class="footer"><p>&copy; ${new Date().getFullYear()} myHometown. All rights reserved.</p></div></div></body></html>`;

interface InviteLikeBody {
  email: string;
  first_name: string;
  last_name: string;
  contact_number?: string | null;
  permissions?: UserPermissions;
  cities?: Array<{ id: string } | string>;
  communities?: Array<{ id: string } | string>;
}

export async function POST(request: NextRequest) {
  console.log("🚀 POST /api/admin/users (invite-based) called");
  try {
    const body = (await request.json()) as InviteLikeBody;
    const { email, first_name, last_name } = body;

    if (!email || !first_name || !last_name) {
      return NextResponse.json(
        { message: "Missing required fields: email, first_name, last_name" },
        { status: 400 }
      );
    }

    // 1. Find or create auth user
    let authUser: any = null;
    try {
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      if (!listError && users) {
        authUser = users.users.find((u: any) => u.email === email) || null;
      }
    } catch (e) {
      console.log("⚠️ listUsers failed", e);
    }
    if (!authUser) {
      console.log("➕ Creating auth user for", email);
      const { data: newAuth, error: createErr } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          first_name,
          last_name,
          invitation_pending: true,
        },
      });
      if (createErr) {
        throw new Error(`Failed to create auth user: ${createErr.message}`);
      }
      authUser = newAuth.user;
    }

    // 2. Invitation token (reuse existing unused invitation if present)
    const generatedToken = uuidv4();
    let token = generatedToken;
    const { data: existingInvitation, error: invitationLookupErr } = await supabase
      .from("user_invitations")
      .select("*")
      .eq("email", email)
      .eq("used", false)
      .single();
    if (!invitationLookupErr && existingInvitation) {
      token = (existingInvitation as any).token;
      const { error: updateInvitationErr } = await supabase
        .from("user_invitations")
        .update({
          first_name,
          last_name,
          user_id: authUser.id,
          created_at: new Date().toISOString(),
        })
        .eq("id", (existingInvitation as any).id);
      if (updateInvitationErr) {
        console.warn("⚠️ Failed to update existing invitation", updateInvitationErr.message);
      }
    } else {
      const { error: insertInvitationErr } = await supabase.from("user_invitations").insert([
        {
          email,
          token,
          user_id: authUser.id,
          first_name,
          last_name,
        },
      ]);
      if (insertInvitationErr) {
        throw new Error(`Failed to create invitation: ${insertInvitationErr.message}`);
      }
    }

    // 3. Create or upsert user record with provided data (cities/communities mapping)
    const cityIds = Array.isArray(body.cities)
      ? body.cities.map((c: any) => (typeof c === "object" && c.id ? c.id : c))
      : [];
    const communityIds = Array.isArray(body.communities)
      ? body.communities.map((c: any) => (typeof c === "object" && c.id ? c.id : c))
      : [];

    let userRecord: any = null;
    try {
      const { data: insertedUser, error: userInsertErr } = await supabase
        .from("users")
        .insert([
          {
            id: authUser.id,
            email,
            first_name,
            last_name,
            contact_number: body.contact_number || null,
            permissions: body.permissions || {},
            cities: cityIds,
            communities: communityIds,
          },
        ])
        .select("*")
        .single();
      if (userInsertErr) {
        if (userInsertErr.code === "23505") {
          // duplicate -> update existing
          const { data: updatedUser, error: userUpdateErr } = await supabase
            .from("users")
            .update({
              email,
              first_name,
              last_name,
              contact_number: body.contact_number || null,
              permissions: body.permissions || {},
              cities: cityIds,
              communities: communityIds,
            })
            .eq("id", authUser.id)
            .select("*")
            .single();
          if (!userUpdateErr) userRecord = updatedUser;
          else console.warn("⚠️ Failed to update existing user record", userUpdateErr.message);
        } else {
          console.warn("⚠️ Failed to create user record", userInsertErr.message);
        }
      } else {
        userRecord = insertedUser;
      }
    } catch (e) {
      console.warn("⚠️ User record error", e);
    }

    // 4. Send invitation email
    const baseDomain = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || process.env.NEXT_PUBLIC_SITE_URL || "";
    const inviteLink = `${baseDomain}/auth/setup-password?token=${token}`;
    try {
      const info = await myHometownTransporter.sendMail({
        to: email,
        subject: "Welcome to myHometown - Set Up Your Account",
        html: formattedInviteHtml(first_name, last_name, inviteLink),
      });
      console.log("✅ Invitation email sent", info.messageId);
    } catch (emailErr) {
      console.error("❌ Failed sending invitation email", emailErr);
      // We still return success for creation; include warning.
    }

    return NextResponse.json(
      {
        message: "Invitation processed successfully",
        data: {
          user: {
            id: authUser.id,
            email,
            first_name,
            last_name,
          },
          userRecord,
          token,
          invite_link: inviteLink,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("💥 Error creating invited user:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create invited user" },
      { status: 500 }
    );
  }
}
