import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET all CRCs
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("community_resource_centers")
      .select(
        `
        *,
        community:communities!community_resource_centers_community_id_fkey(id, name),
        city:cities!community_resource_centers_city_id_fkey(id, name, state)
      `
      )
      .order("name");

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching CRCs:", error);
    return NextResponse.json(
      { error: "Failed to fetch CRCs" },
      { status: 500 }
    );
  }
}

// POST - Create new CRC
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, city_id, community_id, state, zip } = body;

    const { data, error } = await supabase
      .from("community_resource_centers")
      .insert([
        {
          name,
          address,
          city_id,
          community_id,
          state,
          zip,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating CRC:", error);
    return NextResponse.json(
      { error: "Failed to create CRC" },
      { status: 500 }
    );
  }
}
