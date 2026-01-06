import { supabaseServer } from "@/util/supabase-server";

export interface DatabaseClass {
  id: string;
  mongoId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  showCapacity: boolean;
  icon?: string;
  classBannerUrl?: string;
  startTime: string;
  endTime: string;
  meetingDays: string[];
  isWaitlistEnabled: boolean;
  waitlistCapacity: number;
  visibility: boolean;
  createdAt: string;
  updatedAt: string;
  community?: {
    id: string;
    name: string;
    community_resource_centers?: Array<{
      id: number;
      name: string;
      address: string;
      state: string;
      zip: string;
      city?: {
        id: string;
        name: string;
        state: string;
      };
    }>;
  };
  category?: {
    id: string;
    name: string;
    color: string;
  };
  // Compatibility fields for existing components
  instructor: string;
  schedule: string;
  duration: string;
  enrolled: number;
  level: "beginner" | "intermediate" | "advanced" | "all-levels";
  ageGroup: string;
  crcId: string;
}

export interface ClassFilters {
  communityId?: string;
  categoryId?: string;
  visibility?: boolean;
}

/**
 * Fetches classes from the database with optional filtering
 */
export async function fetchClasses(
  filters: ClassFilters = {}
): Promise<DatabaseClass[]> {
  try {
    let query = supabaseServer
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
      .order("start_date", { ascending: true });

    // Apply filters
    if (filters.communityId) {
      query = query.eq("community_id", filters.communityId);
    }

    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }

    if (filters.visibility !== undefined) {
      query = query.eq("visibility", filters.visibility);
    } else {
      // Default to only visible classes
      query = query.eq("visibility", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching classes:", error);
      return [];
    }

    // Transform the data to match the expected format
    return (
      data?.map((classItem): DatabaseClass => {
        const community = Array.isArray(classItem.community)
          ? classItem.community[0]
          : classItem.community;
        const crc = community?.community_resource_centers?.[0];

        return {
          id: classItem.id,
          mongoId: classItem.mongo_id,
          title: classItem.title,
          description: classItem.description || "",
          startDate: classItem.start_date,
          endDate: classItem.end_date,
          location: classItem.location || "",
          capacity: classItem.capacity,
          showCapacity: classItem.show_capacity ?? true,
          icon: classItem.icon,
          classBannerUrl: classItem.class_banner_url,
          startTime: classItem.start_time,
          endTime: classItem.end_time,
          meetingDays: classItem.meeting_days || [],
          isWaitlistEnabled: classItem.is_waitlist_enabled ?? false,
          waitlistCapacity: classItem.waitlist_capacity ?? 0,
          visibility: classItem.visibility ?? true,
          createdAt: classItem.created_at,
          updatedAt: classItem.updated_at,
          community: community || undefined,
          category: undefined, // No categories for now
          // Compatibility fields for existing components
          instructor: "TBD", // This will need to be added to your schema if needed
          schedule: `${classItem.meeting_days?.join(", ")} ${
            classItem.start_time
          } - ${classItem.end_time}`,
          duration: `${classItem.start_date} to ${classItem.end_date}`,
          enrolled: 0, // This will need enrollment tracking
          level: "all-levels", // This will need to be added to schema if needed
          ageGroup: "All Ages", // This will need to be added to schema if needed
          crcId: crc?.id?.toString() || "",
        };
      }) || []
    );
  } catch (error) {
    console.error("Error in fetchClasses:", error);
    return [];
  }
}

/**
 * Fetches classes for a specific CRC
 */
export async function fetchClassesByCRC(
  crcId: string
): Promise<DatabaseClass[]> {
  try {
    // First, get the community ID for this CRC
    const { data: crc, error: crcError } = await supabaseServer
      .from("community_resource_centers")
      .select("community_id")
      .eq("id", crcId)
      .single();

    if (crcError || !crc?.community_id) {
      console.error("Error fetching CRC community:", crcError);
      return [];
    }

    return fetchClasses({ communityId: crc.community_id });
  } catch (error) {
    console.error("Error in fetchClassesByCRC:", error);
    return [];
  }
}

/**
 * Maps database category name to mock category type for compatibility
 */
export function mapCategoryToMockType(
  categoryName: string
): "education" | "arts" | "fitness" | "technology" | "life-skills" {
  const mapping: Record<
    string,
    "education" | "arts" | "fitness" | "technology" | "life-skills"
  > = {
    Education: "education",
    ESL: "education",
    GED: "education",
    Citizenship: "education",
    Arts: "arts",
    Music: "arts",
    Photography: "arts",
    Painting: "arts",
    Fitness: "fitness",
    Yoga: "fitness",
    Exercise: "fitness",
    Technology: "technology",
    Computer: "technology",
    Programming: "technology",
    "Life Skills": "life-skills",
    Cooking: "life-skills",
    Financial: "life-skills",
    Parenting: "life-skills",
  };

  // Try exact match first
  if (mapping[categoryName]) {
    return mapping[categoryName];
  }

  // Try partial match
  for (const [key, value] of Object.entries(mapping)) {
    if (categoryName.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Default to education
  return "education";
}
