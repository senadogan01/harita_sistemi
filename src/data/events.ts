import type { StrategicEvent } from "@/types/strategic";

export const events: StrategicEvent[] = [
  {
    id: "arab-spring-2011",
    title: "2011 Arap Baharı",
    year: 2011,
    summary: "2010 sonu başlayan ve 2011'de bölgeye yayılan protesto dalgası; rejim, güvenlik ve ittifak dengelerini etkiledi.",
    regionId: "middle-east",
  },
  {
    id: "gaza-2023",
    title: "2023 Gazze Savaşı",
    year: 2023,
    summary: "Gazze merkezli çatışmaların bölgesel güvenlik, diplomasi ve insani hatlar üzerindeki etkileri.",
    regionId: "middle-east",
  },
  {
    id: "ukraine-2022",
    title: "2022 Ukrayna Savaşı",
    year: 2022,
    summary: "Avrupa güvenlik mimarisi, enerji hatları ve savunma planlamasında kırılma yaratan savaş.",
    regionId: "europe",
  },
];
