import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET all communities with city data
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("communities")
      .select(
        `
        *,
        city:cities!communities_city_id_fkey(id, name, state, country)
      `
      )
      .order("name");

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching communities:", error);
    return NextResponse.json(
      { error: "Failed to fetch communities" },
      { status: 500 }
    );
  }
}

// POST - Create new community
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, city_id, state, country, visibility } = body;

    const { data, error } = await supabase
      .from("communities")
      .insert([
        {
          name,
          city_id,
          state,
          country,
          visibility,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating community:", error);
    return NextResponse.json(
      { error: "Failed to create community" },
      { status: 500 }
    );
  }
}
