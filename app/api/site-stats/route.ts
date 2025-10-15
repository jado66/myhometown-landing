import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/util/supabase-server";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("site_stats")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, stat_value, stat_label, stat_suffix, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Stat ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("site_stats")
      .update({
        stat_value,
        stat_label,
        stat_suffix,
        is_active,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating stat:", error);
    return NextResponse.json(
      { error: "Failed to update stat" },
      { status: 500 }
    );
  }
}
