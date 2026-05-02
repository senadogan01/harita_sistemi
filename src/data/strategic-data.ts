import type { StrategicData } from "@/types/strategic";

export const strategicData: StrategicData = {
  regions: [
    {
      id: "middle-east",
      name: "Orta Doğu",
      view: { longitude: 41.0, latitude: 30.5, zoom: 3.4, pitch: 55, bearing: -15 },
    },
    {
      id: "balkans",
      name: "Balkanlar",
      view: { longitude: 20.5, latitude: 42.5, zoom: 4.2, pitch: 55, bearing: -15 },
    },
    {
      id: "east-africa",
      name: "Doğu Afrika",
      view: { longitude: 40.0, latitude: 2.0, zoom: 4.0, pitch: 55, bearing: -20 },
    },
    {
      id: "europe",
      name: "Avrupa",
      view: { longitude: 18.0, latitude: 50.0, zoom: 3.3, pitch: 50, bearing: -10 },
    },
    {
      id: "america",
      name: "Amerika",
      view: { longitude: -98.0, latitude: 39.0, zoom: 2.6, pitch: 45, bearing: 0 },
    },
  ],

  countries: [
    { id: "turkey", name: "Türkiye", regionId: "middle-east" },
    { id: "israel", name: "İsrail", regionId: "middle-east" },
    { id: "ukraine", name: "Ukrayna", regionId: "europe" },
    { id: "serbia", name: "Sırbistan", regionId: "balkans" },
    { id: "ethiopia", name: "Etiyopya", regionId: "east-africa" },
    { id: "usa", name: "ABD", regionId: "america" },
  ],

  actors: {
    leaders: [
      {
        id: "leader-1",
        name: "Lider (Örnek)",
        regionId: "middle-east",
        countryId: "turkey",
        summary: "Bu alana lider profili analizi ekleyebilirsin.",
        lngLat: { lng: 29.0, lat: 41.0 },
        imageUrl: "",
      },
    ],
    orgs: [
      {
        id: "org-1",
        name: "Örgüt (Örnek)",
        regionId: "middle-east",
        summary: "Bu alana örgüt analizi ekleyebilirsin.",
        lngLat: { lng: 34.47, lat: 31.5 },
        imageUrl: "",
      },
    ],
  },

  events: [
    {
      id: "arab-spring-2011",
      title: "2011 Arap Baharı",
      year: 2011,
      regionId: "middle-east",
      summary:
        "2010 sonu başlayan ve 2011'de bölgeye yayılan protesto dalgası; rejim, güvenlik ve ittifak dengelerini etkiledi.",
      lngLat: { lng: 36.2765, lat: 33.5138 },
    },
    {
      id: "gaza-2023",
      title: "2023 Gazze Savaşı",
      year: 2023,
      regionId: "middle-east",
      summary: "Gazze merkezli çatışmaların bölgesel güvenlik, diplomasi ve insani hatlar üzerindeki etkileri.",
      lngLat: { lng: 34.4668, lat: 31.5017 },
    },
  ],
};
