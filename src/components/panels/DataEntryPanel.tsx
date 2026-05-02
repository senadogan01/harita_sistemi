"use client";

import { useCallback, useMemo, useState } from "react";
import { FilePlus2, MapPin, Save, X } from "lucide-react";
import type { LocalDb } from "@/hooks/useLocalDb";
import type { DbActor, DbActorType, DbEvent } from "@/data/database";

function toId(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

function uniqueId(existing: Set<string>, base: string): string {
  if (!existing.has(base)) return base;
  let i = 2;
  while (existing.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

function splitNames(raw: string): string[] {
  return raw
    .split(/[,\n]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function DataEntryPanel({
  db,
  onChangeDb,
  lastClickedLocation,
  onFlyTo,
  onPickLocation,
  onSelectItem,
}: {
  db: LocalDb;
  onChangeDb: (next: LocalDb) => void | Promise<void>;
  lastClickedLocation: { lng: number; lat: number; label?: string; country?: string } | null;
  onFlyTo?: (lng: number, lat: number) => void;
  onPickLocation?: (lng: number, lat: number, label?: string) => void;
  onSelectItem?: (kind: "event" | "leader" | "org", id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedActorId, setSelectedActorId] = useState<string>("");
  const [fileName, setFileName] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [date, setDate] = useState("");
  const [peopleRaw, setPeopleRaw] = useState("");
  const [orgsRaw, setOrgsRaw] = useState("");
  const [eventText, setEventText] = useState("");

  const [picked, setPicked] = useState<{ lng: number; lat: number; label?: string } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const existingActorIds = useMemo(() => new Set(db.actors.map((a) => a.id)), [db.actors]);
  const existingEventIds = useMemo(() => new Set(db.events.map((e) => e.id)), [db.events]);

  const selectedEvent = useMemo(() => db.events.find((e) => e.id === selectedEventId) ?? null, [db.events, selectedEventId]);
  const selectedActor = useMemo(() => db.actors.find((a) => a.id === selectedActorId) ?? null, [db.actors, selectedActorId]);

  const selectedHeader = useMemo(() => {
    if (selectedEvent) return selectedEvent.title;
    if (selectedActor) return `${selectedActor.type === "leader" ? "Kişi" : "Örgüt"}: ${selectedActor.name}`;
    return null;
  }, [selectedActor, selectedEvent]);

  const resolvePlaceToCoords = useCallback(async () => {
    const q = placeQuery.trim();
    if (!q) {
      if (lastClickedLocation) {
        setPicked({ lng: lastClickedLocation.lng, lat: lastClickedLocation.lat, label: lastClickedLocation.label });
        setGeoError(null);
        return { lng: lastClickedLocation.lng, lat: lastClickedLocation.lat };
      }
      setGeoError("Yer gir veya haritada bir nokta seç");
      return null;
    }

    setIsGeocoding(true);
    setGeoError(null);
    try {
      const url = `/api/nominatim/search?limit=1&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        setGeoError(`Koordinat bulunamadı (${res.status})`);
        return null;
      }
      const data = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>;
      const first = data[0];
      if (!first) {
        setGeoError("Koordinat bulunamadı");
        return null;
      }
      const lng = Number(first.lon);
      const lat = Number(first.lat);
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
        setGeoError("Koordinat bulunamadı");
        return null;
      }
      setPicked({ lng, lat, label: first.display_name });
      return { lng, lat };
    } catch {
      setGeoError("Koordinat bulunamadı");
      return null;
    } finally {
      setIsGeocoding(false);
    }
  }, [lastClickedLocation, placeQuery]);

  const onSave = useCallback(async () => {
    setSaveError(null);

    const coords = await resolvePlaceToCoords();
    if (!coords) return;

    const title = fileName.trim() || "Dosya";
    const eventIdBase = toId(`${date || "tarih"}-${title}`) || "event";
    const eventId = uniqueId(existingEventIds, eventIdBase);

    const makeActors = (names: string[], type: DbActorType): DbActor[] => {
      return names.map((name) => {
        const base = toId(name) || (type === "leader" ? "person" : "org");
        const id = uniqueId(existingActorIds, base);
        existingActorIds.add(id);
        return {
          id,
          type,
          name,
          description: "",
          analysis: "",
          lngLat: { lng: coords.lng, lat: coords.lat },
          relatedIds: [],
        } satisfies DbActor;
      });
    };

    const people = makeActors(splitNames(peopleRaw), "leader");
    const orgs = makeActors(splitNames(orgsRaw), "org");
    const createdActors = [...people, ...orgs];

    const relatedIds = createdActors.map((a) => a.id);

    const ev: DbEvent = {
      id: eventId,
      date: date.trim() || new Date().toISOString().slice(0, 10),
      title,
      analysis: eventText.trim() || "",
      lngLat: { lng: coords.lng, lat: coords.lat },
      relatedIds,
    };

    const next: LocalDb = {
      ...db,
      actors: [...db.actors, ...createdActors],
      events: [...db.events, ev],
    };

    setIsSaving(true);
    try {
      await onChangeDb(next);
      onFlyTo?.(coords.lng, coords.lat);

      setOpen(false);
      setFileName("");
      setPlaceQuery("");
      setDate("");
      setPeopleRaw("");
      setOrgsRaw("");
      setEventText("");
      setPicked(null);
      setGeoError(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Dosya kaydedilemedi");
    } finally {
      setIsSaving(false);
    }
  }, [db, date, eventText, existingActorIds, existingEventIds, fileName, onChangeDb, onFlyTo, orgsRaw, peopleRaw, resolvePlaceToCoords]);

  return (
    <aside className="pointer-events-auto absolute right-4 bottom-28 w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white/90">Dosya ekle</div>
          <div className="mt-0.5 truncate text-xs text-white/55">{selectedHeader ?? "Manuel veri girişi"}</div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedEventId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedEventId(id);
              setSelectedActorId("");
              const ev = db.events.find((x) => x.id === id);
              if (!ev) return;
              onFlyTo?.(ev.lngLat.lng, ev.lngLat.lat);
              onPickLocation?.(ev.lngLat.lng, ev.lngLat.lat, ev.title);
              onSelectItem?.("event", ev.id);
            }}
            className="max-w-[170px] rounded-xl border border-amber-200/25 bg-amber-500/15 px-2 py-2 text-xs text-white/90 outline-none shadow-sm hover:bg-amber-500/20 focus:border-amber-200/40"
            aria-label="Dosya seç"
          >
            <option value="">Dosya seç</option>
            {db.events
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.date} — {e.title}
                </option>
              ))}
          </select>

          <select
            value={selectedActorId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedActorId(id);
              setSelectedEventId("");
              const a = db.actors.find((x) => x.id === id);
              if (!a) return;
              onFlyTo?.(a.lngLat.lng, a.lngLat.lat);
              onPickLocation?.(a.lngLat.lng, a.lngLat.lat, a.name);
              onSelectItem?.(a.type, a.id);
            }}
            className="max-w-[170px] rounded-xl border border-fuchsia-200/20 bg-fuchsia-500/15 px-2 py-2 text-xs text-white/90 outline-none shadow-sm hover:bg-fuchsia-500/20 focus:border-fuchsia-200/35"
            aria-label="Aktör seç"
          >
            <option value="">Aktör seç</option>
            {db.actors
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {(a.type === "leader" ? "Kişi" : "Örgüt")} — {a.name}
                </option>
              ))}
          </select>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-white/80 hover:bg-white/15"
          >
            <FilePlus2 className="h-4 w-4" />
            {open ? "Kapat" : "Aç"}
          </button>
        </div>
      </div>

      {open ? (
        <div className="max-h-[520px] overflow-y-auto px-4 py-4">
          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold text-white/70">Dosya adı</div>
              <input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/85 outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold text-white/70">Bölge (şehir/köy/ülke)</div>
                <button
                  type="button"
                  onClick={resolvePlaceToCoords}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-white/80 hover:bg-white/15"
                >
                  <MapPin className="h-4 w-4" />
                  {isGeocoding ? "..." : "Koordinat bul"}
                </button>
              </div>
              <input
                value={placeQuery}
                onChange={(e) => setPlaceQuery(e.target.value)}
                placeholder={lastClickedLocation?.label ?? "Örn: Ankara / Türkiye / Köy adı"}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/85 outline-none placeholder:text-white/35"
              />
              {picked ? (
                <div className="mt-1 text-xs text-white/60">
                  {picked.label ? <div className="truncate">{picked.label}</div> : null}
                  <div className="font-mono">
                    {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
                  </div>
                </div>
              ) : null}
              {geoError ? <div className="mt-1 text-xs text-rose-200/80">{geoError}</div> : null}
            </div>

            <div>
              <div className="text-xs font-semibold text-white/70">Tarih</div>
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="YYYY-MM-DD"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/85 outline-none placeholder:text-white/35"
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-white/70">Aktörler - kişiler</div>
              <textarea
                value={peopleRaw}
                onChange={(e) => setPeopleRaw(e.target.value)}
                placeholder="Virgül veya satır ile ayır"
                className="mt-1 h-16 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/85 outline-none placeholder:text-white/35"
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-white/70">Aktörler - örgütler</div>
              <textarea
                value={orgsRaw}
                onChange={(e) => setOrgsRaw(e.target.value)}
                placeholder="Virgül veya satır ile ayır"
                className="mt-1 h-16 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/85 outline-none placeholder:text-white/35"
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-white/70">Olay</div>
              <textarea
                value={eventText}
                onChange={(e) => setEventText(e.target.value)}
                className="mt-1 h-28 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/85 outline-none"
              />
            </div>

            {saveError ? <div className="text-xs text-rose-200/80">{saveError}</div> : null}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-white/80 hover:bg-white/15"
              >
                <X className="h-4 w-4" />
                İptal
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 px-3 py-2 text-xs text-emerald-50 hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
