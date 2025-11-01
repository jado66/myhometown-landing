import { NextRequest, NextResponse } from "next/server";
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

    const createdFolders: string[] = [];
    const errors: { folder: string; error: string }[] = [];

    // Create Utah root folder
    const utahFolder = "Utah/";
    try {
      await createS3Folder(utahFolder);
      createdFolders.push(utahFolder);
    } catch (error) {
      console.error(`Error creating folder ${utahFolder}:`, error);
      errors.push({
        folder: utahFolder,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Create folder structure for each city
    for (const city of cities as City[]) {
      const cityFolder = `Utah/${city.name}/`;

      try {
        await createS3Folder(cityFolder);
        createdFolders.push(cityFolder);

        // Get communities for this city
        const cityCommunities = (communities || []).filter(
          (comm: Community) => comm.city_id === city.id
        );

        // Create folder for each community
        for (const community of cityCommunities) {
          const communityFolder = `Utah/${city.name}/${community.name}/`;

          try {
            await createS3Folder(communityFolder);
            createdFolders.push(communityFolder);

            // Create Website Media folder inside community
            const websiteMediaFolder = `Utah/${city.name}/${community.name}/Website Media/`;

            try {
              await createS3Folder(websiteMediaFolder);
              createdFolders.push(websiteMediaFolder);
            } catch (error) {
              console.error(
                `Error creating folder ${websiteMediaFolder}:`,
                error
              );
              errors.push({
                folder: websiteMediaFolder,
                error: error instanceof Error ? error.message : "Unknown error",
              });
            }
          } catch (error) {
            console.error(`Error creating folder ${communityFolder}:`, error);
            errors.push({
              folder: communityFolder,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
      } catch (error) {
        console.error(`Error creating folder ${cityFolder}:`, error);
        errors.push({
          folder: cityFolder,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      foldersCreated: createdFolders.length,
      folders: createdFolders,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error generating folder structure:", error);
    return NextResponse.json(
      {
        error: "Failed to generate folder structure",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
