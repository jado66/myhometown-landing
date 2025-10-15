import { supabaseServer } from "@/util/supabase-server";
import { AnimatedNumber } from "./animated-number";
import { getNamespaceT } from "@/i18n/server";

interface Stat {
  value: number;
  label: string;
  suffix?: string;
}

async function fetchSiteStats(): Promise<Stat[] | null> {
  try {
    const { data, error } = await supabaseServer
      .from("site_stats")
      .select("*")
      .eq("is_active", true)
      .like("stat_key", "home_%")
      .order("display_order", { ascending: true });

    if (error) throw error;

    if (!data) return null;

    return data.map((stat) => ({
      value: stat.stat_value,
      label: stat.stat_label,
      suffix: stat.stat_suffix || "",
    }));
  } catch (error) {
    console.error("Error fetching site stats:", error);
    return null;
  }
}

function getDefaultStats(t: (key: string) => string): Stat[] {
  return [
    { value: 15000, label: t("labels.volunteersEngaged"), suffix: "+" },
    { value: 2500, label: t("labels.homesImproved"), suffix: "+" },
    { value: 7, label: t("labels.citiesServed"), suffix: "" },
    { value: 50000, label: t("labels.serviceHours"), suffix: "+" },
  ];
}

export async function StatsSection() {
  const { t } = await getNamespaceT("home.stats");
  const statsFromDb = await fetchSiteStats();
  const stats =
    statsFromDb && statsFromDb.length ? statsFromDb : getDefaultStats(t);

  return (
    <section className="pb-16 md:pb-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("heading")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("subheading")}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              <p className="mt-2 text-sm md:text-base text-gray-600 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
