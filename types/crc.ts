export interface CRC {
  id: number | string;
  name: string;
  city: string;
  address: string;
  state?: string;
  zip?: string;
  phone: string;
  classes?: string[];
  lat: number;
  lng: number;
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
