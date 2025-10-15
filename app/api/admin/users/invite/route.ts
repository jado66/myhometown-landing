import { myHometownTransporter } from "@/util/email/transporter";
import { supabaseServer } from "@/util/supabase-server";
import { v4 as uuidv4 } from "uuid";
import { NextRequest, NextResponse } from "next/server";
import { UserPermissions } from "@/types/user";

interface InviteRequestBody {
  email: string;
  firstName: string;
  lastName: string;
  userData?: {
    contact_number?: string;
    permissions?: UserPermissions;
    cities?: Array<{ id: string } | string>;
    communities?: Array<{ id: string } | string>;
  };
}

interface UserInvitation {
  id: string;
  email: string;
  token: string;
  user_id: string;
  first_name: string;
  last_name: string;
  used: boolean;
  created_at: string;
}

interface UserRecord {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  contact_number: string | null;
  permissions: UserPermissions;
  cities: string[];
  communities: string[];
}

const formattedInviteHtml = (
  email: string,
  firstName: string,
  lastName: string,
  inviteLink: string
): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to myHometown</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          border-bottom: 2px solid #dee2e6;
        }
        .content {
          padding: 30px 20px;
          background-color: #ffffff;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #318d43;
          color: #ffffff;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #6c757d;
        }
        a[class="button"] {
          color: #ffffff !important;
          text-decoration: none !important;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to myHometown!</h1>
        </div>
        <div class="content">
          <p>Hello ${firstName} ${lastName},</p>
          <p>You've been invited to join myHometown Admin Dashboard. To get started, click the button below to set up your account.</p>
          <p style="text-align: center;">
            <a href="${inviteLink}" class="button" style="color: #ffffff">Set Up Your Account</a>
          </p>
          <p>This invitation link will remain active until you use it to set up your account.</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} myHometown. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("🚀 Enhanced Invite API called");

  try {
    // Parse request body
    const body = (await request.json()) as InviteRequestBody;
    const { email, firstName, lastName, userData } = body;

    console.log("📧 Request data:", {
      email,
      firstName,
      lastName,
      hasUserData: !!userData,
    });

    // Validate input
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        {
          message: "Missing required fields: email, firstName, lastName",
        },
        { status: 400 }
      );
    }

    // Check for existing auth user
    console.log("👤 Checking for existing auth user...");
    let authUser = null;
    try {
      const { data: users, error: listError } =
        await supabaseServer.auth.admin.listUsers();
      if (!listError && users) {
        authUser = users.users.find((u) => u.email === email);
        if (authUser) {
          console.log("✅ Found existing auth user:", authUser.id);
        }
      }
    } catch (error) {
      console.log(
        "⚠️ Could not check existing users:",
        error instanceof Error ? error.message : String(error)
      );
    }

    // Create auth user if doesn't exist
    if (!authUser) {
      console.log("➕ Creating new auth user...");
      try {
        const { data: newAuthUser, error: createError } =
          await supabaseServer.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
              first_name: firstName,
              last_name: lastName,
              invitation_pending: true,
            },
          });

        if (createError) {
          throw createError;
        }

        authUser = newAuthUser.user;
        console.log("✅ Auth user created:", authUser.id);
      } catch (createError) {
        console.error("❌ Failed to create auth user:", createError);
        throw new Error(
          `Failed to create auth user: ${
            createError instanceof Error
              ? createError.message
              : String(createError)
          }`
        );
      }
    }

    // Generate invitation token
    const invitationToken = uuidv4();

    // Check for existing invitation
    const { data: existingInvitation, error: lookupError } =
      await supabaseServer
        .from("user_invitations")
        .select("*")
        .eq("email", email)
        .eq("used", false)
        .single();

    let token = invitationToken;

    if (existingInvitation) {
      console.log("♻️ Updating existing invitation");
      token = (existingInvitation as UserInvitation).token;

      const { error: updateError } = await supabaseServer
        .from("user_invitations")
        .update({
          first_name: firstName,
          last_name: lastName,
          user_id: authUser.id,
          created_at: new Date().toISOString(),
        })
        .eq("id", (existingInvitation as UserInvitation).id);

      if (updateError) {
        throw new Error(`Failed to update invitation: ${updateError.message}`);
      }
    } else {
      console.log("➕ Creating new invitation...");
      const { error: insertError } = await supabaseServer
        .from("user_invitations")
        .insert([
          {
            email,
            token,
            user_id: authUser.id,
            first_name: firstName,
            last_name: lastName,
          },
        ]);

      if (insertError) {
        throw new Error(`Failed to create invitation: ${insertError.message}`);
      }
    }

    // Create user record immediately if userData is provided
    let userRecord: UserRecord | null = null;
    if (userData) {
      console.log("🆕 Creating user record immediately...");

      // Ensure cities and communities are arrays of IDs
      const cityIds = Array.isArray(userData.cities)
        ? userData.cities.map((c: { id: string } | string) =>
            typeof c === "object" && c.id ? c.id : c
          )
        : [];
      const communityIds = Array.isArray(userData.communities)
        ? userData.communities.map((c: { id: string } | string) =>
            typeof c === "object" && c.id ? c.id : c
          )
        : [];

      try {
        const { data: insertedUser, error: userError } = await supabaseServer
          .from("users")
          .insert([
            {
              id: authUser.id,
              email: email,
              first_name: firstName,
              last_name: lastName,
              contact_number: userData.contact_number || null,
              permissions: userData.permissions || {},
              cities: cityIds,
              communities: communityIds,
            },
          ])
          .select()
          .single();

        if (userError) {
          // If user already exists, update instead
          if (userError.code === "23505") {
            console.log("User record exists, updating...");
            const { data: updatedUser, error: updateError } =
              await supabaseServer
                .from("users")
                .update({
                  email: email,
                  first_name: firstName,
                  last_name: lastName,
                  contact_number: userData.contact_number || null,
                  permissions: userData.permissions || {},
                  cities: cityIds,
                  communities: communityIds,
                })
                .eq("id", authUser.id)
                .select()
                .single();

            if (updateError) {
              console.warn(
                "⚠️ Failed to update user record:",
                updateError.message
              );
            } else {
              userRecord = updatedUser;
              console.log("✅ User record updated");
            }
          } else {
            console.warn("⚠️ Failed to create user record:", userError.message);
          }
        } else {
          userRecord = insertedUser;
          console.log("✅ User record created");
        }
      } catch (userCreateError) {
        console.warn(
          "⚠️ Error creating user record:",
          userCreateError instanceof Error
            ? userCreateError.message
            : String(userCreateError)
        );
        // Don't fail the whole invitation process for this
      }
    }

    // Create invitation link
    const inviteLink = `${process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN}/auth/setup-password?token=${token}`;

    // Send email
    try {
      const info = await myHometownTransporter.sendMail({
        to: email,
        subject: "Welcome to myHometown - Set Up Your Account",
        html: formattedInviteHtml(email, firstName, lastName, inviteLink),
      });

      console.log("✅ Invitation email sent:", info.messageId);
    } catch (emailError) {
      console.error("❌ Email error:", emailError);
      throw new Error(
        `Failed to send email: ${
          emailError instanceof Error ? emailError.message : String(emailError)
        }`
      );
    }

    return NextResponse.json(
      {
        message: "Invitation sent successfully",
        data: {
          user: {
            id: authUser.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
          },
          userRecord: userRecord, // Include the created user record if available
          token: token,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("💥 Invitation API error:", error);

    return NextResponse.json(
      {
        message: "Error sending invitation",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
