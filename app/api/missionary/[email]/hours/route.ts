import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/util/supabase-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email: rawEmail } = await params;
    const email = decodeURIComponent(rawEmail);
    const supabase = supabaseServer;

    // Find missionary by email
    const { data: missionary, error: missionaryError } = await supabase
      .from("missionaries")
      .select("id")
      .eq("email", email)
      .single();

    if (missionaryError || !missionary) {
      return NextResponse.json(
        { error: "Missionary not found" },
        { status: 404 }
      );
    }

    // Fetch hours for this missionary
    const { data: hours, error: hoursError } = await supabase
      .from("missionary_hours")
      .select("*")
      .eq("missionary_id", missionary.id)
      .order("period_start_date", { ascending: false });

    if (hoursError) {
      console.error("Database error:", hoursError);
      return NextResponse.json(
        { error: "Failed to fetch hours" },
        { status: 500 }
      );
    }

    return NextResponse.json({ hours: hours || [] });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
