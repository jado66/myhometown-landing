import { supabaseServer } from "@/util/supabase-server";
import { VolunteerPageClient } from "@/components/volunteer/volunteer-page-client";
import { detectLocale, getMessages } from "@/i18n/getMessages";

interface Stat {
  value: number;
  label: string;
  suffix?: string;
}

async function fetchVolunteerStats(): Promise<Stat[]> {
  try {
    const { data, error } = await supabaseServer
      .from("site_stats")
      .select("*")
      .eq("is_active", true)
      .like("stat_key", "volunteer_%")
      .order("display_order", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) return await getDefaultVolunteerStats();

    return data.map((stat) => ({
      value: stat.stat_value,
      label: stat.stat_label,
      suffix: stat.stat_suffix || "",
    }));
  } catch (error) {
    console.error("Error fetching volunteer stats:", error);
    return await getDefaultVolunteerStats();
  }
}

async function getDefaultVolunteerStats(): Promise<Stat[]> {
  const locale = await detectLocale();
  const messages = await getMessages(locale);
  const s = messages.stats;
  return [
    { value: 500, label: s.activeVolunteers, suffix: "+" },
    { value: 10000, label: s.hoursServed, suffix: "+" },
    { value: 50, label: s.neighborhoodsHelped, suffix: "+" },
  ];
}

export default async function VolunteerPage() {
  const stats = await fetchVolunteerStats();

  return <VolunteerPageClient stats={stats} />;
}
