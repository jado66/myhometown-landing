import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    const { data, error } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json(data);
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
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting user:", err);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
