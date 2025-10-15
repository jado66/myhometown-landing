import { supabaseServer } from "@/util/supabase-server";
import { unstable_cache } from "next/cache";

export interface City {
  id: string;
  name: string;
  state: string;
  country: string;
  visibility: boolean;
  upcoming_events: any[];
  created_at: string;
  updated_at: string;
  image_url: string;
}

export interface CitySelectOption {
  id: string;
  name: string;
  state: string;
  visibility?: boolean;
}

export async function getAllCities(): Promise<City[]> {
  try {
    const { data, error } = await supabaseServer
      .from("cities")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching all cities:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching all cities:", error);
    return [];
  }
}

export async function getAllCitySelectOptions(): Promise<CitySelectOption[]> {
  try {
    const { data, error } = await supabaseServer
      .from("cities")
      .select("id, name, state, visibility")
      .order("name");

    if (error) {
      console.error("Error fetching all city options:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching all city options:", error);
    return [];
  }
}

// Cached version for layout (revalidates every 60 seconds or on-demand)
export const getCachedAllCitySelectOptions = unstable_cache(
  getAllCitySelectOptions,
  ["all-city-select-options"],
  { revalidate: 60, tags: ["cities"] }
);

export async function getCities(): Promise<City[]> {
  try {
    const { data, error } = await supabaseServer
      .from("cities")
      .select("*")
      .eq("visibility", true)
      .order("name");

    if (error) {
      console.error("Error fetching cities:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
}

export async function getCitySelectOptions(): Promise<CitySelectOption[]> {
  try {
    const { data, error } = await supabaseServer
      .from("cities")
      .select("id, name, state")
      .eq("visibility", true)
      .order("name");

    if (error) {
      console.error("Error fetching city options:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching city options:", error);
    return [];
  }
}

// Cached version for layout (revalidates every 60 seconds or on-demand)
export const getCachedCitySelectOptions = unstable_cache(
  getCitySelectOptions,
  ["city-select-options"],
  { revalidate: 60, tags: ["cities"] }
);

export async function getCityById(id: string): Promise<City | null> {
  try {
    const { data, error } = await supabaseServer
      .from("cities")
      .select("*")
      .eq("id", id)
      .eq("visibility", true)
      .single();

    if (error) {
      console.error("Error fetching city:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching city:", error);
    return null;
  }
}

export async function getCitiesByState(state: string): Promise<City[]> {
  try {
    const { data, error } = await supabaseServer
      .from("cities")
      .select("*")
      .eq("state", state)
      .eq("visibility", true)
      .order("name");

    if (error) {
      console.error("Error fetching cities by state:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching cities by state:", error);
    return [];
  }
}
