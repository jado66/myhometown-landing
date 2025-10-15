import { supabase } from "@/util/supabase";
import type { SiteStat } from "@/types/site-stats";

export interface Stat {
  value: number;
  label: string;
  suffix?: string;
}

/**
 * Fetches active site statistics from Supabase
 * @returns Array of formatted stats ordered by display_order
 */
export async function fetchSiteStats(): Promise<Stat[]> {
  try {
    const { data, error } = await supabase
      .from("site_stats")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    if (!data) return getDefaultStats();

    return data.map((stat: SiteStat) => ({
      value: stat.stat_value,
      label: stat.stat_label,
      suffix: stat.stat_suffix || "",
    }));
  } catch (error) {
    console.error("Error fetching site stats:", error);
    return getDefaultStats();
  }
}

/**
 * Returns default fallback stats if database fetch fails
 */
function getDefaultStats(): Stat[] {
  return [
    { value: 15000, label: "Volunteers Engaged", suffix: "+" },
    { value: 2500, label: "Homes Improved", suffix: "+" },
    { value: 7, label: "Cities Served", suffix: "" },
    { value: 50000, label: "Service Hours", suffix: "+" },
  ];
}
