import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET all days of service with community and city data
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("days_of_service")
      .select(
        `
        *,
        city:cities!day_of_service_city_id_fkey(id, name, state),
        community:communities!day_of_service_community_id_fkey(id, name)
      `
      )
      .order("end_date", { ascending: false });

    if (error) {
      console.error("Error fetching days of service:", error);
      return NextResponse.json(
        { error: "Failed to fetch days of service" },
        { status: 500 }
      );
    }

    // Transform the data to flatten city and community names
    const transformedData = (data || []).map((day: any) => ({
      ...day,
      city_name: day.city?.name || "",
      community_name: day.community?.name || "",
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error in days of service API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new day of service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      start_date,
      end_date,
      check_in_location,
      city_id,
      community_id,
    } = body;

    // Validate required fields
    if (!start_date || !end_date || !city_id || !community_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a short ID for the day of service
    const short_id = uuidv4().split("-")[0];

    const { data, error } = await supabase
      .from("days_of_service")
      .insert([
        {
          name,
          start_date,
          end_date,
          check_in_location,
          city_id,
          community_id,
          short_id,
          partner_stakes: [],
          partner_wards: [],
          partner_stakes_json: [],
          is_locked: false,
        },
      ])
      .select(
        `
        *,
        city:cities!day_of_service_city_id_fkey(id, name, state),
        community:communities!day_of_service_community_id_fkey(id, name)
      `
      )
      .single();

    if (error) {
      console.error("Error creating day of service:", error);
      return NextResponse.json(
        { error: "Failed to create day of service" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating day of service:", error);
    return NextResponse.json(
      { error: "Failed to create day of service" },
      { status: 500 }
    );
  }
}
