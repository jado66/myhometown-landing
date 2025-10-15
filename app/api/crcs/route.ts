import { NextResponse } from "next/server";
import { supabaseServer } from "@/util/supabase-server";

// GET all CRCs with city and community info (public endpoint)
export async function GET() {
  try {
    const { data, error } = await supabaseServer
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
