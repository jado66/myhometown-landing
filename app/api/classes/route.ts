import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET all classes with their related data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get("communityId");

    let query = supabase
      .from("classes")
      .select(
        `
        id,
        mongo_id,
        title,
        description,
        start_date,
        end_date,
        location,
        capacity,
        show_capacity,
        icon,
        class_banner_url,
        start_time,
        end_time,
        meeting_days,
        is_waitlist_enabled,
        waitlist_capacity,
        visibility,
        created_at,
        updated_at,
        community:communities!classes_community_id_fkey(
          id,
          name,
          community_resource_centers!community_resource_centers_community_id_fkey(
            id,
            name,
            address,
            state,
            zip,
            city:cities!community_resource_centers_city_id_fkey(id, name, state)
          )
        )
      `
      )
      .eq("visibility", true)
      .order("start_date", { ascending: true });

    // Filter by community if specified
    if (communityId) {
      query = query.eq("community_id", communityId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching classes:", error);
      return NextResponse.json(
        { error: "Failed to fetch classes" },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedClasses =
      data?.map((classItem) => ({
        id: classItem.id,
        mongoId: classItem.mongo_id,
        title: classItem.title,
        description: classItem.description,
        startDate: classItem.start_date,
        endDate: classItem.end_date,
        location: classItem.location,
        capacity: classItem.capacity,
        showCapacity: classItem.show_capacity,
        icon: classItem.icon,
        classBannerUrl: classItem.class_banner_url,
        startTime: classItem.start_time,
        endTime: classItem.end_time,
        meetingDays: classItem.meeting_days,
        isWaitlistEnabled: classItem.is_waitlist_enabled,
        waitlistCapacity: classItem.waitlist_capacity,
        visibility: classItem.visibility,
        createdAt: classItem.created_at,
        updatedAt: classItem.updated_at,
        community: classItem.community,
        category: null, // No categories for now
        // Derived fields for compatibility with existing components
        instructor: "TBD", // This will need to be added to your schema if needed
        schedule:
          classItem.meeting_days?.join(", ") +
          ` ${classItem.start_time} - ${classItem.end_time}`,
        duration: `${classItem.start_date} to ${classItem.end_date}`,
        enrolled: 0, // This will need enrollment tracking
        level: "all-levels", // This will need to be added to schema if needed
        ageGroup: "All Ages", // This will need to be added to schema if needed
        crcId:
          classItem.community?.[0]?.community_resource_centers?.[0]?.id?.toString() ||
          "",
      })) || [];

    return NextResponse.json(transformedClasses);
  } catch (error) {
    console.error("Error in classes API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new class
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      startDate,
      endDate,
      location,
      capacity,
      showCapacity = true,
      icon,
      classBannerUrl,
      startTime,
      endTime,
      meetingDays,
      isWaitlistEnabled = false,
      waitlistCapacity = 0,
      visibility = true,
      communityId,
      categoryId,
    } = body;

    // Generate a unique mongo_id for new classes (for backward compatibility)
    const mongoId = `class_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;

    const { data, error } = await supabase
      .from("classes")
      .insert({
        mongo_id: mongoId,
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        location,
        capacity,
        show_capacity: showCapacity,
        icon,
        class_banner_url: classBannerUrl,
        start_time: startTime,
        end_time: endTime,
        meeting_days: meetingDays,
        is_waitlist_enabled: isWaitlistEnabled,
        waitlist_capacity: waitlistCapacity,
        visibility,
        community_id: communityId,
        category_id: categoryId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating class:", error);
      return NextResponse.json(
        { error: "Failed to create class" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in class creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
