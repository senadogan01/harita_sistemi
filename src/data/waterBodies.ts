// Büyük su kütleleri veritabanı - koordinatları ve Türkçe isimleri
export type WaterBody = {
  id: string;
  name: string;       // Orijinal isim (OSM/Nominatim)
  turkishName: string; // Türkçe gösterim ismi
  type: "ocean" | "sea" | "lake" | "bay" | "strait" | "river";
  center: { lat: number; lng: number };
  // Yaklaşık sınırlar (opsiyonel, gelecekte kullanılabilir)
  bounds?: { north: number; south: number; east: number; west: number };
};

export const WATER_BODIES: WaterBody[] = [
  // Okyanuslar
  { id: "pacific", name: "Pacific Ocean", turkishName: "Pasifik Okyanusu", type: "ocean", center: { lat: 0, lng: -165 } },
  { id: "atlantic", name: "Atlantic Ocean", turkishName: "Atlas Okyanusu", type: "ocean", center: { lat: 10, lng: -30 } },
  { id: "indian", name: "Indian Ocean", turkishName: "Hint Okyanusu", type: "ocean", center: { lat: -20, lng: 80 } },
  { id: "southern", name: "Southern Ocean", turkishName: "Güney Okyanusu", type: "ocean", center: { lat: -65, lng: 0 } },
  { id: "arctic", name: "Arctic Ocean", turkishName: "Arktik Okyanusu", type: "ocean", center: { lat: 85, lng: 0 } },

  // Denizler
  { id: "mediterranean", name: "Mediterranean Sea", turkishName: "Akdeniz", type: "sea", center: { lat: 35, lng: 18 } },
  { id: "black_sea", name: "Black Sea", turkishName: "Karadeniz", type: "sea", center: { lat: 43, lng: 35 } },
  { id: "red_sea", name: "Red Sea", turkishName: "Kızıldeniz", type: "sea", center: { lat: 20, lng: 38 } },
  { id: "arabian_sea", name: "Arabian Sea", turkishName: "Arap Denizi", type: "sea", center: { lat: 15, lng: 65 } },
  { id: "persian_gulf", name: "Persian Gulf", turkishName: "Basra Körfezi", type: "bay", center: { lat: 26, lng: 52 } },
  { id: "gulf_of_aden", name: "Gulf of Aden", turkishName: "Aden Körfezi", type: "bay", center: { lat: 12, lng: 48 } },
  { id: "aegean", name: "Aegean Sea", turkishName: "Ege Denizi", type: "sea", center: { lat: 38, lng: 25 } },
  { id: "baltic", name: "Baltic Sea", turkishName: "Baltık Denizi", type: "sea", center: { lat: 58, lng: 20 } },
  { id: "north_sea", name: "North Sea", turkishName: "Kuzey Denizi", type: "sea", center: { lat: 56, lng: 3 } },
  { id: "caribbean", name: "Caribbean Sea", turkishName: "Karayip Denizi", type: "sea", center: { lat: 15, lng: -75 } },
  { id: "philippine_sea", name: "Philippine Sea", turkishName: "Filipin Denizi", type: "sea", center: { lat: 18, lng: 135 } },
  { id: "south_china_sea", name: "South China Sea", turkishName: "Güney Çin Denizi", type: "sea", center: { lat: 12, lng: 115 } },
  { id: "east_china_sea", name: "East China Sea", turkishName: "Doğu Çin Denizi", type: "sea", center: { lat: 28, lng: 125 } },
  { id: "sea_of_japan", name: "Sea of Japan", turkishName: "Japon Denizi", type: "sea", center: { lat: 40, lng: 135 } },
  { id: "bering_sea", name: "Bering Sea", turkishName: "Bering Denizi", type: "sea", center: { lat: 58, lng: -178 } },
  { id: "tasman_sea", name: "Tasman Sea", turkishName: "Tasman Denizi", type: "sea", center: { lat: -40, lng: 160 } },
  { id: "coral_sea", name: "Coral Sea", turkishName: "Mercan Denizi", type: "sea", center: { lat: -18, lng: 155 } },
  { id: "ross_sea", name: "Ross Sea", turkishName: "Ross Denizi", type: "sea", center: { lat: -75, lng: 175 } },
  { id: "weddell_sea", name: "Weddell Sea", turkishName: "Weddell Denizi", type: "sea", center: { lat: -72, lng: -45 } },
  { id: "drake_passage", name: "Drake Passage", turkishName: "Drake Geçidi", type: "strait", center: { lat: -58, lng: -65 } },
  { id: "english_channel", name: "English Channel", turkishName: "Manş Denizi", type: "strait", center: { lat: 50, lng: -2 } },
  { id: "irish_sea", name: "Irish Sea", turkishName: "İrlanda Denizi", type: "sea", center: { lat: 53, lng: -5 } },
  { id: "tyrrhenian_sea", name: "Tyrrhenian Sea", turkishName: "Tiren Denizi", type: "sea", center: { lat: 40, lng: 12 } },
  { id: "adriatic", name: "Adriatic Sea", turkishName: "Adriyatik Denizi", type: "sea", center: { lat: 43, lng: 15 } },
  { id: "ionian_sea", name: "Ionian Sea", turkishName: "İyon Denizi", type: "sea", center: { lat: 37, lng: 19 } },
  { id: "libyan_sea", name: "Libyan Sea", turkishName: "Libya Denizi", type: "sea", center: { lat: 33, lng: 23 } },
  { id: "lebanese_sea", name: "Levantine Sea", turkishName: "Levant Denizi", type: "sea", center: { lat: 34, lng: 34 } },
  { id: "marmara", name: "Sea of Marmara", turkishName: "Marmara Denizi", type: "sea", center: { lat: 40.6, lng: 28 } },
  { id: "azov", name: "Sea of Azov", turkishName: "Azak Denizi", type: "sea", center: { lat: 46, lng: 37 } },
  { id: "dead_sea", name: "Dead Sea", turkishName: "Ölü Deniz", type: "lake", center: { lat: 31.5, lng: 35.5 } },
  { id: "caspian", name: "Caspian Sea", turkishName: "Hazar Denizi", type: "lake", center: { lat: 42, lng: 50 } },
  { id: "aral", name: "Aral Sea", turkishName: "Aral Gölü", type: "lake", center: { lat: 45, lng: 60 } },

  // Göller
  { id: "victoria", name: "Lake Victoria", turkishName: "Victoria Gölü", type: "lake", center: { lat: -1, lng: 33 } },
  { id: "tanganika", name: "Lake Tanganyika", turkishName: "Tanganika Gölü", type: "lake", center: { lat: -6, lng: 30 } },
  { id: "malawi", name: "Lake Malawi", turkishName: "Malawi Gölü", type: "lake", center: { lat: -12, lng: 34 } },
  { id: "superior", name: "Lake Superior", turkishName: "Superior Gölü", type: "lake", center: { lat: 47.5, lng: -88 } },
  { id: "huron", name: "Lake Huron", turkishName: "Huron Gölü", type: "lake", center: { lat: 45, lng: -83 } },
  { id: "michigan", name: "Lake Michigan", turkishName: "Michigan Gölü", type: "lake", center: { lat: 44, lng: -87 } },
  { id: "erie", name: "Lake Erie", turkishName: "Erie Gölü", type: "lake", center: { lat: 42, lng: -81 } },
  { id: "ontario", name: "Lake Ontario", turkishName: "Ontario Gölü", type: "lake", center: { lat: 43.5, lng: -77.5 } },
  { id: "baikal", name: "Lake Baikal", turkishName: "Baykal Gölü", type: "lake", center: { lat: 53.5, lng: 108 } },
  { id: "ladoga", name: "Lake Ladoga", turkishName: "Ladoga Gölü", type: "lake", center: { lat: 60.5, lng: 31 } },
  { id: "onega", name: "Lake Onega", turkishName: "Onega Gölü", type: "lake", center: { lat: 62, lng: 35 } },
  { id: "van", name: "Lake Van", turkishName: "Van Gölü", type: "lake", center: { lat: 38.6, lng: 42.8 } },
  { id: "tuz", name: "Lake Tuz", turkishName: "Tuz Gölü", type: "lake", center: { lat: 38.8, lng: 33.4 } },
  { id: "beysehir", name: "Lake Beyşehir", turkishName: "Beyşehir Gölü", type: "lake", center: { lat: 37.8, lng: 31.5 } },
  { id: "egirdir", name: "Lake Eğirdir", turkishName: "Eğirdir Gölü", type: "lake", center: { lat: 37.9, lng: 30.9 } },
  { id: "sevan", name: "Lake Sevan", turkishName: "Sevan Gölü", type: "lake", center: { lat: 40.3, lng: 45.3 } },
  { id: "balaton", name: "Lake Balaton", turkishName: "Balaton Gölü", type: "lake", center: { lat: 46.9, lng: 17.8 } },
  { id: "geneva", name: "Lake Geneva", turkishName: "Cenevre Gölü", type: "lake", center: { lat: 46.4, lng: 6.5 } },
  { id: "constance", name: "Lake Constance", turkishName: "Konstanz Gölü", type: "lake", center: { lat: 47.6, lng: 9.3 } },
  { id: "garda", name: "Lake Garda", turkishName: "Garda Gölü", type: "lake", center: { lat: 45.6, lng: 10.6 } },
  { id: "como", name: "Lake Como", turkishName: "Como Gölü", type: "lake", center: { lat: 46, lng: 9.2 } },
  { id: "titikaka", name: "Lake Titicaca", turkishName: "Titicaca Gölü", type: "lake", center: { lat: -15.8, lng: -69.3 } },
  { id: "maracaibo", name: "Lake Maracaibo", turkishName: "Maracaibo Gölü", type: "lake", center: { lat: 9.8, lng: -71.6 } },
  { id: "nicaragua", name: "Lake Nicaragua", turkishName: "Nikaragua Gölü", type: "lake", center: { lat: 11.5, lng: -85.5 } },
  { id: "chad", name: "Lake Chad", turkishName: "Çad Gölü", type: "lake", center: { lat: 13.2, lng: 14 } },
  { id: "naivasha", name: "Lake Naivasha", turkishName: "Naivasha Gölü", type: "lake", center: { lat: -0.8, lng: 36.4 } },
  { id: "turkana", name: "Lake Turkana", turkishName: "Turkana Gölü", type: "lake", center: { lat: 3.5, lng: 36.7 } },
  { id: "albert", name: "Lake Albert", turkishName: "Albert Gölü", type: "lake", center: { lat: 1.7, lng: 30.4 } },
  { id: "rudolf", name: "Lake Rudolf", turkishName: "Rudolf Gölü", type: "lake", center: { lat: 3.5, lng: 36.6 } },
  { id: "kyoga", name: "Lake Kyoga", turkishName: "Kyoga Gölü", type: "lake", center: { lat: 1.5, lng: 33 } },
  { id: "kivu", name: "Lake Kivu", turkishName: "Kivu Gölü", type: "lake", center: { lat: -2, lng: 29 } },
  { id: "mobutu", name: "Lake Mobutu", turkishName: "Mobutu Gölü", type: "lake", center: { lat: 1, lng: 32.5 } },
  { id: "mweru", name: "Lake Mweru", turkishName: "Mweru Gölü", type: "lake", center: { lat: -9, lng: 28.5 } },
  { id: "bangweulu", name: "Lake Bangweulu", turkishName: "Bangweulu Gölü", type: "lake", center: { lat: -11.5, lng: 29.8 } },
  { id: "kariba", name: "Lake Kariba", turkishName: "Kariba Gölü", type: "lake", center: { lat: -17, lng: 27 } },
  { id: "nasser", name: "Lake Nasser", turkishName: "Nasser Gölü", type: "lake", center: { lat: 22.5, lng: 32 } },

  // Körfezler
  { id: "gulf_of_mexico", name: "Gulf of Mexico", turkishName: "Meksika Körfezi", type: "bay", center: { lat: 25, lng: -90 } },
  { id: "bay_of_bengal", name: "Bay of Bengal", turkishName: "Bengal Körfezi", type: "bay", center: { lat: 15, lng: 90 } },
  { id: "hudson_bay", name: "Hudson Bay", turkishName: "Hudson Körfezi", type: "bay", center: { lat: 60, lng: -85 } },
  { id: "james_bay", name: "James Bay", turkishName: "James Körfezi", type: "bay", center: { lat: 54, lng: -82 } },
  { id: "baffin_bay", name: "Baffin Bay", turkishName: "Baffin Körfezi", type: "bay", center: { lat: 70, lng: -65 } },
  { id: "bothnia", name: "Gulf of Bothnia", turkishName: "Botni Körfezi", type: "bay", center: { lat: 63, lng: 22 } },
  { id: "riga", name: "Gulf of Riga", turkishName: "Riga Körfezi", type: "bay", center: { lat: 57.8, lng: 23.5 } },
  { id: "finland", name: "Gulf of Finland", turkishName: "Finlandiya Körfezi", type: "bay", center: { lat: 60, lng: 27 } },
  { id: "thailand", name: "Gulf of Thailand", turkishName: "Tayland Körfezi", type: "bay", center: { lat: 10, lng: 101 } },
  { id: "carpentaria", name: "Gulf of Carpentaria", turkishName: "Carpentaria Körfezi", type: "bay", center: { lat: -14, lng: 139 } },
  { id: "st_lawrence", name: "Gulf of St. Lawrence", turkishName: "St. Lawrence Körfezi", type: "bay", center: { lat: 48, lng: -61 } },
  { id: "california", name: "Gulf of California", turkishName: "Kaliforniya Körfezi", type: "bay", center: { lat: 27, lng: -111 } },
  { id: "oman", name: "Gulf of Oman", turkishName: "Umman Denizi", type: "sea", center: { lat: 24, lng: 58 } },

  // Boğazlar
  { id: "gibraltar", name: "Strait of Gibraltar", turkishName: "Cebelitarık Boğazı", type: "strait", center: { lat: 35.9, lng: -5.6 } },
  { id: "dardanelles", name: "Dardanelles", turkishName: "Çanakkale Boğazı", type: "strait", center: { lat: 40.2, lng: 26.4 } },
  { id: "bosphorus", name: "Bosphorus", turkishName: "İstanbul Boğazı", type: "strait", center: { lat: 41.1, lng: 29.1 } },
  { id: "malacca", name: "Strait of Malacca", turkishName: "Malakka Boğazı", type: "strait", center: { lat: 3, lng: 100 } },
  { id: "ormuz", name: "Strait of Hormuz", turkishName: "Hürmüz Boğazı", type: "strait", center: { lat: 26.6, lng: 56.5 } },
  { id: "bab_el_mandeb", name: "Bab el-Mandeb", turkishName: "Babülmandeb Boğazı", type: "strait", center: { lat: 12.6, lng: 43.4 } },
  { id: "messina", name: "Strait of Messina", turkishName: "Messina Boğazı", type: "strait", center: { lat: 38.2, lng: 15.6 } },
  { id: "sicily", name: "Strait of Sicily", turkishName: "Sicilya Boğazı", type: "strait", center: { lat: 37.4, lng: 12.8 } },
  { id: "bonifacio", name: "Strait of Bonifacio", turkishName: "Bonifacio Boğazı", type: "strait", center: { lat: 41.3, lng: 9.3 } },
  { id: "magellan", name: "Strait of Magellan", turkishName: "Magellan Boğazı", type: "strait", center: { lat: -53.5, lng: -70 } },
  { id: "dover", name: "Strait of Dover", turkishName: "Dover Boğazı", type: "strait", center: { lat: 51, lng: 1.4 } },
  { id: "kerch", name: "Kerch Strait", turkishName: "Kerç Boğazı", type: "strait", center: { lat: 45.3, lng: 36.6 } },
  { id: "skagerrak", name: "Skagerrak", turkishName: "Skagerrak", type: "strait", center: { lat: 58, lng: 9 } },
  { id: "kattegat", name: "Kattegat", turkishName: "Kattegat", type: "strait", center: { lat: 57, lng: 11 } },
  { id: "oresund", name: "Oresund", turkishName: "Öresund", type: "strait", center: { lat: 55.7, lng: 12.7 } },
  { id: "belt", name: "Great Belt", turkishName: "Büyük Belt", type: "strait", center: { lat: 55.3, lng: 11 } },
  { id: "belt_small", name: "Little Belt", turkishName: "Küçük Belt", type: "strait", center: { lat: 55.3, lng: 9.7 } },

  // Nehirler (sadece büyükler ve deltaları)
  { id: "nile", name: "Nile", turkishName: "Nil Nehri", type: "river", center: { lat: 25, lng: 32 } },
  { id: "amazon", name: "Amazon", turkishName: "Amazon Nehri", type: "river", center: { lat: -3, lng: -60 } },
  { id: "mississippi", name: "Mississippi", turkishName: "Mississippi Nehri", type: "river", center: { lat: 30, lng: -90 } },
  { id: "yangtze", name: "Yangtze", turkishName: "Yangtze Nehri", type: "river", center: { lat: 30, lng: 115 } },
  { id: "yellow", name: "Yellow River", turkishName: "Sarı Nehir", type: "river", center: { lat: 35, lng: 110 } },
  { id: "congo", name: "Congo", turkishName: "Kongo Nehri", type: "river", center: { lat: -5, lng: 15 } },
  { id: "niger", name: "Niger", turkishName: "Nijer Nehri", type: "river", center: { lat: 10, lng: 5 } },
  { id: "brahmaputra", name: "Brahmaputra", turkishName: "Brahmaputra Nehri", type: "river", center: { lat: 25, lng: 90 } },
  { id: "ganges", name: "Ganges", turkishName: "Ganj Nehri", type: "river", center: { lat: 25, lng: 85 } },
  { id: "volga", name: "Volga", turkishName: "Volga Nehri", type: "river", center: { lat: 50, lng: 45 } },
  { id: "danube", name: "Danube", turkishName: "Tuna Nehri", type: "river", center: { lat: 45, lng: 25 } },
  { id: "mekong", name: "Mekong", turkishName: "Mekong Nehri", type: "river", center: { lat: 15, lng: 105 } },
  { id: "tigris", name: "Tigris", turkishName: "Dicle Nehri", type: "river", center: { lat: 33, lng: 43 } },
  { id: "euphrates", name: "Euphrates", turkishName: "Fırat Nehri", type: "river", center: { lat: 34, lng: 41 } },
  { id: "indus", name: "Indus", turkishName: "İndus Nehri", type: "river", center: { lat: 25, lng: 68 } },
  { id: "zambezi", name: "Zambezi", turkishName: "Zambezi Nehri", type: "river", center: { lat: -15, lng: 30 } },
  { id: "orinoco", name: "Orinoco", turkishName: "Orinoco Nehri", type: "river", center: { lat: 8, lng: -65 } },
  { id: "sao_francisco", name: "Sao Francisco", turkishName: "Sao Francisco Nehri", type: "river", center: { lat: -12, lng: -40 } },
  { id: "parana", name: "Parana", turkishName: "Parana Nehri", type: "river", center: { lat: -25, lng: -55 } },
  { id: "uruguay", name: "Uruguay", turkishName: "Uruguay Nehri", type: "river", center: { lat: -32, lng: -55 } },
  { id: "colorado", name: "Colorado", turkishName: "Colorado Nehri", type: "river", center: { lat: 35, lng: -115 } },
  { id: "saskatchewan", name: "Saskatchewan", turkishName: "Saskatchewan Nehri", type: "river", center: { lat: 54, lng: -105 } },
  { id: "mackenzie", name: "Mackenzie", turkishName: "Mackenzie Nehri", type: "river", center: { lat: 65, lng: -125 } },
  { id: "yukon", name: "Yukon", turkishName: "Yukon Nehri", type: "river", center: { lat: 65, lng: -145 } },
  { id: "ob", name: "Ob", turkishName: "Ob Nehri", type: "river", center: { lat: 60, lng: 70 } },
  { id: "yenisei", name: "Yenisei", turkishName: "Yenisey Nehri", type: "river", center: { lat: 65, lng: 90 } },
  { id: "lena", name: "Lena", turkishName: "Lena Nehri", type: "river", center: { lat: 70, lng: 125 } },
  { id: "amur", name: "Amur", turkishName: "Amur Nehri", type: "river", center: { lat: 50, lng: 130 } },
  { id: "irrawaddy", name: "Irrawaddy", turkishName: "Irrawaddy Nehri", type: "river", center: { lat: 20, lng: 95 } },
  { id: "salween", name: "Salween", turkishName: "Salween Nehri", type: "river", center: { lat: 20, lng: 98 } },
  { id: "chao_phraya", name: "Chao Phraya", turkishName: "Chao Phraya Nehri", type: "river", center: { lat: 15, lng: 100 } },
  { id: "murray", name: "Murray", turkishName: "Murray Nehri", type: "river", center: { lat: -35, lng: 140 } },
  { id: "darling", name: "Darling", turkishName: "Darling Nehri", type: "river", center: { lat: -30, lng: 145 } },
];

