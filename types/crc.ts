export interface CRC {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  classes: string[];
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
