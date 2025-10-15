import { supabaseServer } from "@/util/supabase-server";

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
      .eq("page", "days-of-service")
      .order("display_order", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) return getDefaultDosStats();

    return data.map((stat) => ({
      value: stat.stat_value,
      label: stat.stat_label,
      suffix: stat.stat_suffix || "",
    }));
  } catch (error) {
    console.error("Error fetching days of service stats:", error);
    return getDefaultDosStats();
  }
}

function getDefaultDosStats(): Stat[] {
  return [
    { value: 500, label: "Active Volunteers", suffix: "+" },
    { value: 50, label: "Events This Year", suffix: "+" },
    { value: 10000, label: "Hours Served", suffix: "+" },
  ];
}

export async function DosStats() {
  const stats = await fetchDosStats();

  return (
    <div className="grid grid-cols-3 gap-8 mt-12 text-center">
      {stats.map((stat, index) => (
        <div key={index}>
          <div className="text-4xl font-bold text-primary mb-2">
            {stat.value.toLocaleString()}
            {stat.suffix}
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
