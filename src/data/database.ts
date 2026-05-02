export type DbRegionId = string;

export type DbLngLat = {
  lng: number;
  lat: number;
};

export type DbRegion = {
  id: DbRegionId;
  name: string;
  map: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch?: number;
    bearing?: number;
  };
};

export type DbCountry = {
  id: string;
  name: string;
  regionId: DbRegionId;
  lngLat: DbLngLat;
};

export type DbActorType = "leader" | "org";

export type DbActor = {
  id: string;
  type: DbActorType;
  name: string;
  description: string;
  lngLat: DbLngLat;
  imageUrl?: string;
  analysis?: string;
  relatedIds?: string[];
};

export type DbEvent = {
  id: string;
  date: string;
  title: string;
  analysis: string;
  lngLat: DbLngLat;
  imageUrl?: string;
  relatedIds?: string[];
};

export const db = {
  regions: [
    {
      id: "america",
      name: "Amerika",
      map: { longitude: -85, latitude: 15, zoom: 2.4, pitch: 45, bearing: 0 },
    },
    {
      id: "europe",
      name: "Avrupa",
      map: { longitude: 12, latitude: 50, zoom: 3.7, pitch: 45, bearing: 0 },
    },
    {
      id: "africa",
      name: "Afrika",
      map: { longitude: 20, latitude: 2, zoom: 3.0, pitch: 45, bearing: 0 },
    },
    {
      id: "middle-east",
      name: "Orta Doğu",
      map: { longitude: 44, latitude: 29, zoom: 4.1, pitch: 55, bearing: 0 },
    },
    {
      id: "central-asia",
      name: "Orta Asya",
      map: { longitude: 68, latitude: 44, zoom: 3.9, pitch: 55, bearing: 0 },
    },
    {
      id: "asia",
      name: "Asya",
      map: { longitude: 95, latitude: 30, zoom: 2.7, pitch: 45, bearing: 0 },
    },
  ] as DbRegion[],
  countries: [] as DbCountry[],
  actors: [] as DbActor[],
  events: [] as DbEvent[],
};
