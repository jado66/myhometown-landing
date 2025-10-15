import { Suspense } from "react";
import { supabaseServer } from "@/util/supabase-server";
import { DaysOfServicePageClient } from "@/components/days-of-service/dos-page-client";
import { detectLocale, getMessages } from "@/i18n/getMessages";

interface Stat {
  value: number;
  label: string;
  suffix?: string;
}

async function fetchDosStats(): Promise<Stat[]> {
  try {
    const { data, error } = await supabaseServer
      .from("site_stats")
      .select("*")
      .eq("is_active", true)
      .like("stat_key", "dos_%")
      .order("display_order", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) return await getDefaultDosStats();

    return data.map((stat) => ({
      value: stat.stat_value,
      label: stat.stat_label,
      suffix: stat.stat_suffix || "",
    }));
  } catch (error) {
    console.error("Error fetching days of service stats:", error);
    return await getDefaultDosStats();
  }
}

async function getDefaultDosStats(): Promise<Stat[]> {
  const locale = await detectLocale();
  const messages = await getMessages(locale);
  const s = messages.stats;
  return [
    { value: 500, label: s.activeVolunteers, suffix: "+" },
    { value: 50, label: s.eventsThisYear, suffix: "+" },
    { value: 10000, label: s.hoursServed, suffix: "+" },
  ];
}

export default async function DaysOfServicePage() {
  const stats = await fetchDosStats();

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <DaysOfServicePageClient stats={stats} />
    </Suspense>
  );
}
