export interface SiteStat {
  id: string;
  stat_key: string;
  stat_value: number;
  stat_label: string;
  stat_suffix?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
