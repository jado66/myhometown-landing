import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/util/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      period_start_date,
      entryMethod,
      total_hours,
      activities,
      location,
    } = body;

    if (!email || !period_start_date || !total_hours) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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

    // Create hours entry
    const { data, error } = await supabase
      .from("missionary_hours")
      .insert([
        {
          missionary_id: missionary.id,
          period_start_date,
          entry_method: entryMethod || "monthly",
          total_hours: parseFloat(total_hours),
          activities: activities || null,
          location: location || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);

      // Handle unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Hours already recorded for this period" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create hours entry" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Hours logged successfully",
        hours: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
