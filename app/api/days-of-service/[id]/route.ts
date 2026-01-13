import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// PATCH - Update day of service
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: any = {};

    // Only include fields that are provided
    if (body.name !== undefined) updateData.name = body.name;
    if (body.start_date !== undefined) updateData.start_date = body.start_date;
    if (body.end_date !== undefined) updateData.end_date = body.end_date;
    if (body.check_in_location !== undefined)
      updateData.check_in_location = body.check_in_location;
    if (body.is_locked !== undefined) updateData.is_locked = body.is_locked;
    if (body.city_id !== undefined) updateData.city_id = body.city_id;
    if (body.community_id !== undefined)
      updateData.community_id = body.community_id;

    const { data, error } = await supabase
      .from("days_of_service")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        city:cities!day_of_service_city_id_fkey(id, name, state),
        community:communities!day_of_service_community_id_fkey(id, name)
      `
      )
      .single();

    if (error) {
      console.error("Error updating day of service:", error);
      return NextResponse.json(
        { error: "Failed to update day of service" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating day of service:", error);
    return NextResponse.json(
      { error: "Failed to update day of service" },
      { status: 500 }
    );
  }
}

// DELETE - Delete day of service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from("days_of_service")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting day of service:", error);
      return NextResponse.json(
        { error: "Failed to delete day of service" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting day of service:", error);
    return NextResponse.json(
      { error: "Failed to delete day of service" },
      { status: 500 }
    );
  }
}
