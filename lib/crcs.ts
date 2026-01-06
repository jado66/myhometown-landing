import { CRC } from "@/types/crc";

// Hard-coded supplementary data that's not yet in the database
// Indexed by CRC name for easy lookup
const CRC_SUPPLEMENTARY_DATA: Record<
  string,
  {
    phone?: string;
    classes?: string[];
    lat?: number;
    lng?: number;
  }
> = {
  "West Valley Community Resource Center": {
    phone: "(801) 963-3160",
    classes: ["ESL", "Computer Skills", "Citizenship Prep", "Job Readiness"],
    lat: 40.6916,
    lng: -111.9391,
  },
  "Orem Community Resource Center": {
    phone: "(801) 229-7070",
    classes: ["ESL", "Piano Lessons", "Art Classes", "Youth Programs"],
    lat: 40.3133,
    lng: -111.7185,
  },
  "Layton Community Resource Center": {
    phone: "(801) 547-8888",
    classes: ["ESL", "Music Lessons", "Computer Literacy", "Family Activities"],
    lat: 41.0939,
    lng: -112.0133,
  },
  "Ogden Community Resource Center": {
    phone: "(801) 399-8200",
    classes: [
      "ESL",
      "Vocational Training",
      "Health & Wellness",
      "Youth Sports",
    ],
    lat: 41.223,
    lng: -111.9738,
  },
  "Salt Lake City Community Resource Center": {
    phone: "(801) 240-7777",
    classes: ["ESL", "Art Programs", "Music Classes", "Community Events"],
    lat: 40.7608,
    lng: -111.891,
  },
  "Provo Community Resource Center": {
    phone: "(801) 852-6600",
    classes: ["ESL", "Computer Training", "Youth Activities", "Family Support"],
    lat: 40.2338,
    lng: -111.6585,
  },
  "Taylorsville Community Resource Center": {
    phone: "(801) 963-5400",
    classes: ["ESL", "Job Skills", "Health Education", "Recreation Programs"],
    lat: 40.6677,
    lng: -111.9388,
  },
  "Kearns Community Resource Center": {
    phone: "(801) 968-2867",
    classes: ["ESL", "Literacy Programs", "Youth Services", "Family Classes"],
    lat: 40.6596,
    lng: -111.9963,
  },
  "Murray Community Resource Center": {
    phone: "(801) 264-2614",
    classes: [
      "ESL",
      "Technology Training",
      "Arts & Crafts",
      "Community Wellness",
    ],
    lat: 40.6669,
    lng: -111.888,
  },
  "Sandy Community Resource Center": {
    phone: "(801) 568-7100",
    classes: ["ESL", "Music Lessons", "Computer Classes", "Youth Programs"],
    lat: 40.5649,
    lng: -111.8389,
  },
};

/**
 * Merges database CRC data with hard-coded supplementary data
 */
export function mergeCRCData(dbCRCs: CRC[]): CRC[] {
  return dbCRCs.map((crc) => {
    const supplementary = CRC_SUPPLEMENTARY_DATA[crc.name] || {};

    return {
      ...crc,
      ...supplementary,
    };
  });
}

/**
 * Fetches CRCs from the API and merges with supplementary data
 */
export async function fetchCRCs(): Promise<CRC[]> {
  try {
    const response = await fetch("/api/crcs", {
      cache: "no-store", // Always get fresh data
    });

    if (!response.ok) {
      throw new Error("Failed to fetch CRCs");
    }

    const dbCRCs = await response.json();
    return mergeCRCData(dbCRCs);
  } catch (error) {
    console.error("Error fetching CRCs:", error);
    return [];
  }
}

/**
 * Server-side function to fetch CRCs directly from Supabase
 */
export async function fetchCRCsServer(): Promise<CRC[]> {
  try {
    const { supabaseServer } = await import("@/util/supabase-server");

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

    return mergeCRCData(data || []);
  } catch (error) {
    console.error("Error fetching CRCs from server:", error);
    return [];
  }
}

/**
 * Convert CRC name to slug format
 */
export function createCRCSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Server-side function to fetch a single CRC by slug
 */
export async function fetchCRCBySlugServer(slug: string): Promise<CRC | null> {
  try {
    const allCRCs = await fetchCRCsServer();
    return allCRCs.find((crc) => createCRCSlug(crc.name) === slug) || null;
  } catch (error) {
    console.error("Error fetching CRC by slug:", error);
    return null;
  }
}

/**
 * Generate URL for a CRC classes page
 */
export function getCRCClassesUrl(crc: CRC): string {
  const slug = createCRCSlug(crc.name);
  return `/classes/${slug}`;
}

/**
 * Get all CRC slugs for static generation
 */
export async function getAllCRCSlugs(): Promise<string[]> {
  try {
    const allCRCs = await fetchCRCsServer();
    return allCRCs.map((crc) => createCRCSlug(crc.name));
  } catch (error) {
    console.error("Error getting CRC slugs:", error);
    return [];
  }
}
