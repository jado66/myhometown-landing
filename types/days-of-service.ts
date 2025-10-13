export interface PartnerStake {
  id: string;
  name: string;
  liaison_name_1?: string;
  liaison_email_1?: string;
  liaison_phone_1?: string;
  liaison_name_2?: string;
  liaison_email_2?: string;
  liaison_phone_2?: string;
  number_of_projects?: string;
  partner_stake_liaison_title_1?: string;
  partner_stake_liaison_title_2?: string;
}

export interface DayOfService {
  id: string;
  start_date: string;
  end_date: string;
  name: string | null;
  city_id: string;
  created_at: string;
  updated_at: string;
  city_name: string;
  community_id: string;
  community_name: string;
  short_id: string;
  partner_stakes: string[] | null;
  partner_wards: string[] | null;
  partner_stakes_json?: PartnerStake[] | null;
  check_in_location: string | null;
  is_locked: boolean;
}

// Public version without sensitive contact info
export interface DayOfServicePublic {
  id: string;
  start_date: string;
  end_date: string;
  name: string | null;
  city_id: string;
  short_id: string;
  check_in_location: string | null;
  is_locked: boolean;
  partner_stake_names?: string[];
}

// Extended version with location coordinates
export interface DayOfServiceWithLocation extends DayOfService {
  lat: number;
  lng: number;
}

export interface CityWithCommunities {
  id: string;
  name: string;
  state: string;
  country: string;
  visibility: boolean;
  upcoming_events: any[];
  created_at: string;
  updated_at: string;
  communities: any[];
}
