export interface City {
  id: string; // UUID
  name: string;
  state: string;
  country: string;
  visibility: boolean;
  image_url?: string;
}

export interface Community {
  id: string; // UUID
  name: string;
  city_id: string; // UUID
  state: string;
  country: string;
  visibility: boolean;
  city?: City;
}

export interface CRC {
  id: number;
  community_id: string;
  name: string;
  address: string;
  city_id: string;
  state: string;
  zip: string;
  created_at: string;
  updated_at: string;
  community?: Community;
  city?: City;
}
