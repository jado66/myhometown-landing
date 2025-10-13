import { supabase } from "@/util/supabase";
import {
  DayOfService,
  CityWithCommunities,
  DayOfServicePublic,
  PartnerStake,
} from "@/types/days-of-service";

export async function getDaysOfServiceByCity(
  cityId: string
): Promise<DayOfService[]> {
  try {
    const { data, error } = await supabase
      .from("days_of_service")
      .select("*")
      .eq("city_id", cityId)
      .gte("end_date", new Date().toISOString().split("T")[0]) // Only future/current events
      .order("start_date", { ascending: true });

    if (error) {
      console.error("Error fetching days of service:", error);
      // If table doesn't exist yet, return empty array
      if (error.message?.includes("does not exist")) {
        return [];
      }
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching days of service:", error);
    return [];
  }
}

export async function getAllDaysOfService(): Promise<DayOfService[]> {
  try {
    const { data, error } = await supabase
      .from("days_of_service")
      .select("*")
      .gte("end_date", new Date().toISOString().split("T")[0]) // Only future/current events
      .order("start_date", { ascending: true });

    if (error) {
      console.error("Error fetching all days of service:", error);
      // If table doesn't exist yet, return empty array
      if (error.message?.includes("does not exist")) {
        return [];
      }
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching all days of service:", error);
    return [];
  }
}

export async function getCitiesWithCommunities(): Promise<
  CityWithCommunities[]
> {
  try {
    // First try the view, if it doesn't exist, fall back to cities table
    const { data, error } = await supabase
      .from("cities_with_communities")
      .select("*")
      .eq("visibility", true)
      .order("name");

    // If view doesn't exist, fallback to cities table
    if (error && error.message?.includes("does not exist")) {
      const { data: citiesData, error: citiesError } = await supabase
        .from("cities")
        .select(
          "id, name, state, country, visibility, upcoming_events, created_at, updated_at"
        )
        .eq("visibility", true)
        .order("name");

      if (citiesError) {
        console.error("Error fetching cities:", citiesError);
        return [];
      }

      // Transform to match expected interface
      return (citiesData || []).map((city) => ({
        ...city,
        communities: [],
      }));
    }

    if (error) {
      console.error("Error fetching cities with communities:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching cities with communities:", error);
    return [];
  }
}

// Public version that only fetches safe data for homepage display
export async function getDaysOfServicePublic(): Promise<DayOfServicePublic[]> {
  try {
    const { data, error } = await supabase
      .from("days_of_service")
      .select(
        "id, start_date, end_date, name, city_id, short_id, check_in_location, is_locked, partner_stakes_json"
      )
      .gte("start_date", new Date().toISOString().split("T")[0]) // Only future/current events
      .order("start_date", { ascending: true });

    if (error) {
      console.error("Error fetching public days of service:", error);
      // If table doesn't exist yet, return empty array
      if (error.message?.includes("does not exist")) {
        return [];
      }
      return [];
    }

    // Transform data to remove contact info and extract only stake names
    return (data || []).map((day) => ({
      id: day.id,
      start_date: day.start_date,
      end_date: day.end_date,
      name: day.name,
      city_id: day.city_id,
      short_id: day.short_id,
      check_in_location: day.check_in_location,
      is_locked: day.is_locked,
      partner_stake_names: day.partner_stakes_json
        ? day.partner_stakes_json.map((stake: PartnerStake) => stake.name)
        : undefined,
    }));
  } catch (error) {
    console.error("Error fetching public days of service:", error);
    return [];
  }
}

// Public version that fetches safe data by city for homepage display
export async function getDaysOfServicePublicByCity(
  cityId: string
): Promise<DayOfServicePublic[]> {
  try {
    const { data, error } = await supabase
      .from("days_of_service")
      .select(
        "id, start_date, end_date, name, city_id, short_id, check_in_location, is_locked, partner_stakes_json"
      )
      .eq("city_id", cityId)
      .gte("start_date", new Date().toISOString().split("T")[0]) // Only future/current events
      .order("start_date", { ascending: true });

    if (error) {
      console.error("Error fetching public days of service by city:", error);
      // If table doesn't exist yet, return empty array
      if (error.message?.includes("does not exist")) {
        return [];
      }
      return [];
    }

    // Transform data to remove contact info and extract only stake names
    return (data || []).map((day) => ({
      id: day.id,
      start_date: day.start_date,
      end_date: day.end_date,
      name: day.name,
      city_id: day.city_id,
      short_id: day.short_id,
      check_in_location: day.check_in_location,
      is_locked: day.is_locked,
      partner_stake_names: day.partner_stakes_json
        ? day.partner_stakes_json.map((stake: PartnerStake) => stake.name)
        : undefined,
    }));
  } catch (error) {
    console.error("Error fetching public days of service by city:", error);
    return [];
  }
}
