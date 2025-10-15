import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { revalidateTag } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET all cities
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .order("name");

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}

// POST - Create new city
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, state, country, visibility, image_url } = body;

    const { data, error } = await supabase
      .from("cities")
      .insert([
        {
          name,
          state,
          country,
          visibility,
          image_url,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Revalidate the cities cache
    revalidateTag("cities");

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating city:", error);
    return NextResponse.json(
      { error: "Failed to create city" },
      { status: 500 }
    );
  }
}