// En yakın su kütlesini bul (basit mesafe hesabı)
export function findNearestWaterBody(lat: number, lng: number): WaterBody | null {
  let nearest: WaterBody | null = null;
  let minDistance = Infinity;

  for (const water of WATER_BODIES) {
    const dLat = water.center.lat - lat;
    const dLng = water.center.lng - lng;
    // Basit karesel mesafe (yeterli yaklaşık sonuç için)
    const distance = dLat * dLat + dLng * dLng;

    if (distance < minDistance) {
      minDistance = distance;
      nearest = water;
    }
  }

  // Çok uzaksa (örn. 20 dereceden fazla) null döndür
  // Bu yerleşim yerlerini su kütlelerine tercih etmek için
  if (minDistance > 400) { // ~20 derece
    return null;
  }

  return nearest;
}

// Belirli bir mesafe içinde mi kontrol et
export function getWaterBodyIfNearby(lat: number, lng: number, maxDegrees: number = 5): WaterBody | null {
  let nearest: WaterBody | null = null;
  let minDistance = Infinity;
  const maxDistSq = maxDegrees * maxDegrees;

  for (const water of WATER_BODIES) {
    const dLat = water.center.lat - lat;
    const dLng = water.center.lng - lng;
    const distance = dLat * dLat + dLng * dLng;

    if (distance < minDistance && distance <= maxDistSq) {
      minDistance = distance;
      nearest = water;
    }
  }

  return nearest;
}
