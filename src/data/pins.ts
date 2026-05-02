import type { LngLat, RegionId } from "@/types/strategic";

type MapPin = {
  id: string;
  title: string;
  summary: string;
  year: number;
  regionId: RegionId;
  eventId: string;
  lngLat: LngLat;
};

export const testPins: MapPin[] = [
  {
    id: "istanbul",
    title: "İstanbul",
    summary: "Boğaz hattı; lojistik ve stratejik geçiş noktası.",
    year: 2011,
    regionId: "middle-east",
    eventId: "arab-spring-2011",
    lngLat: { lng: 28.9784, lat: 41.0082 },
  },
  {
    id: "kyiv",
    title: "Kyiv",
    summary: "Doğu Avrupa güvenlik dengeleri ve çatışma dinamikleri.",
    year: 2022,
    regionId: "europe",
    eventId: "ukraine-2022",
    lngLat: { lng: 30.5234, lat: 50.4501 },
  },
  {
    id: "gaza",
    title: "Gazze",
    summary: "Çatışma yoğunlaşması; insani koridorlar ve bölgesel gerilim hattı.",
    year: 2023,
    regionId: "middle-east",
    eventId: "gaza-2023",
    lngLat: { lng: 34.4668, lat: 31.5017 },
  },
  {
    id: "damascus",
    title: "Şam",
    summary: "Bölgesel aktörlerin kesiştiği operasyonel alan.",
    year: 2011,
    regionId: "middle-east",
    eventId: "arab-spring-2011",
    lngLat: { lng: 36.2765, lat: 33.5138 },
  },
  {
    id: "odessa",
    title: "Odesa",
    summary: "Karadeniz erişimi ve ticari/askeri koridorlar.",
    year: 2022,
    regionId: "europe",
    eventId: "ukraine-2022",
    lngLat: { lng: 30.7233, lat: 46.4825 },
  },
];
