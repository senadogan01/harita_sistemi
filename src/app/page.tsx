"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LeftPanel } from "@/components/panels/LeftPanel";
import { RightPanel } from "@/components/panels/RightPanel";
import { DataEntryPanel } from "@/components/panels/DataEntryPanel";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { Timeline } from "@/components/timeline/Timeline";
import { StrategicMap } from "@/components/map/StrategicMap";
import type { MapItem } from "@/types/strategic";
import { useSupabaseDb } from "@/hooks/useSupabaseDb";
import type { DbRegionId } from "@/data/database";
import { getWaterBodyIfNearby } from "@/data/waterBodies";

type MapController = {
  flyTo: (...args: unknown[]) => void;
  fitBounds: (...args: unknown[]) => void;
};

function yearFromDate(date: string): number {
  const trimmed = date.trim();
  const yearMaybe = Number(trimmed.slice(0, 4));
  if (Number.isFinite(yearMaybe) && yearMaybe >= 0) return yearMaybe;
  const parsed = new Date(trimmed);
  const y = parsed.getFullYear();
  return Number.isFinite(y) ? y : 2000;
}

export default function Home() {
  const { db, setDb, user, signOut, isLoading, error } = useSupabaseDb();
  const [activeRegionId, setActiveRegionId] = useState<DbRegionId>("middle-east");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  const [year, setYear] = useState<number>(2026);
  const [projectionName, setProjectionName] = useState<"globe" | "mercator">("globe");
  const [clickedLocation, setClickedLocation] = useState<
    { lng: number; lat: number; label?: string; details?: string; country?: string } | null
  >(null);

  const [hoveredLocation, setHoveredLocation] = useState<{ lng: number; lat: number; label?: string } | null>(null);
  const lastHoverReverseKeyRef = useRef<string | null>(null);
  const hoverReverseTimerRef = useRef<number | null>(null);
  const lastHoverReverseAtRef = useRef<number>(0);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<
    Array<{ place_id: number; display_name: string; lat: string; lon: string }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const mapRef = useRef<MapController | null>(null);
  const lastReverseKeyRef = useRef<string | null>(null);

  const flyToRegion = useCallback(
    (regionId: DbRegionId) => {
      const region = db.regions.find((r) => r.id === regionId);
      if (!region) return;
      setProjectionName("mercator");
      mapRef.current?.flyTo({
        center: [region.map.longitude, region.map.latitude],
        zoom: region.map.zoom,
        bearing: region.map.bearing ?? 0,
        pitch: region.map.pitch ?? 50,
        duration: 1100,
      });
    },
    [db.regions],
  );

  const getClosestRegionId = useCallback(
    (lng: number, lat: number): DbRegionId | null => {
      if (db.regions.length === 0) return null;
      let bestId: DbRegionId = db.regions[0]!.id as DbRegionId;
      let bestScore = Number.POSITIVE_INFINITY;

      for (const r of db.regions) {
        const dLng = r.map.longitude - lng;
        const dLat = r.map.latitude - lat;
        const score = dLng * dLng + dLat * dLat;
        if (score < bestScore) {
          bestScore = score;
          bestId = r.id as DbRegionId;
        }
      }

      return bestId;
    },
    [db.regions],
  );

  const [placeMarkers, setPlaceMarkers] = useState<
    Array<{ id: string; name: string; kind: string; lng: number; lat: number }>
  >([]);

  const clickedLat = clickedLocation?.lat ?? null;
  const clickedLng = clickedLocation?.lng ?? null;
  const clickedLabel = clickedLocation?.label ?? null;
  const clickedDetails = clickedLocation?.details ?? null;
  const clickedCountry = clickedLocation?.country ?? null;

  const items = useMemo<MapItem[]>(() => {
    const out: MapItem[] = [];

    for (const a of db.actors) {
      out.push({
        kind: a.type,
        id: a.id,
        title: a.name,
        summary: a.description,
        analysis: a.analysis,
        lngLat: a.lngLat,
        imageUrl: a.imageUrl,
      });
    }

    for (const e of db.events) {
      out.push({
        kind: "event",
        id: e.id,
        title: e.title,
        summary: e.analysis,
        analysis: e.analysis,
        year: yearFromDate(e.date),
        lngLat: e.lngLat,
        imageUrl: e.imageUrl,
      });
    }

    return out;
  }, [db.actors, db.events]);

  const visibleItems = useMemo(() => {
    if (!selectedEventId) return items;
    const ev = db.events.find((e) => e.id === selectedEventId);
    const related = new Set(ev?.relatedIds ?? []);
    return items.filter((i) => {
      if (i.kind === "event") return i.id === selectedEventId;
      if (related.size === 0) return false;
      return related.has(i.id);
    });
  }, [db.events, items, selectedEventId]);

  useEffect(() => {
    if (!selectedEventId) return;
    const map = mapRef.current;
    if (!map) return;

    const ev = db.events.find((e) => e.id === selectedEventId);
    if (!ev) return;

    const related = new Set(ev.relatedIds ?? []);
    const pts: Array<[number, number]> = [[ev.lngLat.lng, ev.lngLat.lat]];

    if (related.size > 0) {
      for (const a of db.actors) {
        if (!related.has(a.id)) continue;
        pts.push([a.lngLat.lng, a.lngLat.lat]);
      }
    }

    if (pts.length <= 1) {
      map.flyTo({ center: pts[0], zoom: 6, pitch: 55, bearing: 0, duration: 1200 });
      return;
    }

    let minLng = pts[0][0];
    let minLat = pts[0][1];
    let maxLng = pts[0][0];
    let maxLat = pts[0][1];
    for (const [lng, lat] of pts) {
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    }

    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: 120,
        duration: 1200,
        pitch: 55,
        bearing: 0,
      },
    );
  }, [db.actors, db.events, selectedEventId]);

  useEffect(() => {
    if (clickedLat === null || clickedLng === null) return;
    const key = `${clickedLat.toFixed(6)},${clickedLng.toFixed(6)}`;
    if (lastReverseKeyRef.current === key && clickedLabel && clickedDetails) return;
    lastReverseKeyRef.current = key;
    const ac = new AbortController();

    (async () => {
      try {
        const url =
          "/api/nominatim/reverse?zoom=18" +
          `&lat=${encodeURIComponent(clickedLat)}` +
          `&lon=${encodeURIComponent(clickedLng)}`;

        const res = await fetch(url, {
          signal: ac.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          setClickedLocation((prev) => {
            if (!prev) return prev;
            if (prev.lat !== clickedLat || prev.lng !== clickedLng) return prev;
            return { ...prev, details: `Yer bilgisi alınamadı (${res.status})` };
          });
          return;
        }
        const data = (await res.json()) as {
          display_name?: string;
          name?: string;
          type?: string;
          category?: string;
          address?: Record<string, string>;
        };

        const address = data.address ?? {};
        const displayName = data.display_name ?? "";
        const rawName = data.name ?? "";

        // Yerleşim yeri
        const locality =
          address.city ??
          address.town ??
          address.village ??
          address.suburb ??
          address.county ??
          address.state ??
          address.region;

        const country = address.country;

        // Su kütlesi tespiti için display_name veya name'i kullan
        const nameToUse = rawName || displayName.split(",")[0]?.trim() || "";
        const nameLower = nameToUse.toLowerCase();

        // Türkçe su kütlesi isimleri eşleme
        let label: string;
        if (nameLower.includes("ocean")) {
          label = `${nameToUse} Okyanusu`;
        } else if (nameLower.includes("sea")) {
          label = `${nameToUse} Denizi`;
        } else if (nameLower.includes("lake")) {
          label = `${nameToUse} Gölü`;
        } else if (nameLower.includes("bay")) {
          label = `${nameToUse} Körfezi`;
        } else if (nameLower.includes("strait")) {
          label = `${nameToUse} Boğazı`;
        } else if (nameLower.includes("river") || nameLower.includes("nehir")) {
          label = `${nameToUse} Nehri`;
        } else if (nameLower.includes("canal") || nameLower.includes("kanal")) {
          label = `${nameToUse} Kanalı`;
        } else if (locality) {
          label = `${locality}${country ? `, ${country}` : ""}`;
        } else if (nameToUse) {
          label = nameToUse;
        } else {
          // Nominatim boş döndürdüyse, yerel su kütlesi veritabanını kontrol et
          const waterBody = getWaterBodyIfNearby(clickedLat, clickedLng, 8);
          if (waterBody) {
            label = waterBody.turkishName;
          } else {
            label = "Seçilen nokta";
          }
        }

        const details = displayName || [data.category, data.type].filter(Boolean).join(" / ") || "Yer bilgisi mevcut değil";

        setClickedLocation((prev) => {
          if (!prev) return prev;
          if (prev.lat !== clickedLat || prev.lng !== clickedLng) return prev;
          return { ...prev, label, details, country };
        });
      } catch {
        // ignore
      }
    })();

    return () => {
      ac.abort();
    };
  }, [clickedLat, clickedLng, clickedLabel, clickedDetails]);

  useEffect(() => {
    if (!hoveredLocation) return;
    const key = `${hoveredLocation.lat.toFixed(5)},${hoveredLocation.lng.toFixed(5)}`;
    if (lastHoverReverseKeyRef.current === key && hoveredLocation.label) return;

    if (hoverReverseTimerRef.current) {
      window.clearTimeout(hoverReverseTimerRef.current);
      hoverReverseTimerRef.current = null;
    }

    const ac = new AbortController();
    hoverReverseTimerRef.current = window.setTimeout(() => {
      const now = Date.now();
      if (now - lastHoverReverseAtRef.current < 2500) return;
      lastHoverReverseAtRef.current = now;
      lastHoverReverseKeyRef.current = key;
      (async () => {
        try {
          const url =
            "/api/nominatim/reverse?zoom=14" +
            `&lat=${encodeURIComponent(hoveredLocation.lat)}` +
            `&lon=${encodeURIComponent(hoveredLocation.lng)}`;

          const res = await fetch(url, {
            signal: ac.signal,
            headers: {
              Accept: "application/json",
            },
          });

          if (!res.ok) return;
          const data = (await res.json()) as {
            display_name?: string;
            name?: string;
            type?: string;
            category?: string;
            address?: Record<string, string>;
          };

          const address = data.address ?? {};
          const displayName = data.display_name ?? "";
          const rawName = data.name ?? "";

          const locality =
            address.city ??
            address.town ??
            address.village ??
            address.suburb ??
            address.county ??
            address.state ??
            address.region;

          // Su kütlesi tespiti için display_name veya name'i kullan
          const nameToUse = rawName || displayName.split(",")[0]?.trim() || "";
          const nameLower = nameToUse.toLowerCase();

          let label: string | null = null;
          if (nameLower.includes("ocean")) {
            label = `${nameToUse} Okyanusu`;
          } else if (nameLower.includes("sea")) {
            label = `${nameToUse} Denizi`;
          } else if (nameLower.includes("lake")) {
            label = `${nameToUse} Gölü`;
          } else if (nameLower.includes("bay")) {
            label = `${nameToUse} Körfezi`;
          } else if (nameLower.includes("strait")) {
            label = `${nameToUse} Boğazı`;
          } else if (nameLower.includes("river") || nameLower.includes("nehir")) {
            label = `${nameToUse} Nehri`;
          } else if (nameLower.includes("canal") || nameLower.includes("kanal")) {
            label = `${nameToUse} Kanalı`;
          } else if (locality) {
            label = `${locality}${address.country ? `, ${address.country}` : ""}`;
          } else if (nameToUse) {
            label = nameToUse;
          } else {
            // Nominatim boş döndürdüyse, yerel su kütlesi veritabanını kontrol et
            const waterBody = getWaterBodyIfNearby(hoveredLocation.lat, hoveredLocation.lng, 8);
            if (waterBody) {
              label = waterBody.turkishName;
            } else {
              label = null;
            }
          }

          if (!label) return;

          setHoveredLocation((prev) => {
            if (!prev) return prev;
            const prevKey = `${prev.lat.toFixed(5)},${prev.lng.toFixed(5)}`;
            if (prevKey !== key) return prev;
            return { ...prev, label };
          });
        } catch {
          // ignore
        }
      })();
    }, 1500);

    return () => {
      ac.abort();
      if (hoverReverseTimerRef.current) {
        window.clearTimeout(hoverReverseTimerRef.current);
        hoverReverseTimerRef.current = null;
      }
    };
  }, [hoveredLocation]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 4) {
      return;
    }
    const ac = new AbortController();
    const t = setTimeout(() => {
      (async () => {
        try {
          setIsSearching(true);
          setSearchError(null);
          const url =
            "/api/nominatim/search?limit=6" +
            `&q=${encodeURIComponent(q)}`;
          const res = await fetch(url, {
            signal: ac.signal,
            headers: {
              Accept: "application/json",
            },
          });
          if (!res.ok) {
            setSearchResults([]);
            setSearchError(`Arama hatası (${res.status})`);
            return;
          }
          const data = (await res.json()) as Array<{
            place_id: number;
            display_name: string;
            lat: string;
            lon: string;
          }>;
          setSearchResults(data);
        } catch {
          // ignore
          setSearchResults([]);
          setSearchError("Arama hatası");
        } finally {
          setIsSearching(false);
        }
      })();
    }, 800);

    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [searchQuery]);

  const fetchOverpassPlaces = useCallback(async ({
    bbox,
    kinds,
    limit,
  }: {
    bbox: { s: number; w: number; n: number; e: number };
    kinds: Array<"city" | "town" | "village" | "hamlet">;
    limit: number;
  }) => {
    const kindRegex = kinds.join("|");
    const query = `[
out:json][timeout:25];
(
  node[\"place\"~\"^(?:${kindRegex})$\"](${bbox.s},${bbox.w},${bbox.n},${bbox.e});
);
out body ${limit};`;

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
        Accept: "application/json",
      },
      body: query,
    });

    if (!res.ok) return [];
    const data = (await res.json()) as {
      elements: Array<{ id: number; lat: number; lon: number; tags?: Record<string, string> }>;
    };

    return (data.elements ?? [])
      .map((el) => {
        const name = el.tags?.name;
        const kind = el.tags?.place ?? "place";
        if (!name) return null;
        return {
          id: `osm-${el.id}`,
          name,
          kind,
          lng: el.lon,
          lat: el.lat,
        };
      })
      .filter(Boolean) as Array<{ id: string; name: string; kind: string; lng: number; lat: number }>;
  }, []);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#050711] text-sm text-white/70">
        Veriler yükleniyor...
      </div>
    );
  }

  if (!user) {
    return <AuthPanel />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <div className="pointer-events-auto absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/10 bg-black/45 px-4 py-2 text-xs text-white/75 backdrop-blur-xl">
        <span className="max-w-[220px] truncate">{user.email}</span>
        {error ? <span className="max-w-[260px] truncate text-rose-200">{error}</span> : null}
        <button type="button" onClick={signOut} className="rounded-xl bg-white/10 px-3 py-1.5 text-white/80 hover:bg-white/15">
          Çıkış
        </button>
      </div>

      <div className="absolute inset-0">
        <StrategicMap
          items={visibleItems}
          onControllerReady={(c) => {
            mapRef.current = c;
          }}
          projectionName={projectionName}
          clickedLocation={clickedLocation}
          onCloseClickedLocation={() => setClickedLocation(null)}
          placeMarkers={placeMarkers}
          onMapHover={(lng: number, lat: number) => {
            setHoveredLocation((prev) => {
              const nextKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
              const prevKey = prev ? `${prev.lat.toFixed(5)},${prev.lng.toFixed(5)}` : null;
              if (prevKey === nextKey) return prev;
              return { lng, lat };
            });
          }}
          onSelectPlaceMarker={(placeId) => {
            const p = placeMarkers.find((x) => x.id === placeId);
            if (!p) return;
            mapRef.current?.flyTo({ center: [p.lng, p.lat], zoom: p.kind === "city" ? 10 : 12, pitch: 45, bearing: 0, duration: 1100 });
            if (p.kind === "city" || p.kind === "town") {
              const d = 0.35;
              const bbox = { s: p.lat - d, w: p.lng - d, n: p.lat + d, e: p.lng + d };
              fetchOverpassPlaces({ bbox, kinds: ["village", "hamlet"], limit: 120 })
                .then((places: Array<{ id: string; name: string; kind: string; lng: number; lat: number }>) => {
                  setPlaceMarkers((prev) => {
                    const keep = prev.filter((m) => m.kind === "city" || m.kind === "town");
                    const merged = [...keep, ...places];
                    const byId = new Map<string, (typeof merged)[number]>();
                    for (const it of merged) byId.set(it.id, it);
                    return Array.from(byId.values());
                  });
                })
                .catch(() => {
                  // ignore
                });
            }
          }}
          onSelectItem={(item) => {
            setSelectedItem(item);
            if (item.kind === "event") {
              setSelectedEventId(item.id);
            }
          }}
          onMapClick={(lng: number, lat: number) => {
            setClickedLocation({
              lng,
              lat,
              label:
                hoveredLocation &&
                Math.abs(hoveredLocation.lat - lat) < 0.0002 &&
                Math.abs(hoveredLocation.lng - lng) < 0.0002
                  ? hoveredLocation.label
                  : undefined,
              details: undefined,
              country: undefined,
            });

            const closest = getClosestRegionId(lng, lat);
            if (closest) {
              setActiveRegionId(closest);
              flyToRegion(closest);
            }
          }}
        />
      </div>

      <div className="pointer-events-none absolute top-4 left-1/2 z-20 w-[520px] -translate-x-1/2">
        <div className="pointer-events-auto rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <input
              value={searchQuery}
              onChange={(e) => {
                const v = e.target.value;
                setSearchQuery(v);
                if (v.trim().length < 4) {
                  setSearchResults([]);
                  setSearchError(null);
                }
              }}
              placeholder="Şehir / ülke / yer ara (OSM)"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/85 placeholder:text-white/40 outline-none"
            />
            <div className="text-xs text-white/50">{isSearching ? "..." : searchError ? "!" : ""}</div>
          </div>
          {searchError ? <div className="mt-1 text-xs text-rose-200/80">{searchError}</div> : null}
          {searchResults.length > 0 ? (
            <div className="mt-2 max-h-64 overflow-auto rounded-xl border border-white/10 bg-black/40">
              {searchResults.map((r) => (
                <button
                  key={r.place_id}
                  type="button"
                  className="block w-full border-b border-white/5 px-3 py-2 text-left text-xs text-white/80 hover:bg-white/5"
                  onClick={() => {
                    const lng = Number(r.lon);
                    const lat = Number(r.lat);
                    setSearchResults([]);
                    setSearchQuery(r.display_name);
                    setClickedLocation({ lng, lat, label: r.display_name });
                    setProjectionName("mercator");
                    mapRef.current?.flyTo({ center: [lng, lat], zoom: 8, pitch: 45, bearing: 0, duration: 1100 });
                  }}
                >
                  {r.display_name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0">
        <LeftPanel
          db={db}
          hoveredLabel={hoveredLocation?.label ?? null}
          selectedCountry={clickedCountry}
          activeRegionId={activeRegionId}
          onActiveRegionChange={(rid) => setActiveRegionId(rid)}
          onSelectRegion={(regionId) => {
            setActiveRegionId(regionId);
            flyToRegion(regionId);
          }}
        />

        <DataEntryPanel
          db={db}
          onChangeDb={(next) => setDb(next)}
          lastClickedLocation={clickedLocation}
          onPickLocation={(lng, lat, label) => {
            setClickedLocation((prev) => ({
              lng,
              lat,
              label: label ?? prev?.label,
              details: prev?.details,
              country: prev?.country,
            }));
          }}
          onSelectItem={(kind, id) => {
            if (kind === "event") {
              const ev = db.events.find((e) => e.id === id);
              if (!ev) return;
              setSelectedItem({
                kind: "event",
                id: ev.id,
                title: ev.title,
                summary: ev.analysis,
                analysis: ev.analysis,
                year: yearFromDate(ev.date),
                lngLat: ev.lngLat,
                imageUrl: ev.imageUrl,
              });
              setSelectedEventId(ev.id);
              return;
            }

            const a = db.actors.find((x) => x.id === id);
            if (!a) return;
            setSelectedItem({
              kind: a.type,
              id: a.id,
              title: a.name,
              summary: a.description,
              analysis: a.analysis,
              lngLat: a.lngLat,
              imageUrl: a.imageUrl,
            });
            setSelectedEventId(null);
          }}
          onFlyTo={(lng, lat) => {
            setProjectionName("mercator");
            mapRef.current?.flyTo({ center: [lng, lat], zoom: 7.5, pitch: 45, bearing: 0, duration: 1100 });
          }}
        />

        <RightPanel
          selectedItem={selectedItem}
          onClose={() => {
            setSelectedItem(null);
            setSelectedEventId(null);
          }}
        />
        <Timeline
          year={year}
          onChange={(y) => {
            setYear(y);
            setSelectedEventId(null);
          }}
          events={db.events.map((e) => ({
            id: e.id,
            title: `${yearFromDate(e.date)} ${e.title}`,
            year: yearFromDate(e.date),
            summary: e.analysis,
          }))}
          selectedEventId={selectedEventId}
          onSelectEvent={(eventId) => {
            const ev = db.events.find((e) => e.id === eventId);
            setSelectedEventId(eventId);
            if (ev) setYear(yearFromDate(ev.date));
            setSelectedItem(
              ev
                ? {
                    kind: "event",
                    id: ev.id,
                    title: ev.title,
                    summary: ev.analysis,
                    analysis: ev.analysis,
                    year: yearFromDate(ev.date),
                    lngLat: ev.lngLat,
                    imageUrl: ev.imageUrl,
                  }
                : null,
            );

            if (ev) {
              mapRef.current?.flyTo({
                center: [ev.lngLat.lng, ev.lngLat.lat],
                zoom: 6,
                pitch: 55,
                bearing: 0,
                duration: 1200,
              });
            }
          }}
        />
      </div>
    </div>
  );
}
