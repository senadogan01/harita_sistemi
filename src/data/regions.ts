import type { StrategicRegion } from "@/types/strategic";

export const regions: StrategicRegion[] = [
  {
    id: "middle-east",
    name: "Orta Doğu",
    view: {
      longitude: 41.0,
      latitude: 30.5,
      zoom: 3.4,
      pitch: 55,
      bearing: -15,
    },
    actors: [
      { id: "turkey", name: "Türkiye" },
      { id: "israel", name: "İsrail" },
      { id: "iran", name: "İran" },
    ],
    orgs: [
      { id: "hamas", name: "Hamas" },
      { id: "hezbollah", name: "Hizbullah" },
    ],
  },
  {
    id: "europe",
    name: "Avrupa",
    view: {
      longitude: 18.0,
      latitude: 50.0,
      zoom: 3.3,
      pitch: 50,
      bearing: -10,
    },
    actors: [
      { id: "ukraine", name: "Ukrayna" },
      { id: "russia", name: "Rusya" },
      { id: "poland", name: "Polonya" },
    ],
    orgs: [{ id: "nato", name: "NATO" }],
  },
  {
    id: "america",
    name: "Amerika",
    view: {
      longitude: -98.0,
      latitude: 39.0,
      zoom: 2.6,
      pitch: 45,
      bearing: 0,
    },
    actors: [{ id: "usa", name: "ABD" }],
    orgs: [{ id: "cia", name: "CIA" }],
  },
  {
    id: "balkans",
    name: "Balkanlar",
    view: {
      longitude: 20.5,
      latitude: 42.5,
      zoom: 4.2,
      pitch: 55,
      bearing: -15,
    },
    actors: [
      { id: "serbia", name: "Sırbistan" },
      { id: "greece", name: "Yunanistan" },
    ],
    orgs: [{ id: "eu-mission", name: "AB Misyonu (Örnek)" }],
  },
  {
    id: "east-africa",
    name: "Doğu Afrika",
    view: {
      longitude: 40.0,
      latitude: 2.0,
      zoom: 4.0,
      pitch: 55,
      bearing: -20,
    },
    actors: [
      { id: "somalia", name: "Somali" },
      { id: "ethiopia", name: "Etiyopya" },
    ],
    orgs: [{ id: "au", name: "Afrika Birliği" }],
  },
];
