export interface CRC {
  id: number | string;
  name: string;
  // Database fields
  city_id?: string;
  community_id?: string;
  state?: string;
  zip?: string;
  created_at?: string;
  updated_at?: string;
  // Joined data
  city?: {
    id: string;
    name: string;
    state: string;
  };
  community?: {
    id: string;
    name: string;
  };
  // For backwards compatibility and display
  address: string;
  // Hard-coded fields (not in database yet)
  phone?: string;
  classes?: string[];
  lat?: number;
  lng?: number;
}

export interface CRCWithDistance extends CRC {
  distance: number;
}

export interface PopularClass {
  name: string;
  description: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
}
