import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// PUT - Update CRC
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, address, city_id, community_id, state, zip } = body;

    const { data, error } = await supabase
      .from("community_resource_centers")
      .update({
        name,
        address,
        city_id,
        community_id,
        state,
        zip,
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating CRC:", error);
    return NextResponse.json(
      { error: "Failed to update CRC" },
      { status: 500 }
    );
  }
}

// DELETE - Delete CRC
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from("community_resource_centers")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ message: "CRC deleted successfully" });
  } catch (error) {
    console.error("Error deleting CRC:", error);
    return NextResponse.json(
      { error: "Failed to delete CRC" },
      { status: 500 }
    );
  }
}
