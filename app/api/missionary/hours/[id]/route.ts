import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/util/supabase-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = supabaseServer;
    const { data, error } = await supabase
      .from("missionary_hours")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      period_start_date,
      entryMethod,
      total_hours,
      activities,
      location,
    } = body;

    const supabase = supabaseServer;

    const updateData: any = {};
    if (period_start_date !== undefined)
      updateData.period_start_date = period_start_date;
    if (entryMethod !== undefined)
      updateData.entry_method = entryMethod || "monthly";
    if (total_hours !== undefined)
      updateData.total_hours = parseFloat(total_hours);
    if (activities !== undefined) updateData.activities = activities;
    if (location !== undefined) updateData.location = location;

    const { data, error } = await supabase
      .from("missionary_hours")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to update hours entry" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Hours updated successfully",
      hours: data,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = supabaseServer;
    const { error } = await supabase
      .from("missionary_hours")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to delete hours entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Hours entry deleted successfully" });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
