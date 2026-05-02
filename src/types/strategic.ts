export type RegionId = string;

export type RegionView = {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
};

export type LngLat = {
  lng: number;
  lat: number;
};

export type StrategicRegion = {
  id: RegionId;
  name: string;
  view: RegionView;
  actors?: Array<{ id: string; name: string }>;
  orgs?: Array<{ id: string; name: string }>;
};

export type StrategicCountry = {
  id: string;
  name: string;
  regionId: RegionId;
};

export type StrategicLeader = {
  id: string;
  name: string;
  regionId: RegionId;
  countryId?: string;
  summary: string;
  lngLat?: LngLat;
  imageUrl?: string;
};

export type StrategicOrg = {
  id: string;
  name: string;
  regionId: RegionId;
  summary: string;
  lngLat?: LngLat;
  imageUrl?: string;
};

export type StrategicEvent = {
  id: string;
  title: string;
  year: number;
  regionId?: RegionId;
  summary: string;
  lngLat?: LngLat;
  imageUrl?: string;
};

export type StrategicData = {
  regions: StrategicRegion[];
  countries: StrategicCountry[];
  actors: {
    leaders: StrategicLeader[];
    orgs: StrategicOrg[];
  };
  events: StrategicEvent[];
};

export type MapItemKind = "leader" | "org" | "event";

export type MapItem = {
  kind: MapItemKind;
  id: string;
  title: string;
  summary: string;
  analysis?: string;
  year?: number;
  regionId?: RegionId;
  lngLat: LngLat;
  imageUrl?: string;
};
