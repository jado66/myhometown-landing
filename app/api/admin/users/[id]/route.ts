import { supabaseServer } from "@/util/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/admin/users/:id -> update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatePayload = {
      email: body.email,
      contact_number: body.contact_number || null,
      permissions: body.permissions || {},
      first_name: body.first_name || null,
      last_name: body.last_name || null,
      cities: Array.isArray(body.cities)
        ? body.cities.map((c: any) => c.id || c)
        : [],
      communities: Array.isArray(body.communities) ? body.communities : [],
    };

    const { data: user, error } = await supabaseServer
      .from("users")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;

    // Fetch expanded city & community details
    const cityIds = Array.isArray(user.cities) ? user.cities : [];
    const communityIds = Array.isArray(user.communities)
      ? user.communities
      : [];

    const [citiesRes, communitiesRes] = await Promise.all([
      cityIds.length
        ? supabaseServer.from("cities").select("*").in("id", cityIds)
        : Promise.resolve({ data: [], error: null }),
      communityIds.length
        ? supabaseServer
            .from("communities")
            .select(
              `
              *,
              city:cities(*)
            `
            )
            .in("id", communityIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const enrichedUser = {
      ...user,
      cities_details: citiesRes.data || [],
      communities_details: communitiesRes.data || [],
    };

    return NextResponse.json(enrichedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/:id -> delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First, try to delete from auth.users using admin API
    // This will cascade to public.users due to the foreign key constraint
    const { error: authError } = await supabaseServer.auth.admin.deleteUser(id);

    // If the user doesn't exist in auth, that's okay - just delete from public.users
    if (authError && authError.code !== "user_not_found") {
      throw authError;
    }

    // If user wasn't in auth (or auth delete failed with user_not_found),
    // explicitly delete from public.users as a fallback
    if (authError?.code === "user_not_found") {
      const { error: publicError } = await supabaseServer
        .from("users")
        .delete()
        .eq("id", id);

      if (publicError) throw publicError;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting user:", err);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
