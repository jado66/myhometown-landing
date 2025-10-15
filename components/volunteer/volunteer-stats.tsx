import { supabaseServer } from "@/util/supabase-server";
import { AnimatedNumber } from "@/components/landing/animated-number";

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
      .eq("page", "volunteer")
      .order("display_order", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) return getDefaultVolunteerStats();

    return data.map((stat) => ({
      value: stat.stat_value,
      label: stat.stat_label,
      suffix: stat.stat_suffix || "",
    }));
  } catch (error) {
    console.error("Error fetching volunteer stats:", error);
    return getDefaultVolunteerStats();
  }
}

function getDefaultVolunteerStats(): Stat[] {
  return [
    { value: 500, label: "Active Volunteers", suffix: "+" },
    { value: 10000, label: "Hours Served", suffix: "+" },
    { value: 50, label: "Neighborhoods Helped", suffix: "+" },
  ];
}

export async function VolunteerStats() {
  const stats = await fetchVolunteerStats();

  return (
    <section className="py-16 px-4 bg-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                <div className="text-lg font-bold text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
