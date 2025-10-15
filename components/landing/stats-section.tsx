import { supabaseServer } from "@/util/supabase-server";
import { AnimatedNumber } from "./animated-number";

interface Stat {
  value: number;
  label: string;
  suffix?: string;
}

async function fetchSiteStats(): Promise<Stat[]> {
  try {
    const { data, error } = await supabaseServer
      .from("site_stats")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    if (!data) return getDefaultStats();

    return data.map((stat) => ({
      value: stat.stat_value,
      label: stat.stat_label,
      suffix: stat.stat_suffix || "",
    }));
  } catch (error) {
    console.error("Error fetching site stats:", error);
    return getDefaultStats();
  }
}

function getDefaultStats(): Stat[] {
  return [
    { value: 15000, label: "Volunteers Engaged", suffix: "+" },
    { value: 2500, label: "Homes Improved", suffix: "+" },
    { value: 7, label: "Cities Served", suffix: "" },
    { value: 50000, label: "Service Hours", suffix: "+" },
  ];
}

export async function StatsSection() {
  const stats = await fetchSiteStats();

  return (
    <section className="pb-16 md:pb-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Impact</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Together, we&apos;re making a real difference in Utah communities
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
