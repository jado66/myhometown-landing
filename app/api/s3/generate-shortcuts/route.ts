import { NextRequest, NextResponse } from "next/server";
import { createOrganizedShortcuts } from "@/lib/s3-shortcuts";
import { createS3Folder } from "@/lib/s3-operations";
import { supabaseServer } from "@/util/supabase-server";

interface City {
  id: string;
  name: string;
  state: string;
  country: string;
}

interface Community {
  id: string;
  name: string;
  city_id: string;
}

export async function POST(request: NextRequest) {
  try {
    // Fetch all cities from Utah
    const { data: cities, error: citiesError } = await supabaseServer
      .from("cities")
      .select("id, name, state, country")
      .eq("state", "Utah")
      .eq("country", "USA");

    if (citiesError) {
      console.error("Error fetching cities:", citiesError);
      return NextResponse.json(
        { error: "Failed to fetch cities" },
        { status: 500 }
      );
    }

    if (!cities || cities.length === 0) {
      return NextResponse.json(
        { error: "No cities found for Utah" },
        { status: 404 }
      );
    }

    // Fetch all communities for these cities
    const cityIds = cities.map((city: City) => city.id);
    const { data: communities, error: communitiesError } = await supabaseServer
      .from("communities")
      .select("id, name, city_id")
      .in("city_id", cityIds);

    if (communitiesError) {
      console.error("Error fetching communities:", communitiesError);
      return NextResponse.json(
        { error: "Failed to fetch communities" },
        { status: 500 }
      );
    }

    // Create Shortcuts folder structure
    await createS3Folder("Shortcuts/");
    await createS3Folder("Shortcuts/Cities/");
    await createS3Folder("Shortcuts/Communities/");

    // Prepare city shortcuts
    const cityShortcuts = (cities as City[]).map((city) => ({
      name: city.name,
      path: `Utah/${city.name}/`,
    }));

    // Prepare community shortcuts with city context
    const communityShortcuts = (communities || []).map(
      (community: Community) => {
        const city = cities.find((c: City) => c.id === community.city_id);
        return {
          name: community.name,
          cityName: city?.name || "Unknown",
          path: `Utah/${city?.name}/${community.name}/`,
        };
      }
    );

    // Create all shortcuts
    const result = await createOrganizedShortcuts(
      cityShortcuts,
      communityShortcuts
    );

    return NextResponse.json({
      success: true,
      shortcutsCreated: result.created,
      cities: cityShortcuts.length,
      communities: communityShortcuts.length,
    });
  } catch (error) {
    console.error("Error generating shortcuts:", error);
    return NextResponse.json(
      {
        error: "Failed to generate shortcuts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
