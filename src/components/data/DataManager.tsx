"use client";

import { useMemo, useState } from "react";
import type { DbActor, DbActorType, DbCountry, DbEvent, DbRegion } from "@/data/database";

type Tab = "regions" | "countries" | "actors" | "events";

export function DataManager({
  open,
  onClose,
  db,
  onChange,
  exportText,
  onResetToFileDb,
  onClearAll,
}: {
  open: boolean;
  onClose: () => void;
  db: { regions: DbRegion[]; countries: DbCountry[]; actors: DbActor[]; events: DbEvent[] };
  onChange: (next: { regions: DbRegion[]; countries: DbCountry[]; actors: DbActor[]; events: DbEvent[] }) => void;
  exportText: string;
  onResetToFileDb: () => void;
  onClearAll: () => void;
}) {
  const [tab, setTab] = useState<Tab>("regions");

  const regionIds = useMemo(() => db.regions.map((r) => r.id), [db.regions]);

  const [regionForm, setRegionForm] = useState<DbRegion>(() => ({
    id: "",
    name: "",
    map: { longitude: 0, latitude: 0, zoom: 3, pitch: 55, bearing: 0 },
  }));

  const [countryForm, setCountryForm] = useState<DbCountry>(() => ({
    id: "",
    name: "",
    regionId: "",
    lngLat: { lng: 0, lat: 0 },
  }));

  const [actorForm, setActorForm] = useState<DbActor>(() => ({
    id: "",
    type: "leader",
    name: "",
    description: "",
    analysis: "",
    lngLat: { lng: 0, lat: 0 },
    imageUrl: "",
    relatedIds: [],
  }));

  const [eventForm, setEventForm] = useState<DbEvent>(() => ({
    id: "",
    date: "",
    title: "",
    analysis: "",
    lngLat: { lng: 0, lat: 0 },
    imageUrl: "",
    relatedIds: [],
  }));

  const [exportCopied, setExportCopied] = useState(false);

  if (!open) return null;

  const update = (patch: Partial<typeof db>) => onChange({ ...db, ...patch });

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/80 text-white/85 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4">
          <div>
            <div className="text-sm font-semibold">Veri Yönetimi</div>
            <div className="mt-1 text-xs text-white/55">Ekle / düzenle / sil. Veriler tarayıcıda localStorage içinde tutulur.</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-xl bg-white/10 px-3 py-2 text-xs hover:bg-white/15"
              onClick={onResetToFileDb}
            >
              Dosyadan yükle
            </button>
            <button type="button" className="rounded-xl bg-white/10 px-3 py-2 text-xs hover:bg-white/15" onClick={onClearAll}>
              Temizle
            </button>
            <button type="button" className="rounded-xl bg-white/10 px-3 py-2 text-xs hover:bg-white/15" onClick={onClose}>
              Kapat
            </button>
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-[220px_1fr]">
          <aside className="border-b border-white/10 p-3 md:border-b-0 md:border-r">
            <nav className="space-y-2">
              {(
                [
                  ["regions", "Bölgeler"],
                  ["countries", "Ülkeler"],
                  ["actors", "Aktörler"],
                  ["events", "Olaylar"],
                ] as Array<[Tab, string]>
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTab(k)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    tab === k ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="text-xs font-semibold text-white/70">Dışa Aktar</div>
              <button
                type="button"
                className="mt-2 w-full rounded-xl bg-white/10 px-3 py-2 text-xs hover:bg-white/15"
                onClick={async () => {
                  await navigator.clipboard.writeText(exportText);
                  setExportCopied(true);
                  setTimeout(() => setExportCopied(false), 1200);
                }}
              >
                {exportCopied ? "Kopyalandı" : "database.ts kopyala"}
              </button>
            </div>
          </aside>

          <main className="p-4">
            {tab === "regions" ? (
              <div>
                <div className="text-sm font-semibold">Bölgeler</div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs font-semibold text-white/70">Yeni Bölge</div>
                    <div className="mt-2 grid gap-2">
                      <input
                        value={regionForm.id}
                        onChange={(e) => setRegionForm((p) => ({ ...p, id: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                        placeholder="id (örn: middle-east)"
                      />
                      <input
                        value={regionForm.name}
                        onChange={(e) => setRegionForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                        placeholder="Bölge adı"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          value={regionForm.map.longitude}
                          onChange={(e) => setRegionForm((p) => ({ ...p, map: { ...p.map, longitude: Number(e.target.value) } }))}
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                          placeholder="lng"
                        />
                        <input
                          value={regionForm.map.latitude}
                          onChange={(e) => setRegionForm((p) => ({ ...p, map: { ...p.map, latitude: Number(e.target.value) } }))}
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                          placeholder="lat"
                        />
                        <input
                          value={regionForm.map.zoom}
                          onChange={(e) => setRegionForm((p) => ({ ...p, map: { ...p.map, zoom: Number(e.target.value) } }))}
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                          placeholder="zoom"
                        />
                      </div>
                      <button
                        type="button"
                        className="rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
                        onClick={() => {
                          if (!regionForm.id.trim()) return;
                          update({ regions: [...db.regions.filter((r) => r.id !== regionForm.id), regionForm] });
                          setRegionForm({ id: "", name: "", map: { longitude: 0, latitude: 0, zoom: 3, pitch: 55, bearing: 0 } });
                        }}
                      >
                        Ekle / Güncelle
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs font-semibold text-white/70">Mevcut Bölgeler</div>
                    <div className="mt-2 max-h-[320px] space-y-2 overflow-auto">
                      {db.regions.map((r) => (
                        <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                          <button
                            type="button"
                            className="text-left"
                            onClick={() => setRegionForm(r)}
                          >
                            <div className="font-semibold">{r.name}</div>
                            <div className="text-xs text-white/50">{r.id}</div>
                          </button>
                          <button
                            type="button"
                            className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/15"
                            onClick={() => update({ regions: db.regions.filter((x) => x.id !== r.id) })}
                          >
                            Sil
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === "countries" ? (
              <div>
                <div className="text-sm font-semibold">Ülkeler</div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs font-semibold text-white/70">Yeni Ülke</div>
                    <div className="mt-2 grid gap-2">
                      <input
                        value={countryForm.id}
                        onChange={(e) => setCountryForm((p) => ({ ...p, id: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                        placeholder="id (örn: iran)"
                      />
                      <input
                        value={countryForm.name}
                        onChange={(e) => setCountryForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                        placeholder="Ülke adı"
                      />
                      <select
                        value={countryForm.regionId}
                        onChange={(e) => setCountryForm((p) => ({ ...p, regionId: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                      >
                        <option value="">regionId seç</option>
                        {regionIds.map((id) => (
                          <option key={id} value={id}>
                            {id}
                          </option>
                        ))}
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={countryForm.lngLat.lng}
                          onChange={(e) => setCountryForm((p) => ({ ...p, lngLat: { ...p.lngLat, lng: Number(e.target.value) } }))}
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                          placeholder="lng"
                        />
                        <input
                          value={countryForm.lngLat.lat}
                          onChange={(e) => setCountryForm((p) => ({ ...p, lngLat: { ...p.lngLat, lat: Number(e.target.value) } }))}
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                          placeholder="lat"
                        />
                      </div>
                      <button
                        type="button"
                        className="rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
                        onClick={() => {
                          if (!countryForm.id.trim()) return;
                          update({ countries: [...db.countries.filter((c) => c.id !== countryForm.id), countryForm] });
                          setCountryForm({ id: "", name: "", regionId: "", lngLat: { lng: 0, lat: 0 } });
                        }}
                      >
                        Ekle / Güncelle
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs font-semibold text-white/70">Mevcut Ülkeler</div>
                    <div className="mt-2 max-h-[320px] space-y-2 overflow-auto">
                      {db.countries.map((c) => (
                        <div key={c.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                          <button type="button" className="text-left" onClick={() => setCountryForm(c)}>
                            <div className="font-semibold">{c.name}</div>
                            <div className="text-xs text-white/50">{c.id} / {c.regionId}</div>
                          </button>
                          <button
                            type="button"
                            className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/15"
                            onClick={() => update({ countries: db.countries.filter((x) => x.id !== c.id) })}
                          >
                            Sil
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === "actors" ? (
              <div>
                <div className="text-sm font-semibold">Aktörler</div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs font-semibold text-white/70">Yeni Aktör</div>
                    <div className="mt-2 grid gap-2">
                      <input
                        value={actorForm.id}
                        onChange={(e) => setActorForm((p) => ({ ...p, id: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                        placeholder="id (örn: khamenei)"
                      />
                      <select
                        value={actorForm.type}
                        onChange={(e) => setActorForm((p) => ({ ...p, type: e.target.value as DbActorType }))}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                      >
                        <option value="leader">leader</option>
                        <option value="org">org</option>
                      </select>
                      <input
                        value={actorForm.name}
                        onChange={(e) => setActorForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                        placeholder="Ad"
                      />
                      <textarea
                        value={actorForm.description}
                        onChange={(e) => setActorForm((p) => ({ ...p, description: e.target.value }))}
                        className="h-20 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                        placeholder="Açıklama"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={actorForm.lngLat.lng}
                          onChange={(e) => setActorForm((p) => ({ ...p, lngLat: { ...p.lngLat, lng: Number(e.target.value) } }))}
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                          placeholder="lng"
                        />
                        <input
                          value={actorForm.lngLat.lat}
                          onChange={(e) => setActorForm((p) => ({ ...p, lngLat: { ...p.lngLat, lat: Number(e.target.value) } }))}
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                          placeholder="lat"
                        />
                      </div>
                      <input
                        value={actorForm.imageUrl ?? ""}
                        onChange={(e) => setActorForm((p) => ({ ...p, imageUrl: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                        placeholder="imageUrl (opsiyonel)"
                      />
                      <textarea
                        value={actorForm.analysis ?? ""}
                        onChange={(e) => setActorForm((p) => ({ ...p, analysis: e.target.value }))}
                        className="h-20 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                        placeholder="Analiz (opsiyonel)"
                      />
                      <button
                        type="button"
                        className="rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
                        onClick={() => {
                          if (!actorForm.id.trim()) return;
                          update({ actors: [...db.actors.filter((a) => a.id !== actorForm.id), actorForm] });
                          setActorForm({ id: "", type: "leader", name: "", description: "", analysis: "", lngLat: { lng: 0, lat: 0 }, imageUrl: "", relatedIds: [] });
                        }}
                      >
                        Ekle / Güncelle
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs font-semibold text-white/70">Mevcut Aktörler</div>
                    <div className="mt-2 max-h-[320px] space-y-2 overflow-auto">
                      {db.actors.map((a) => (
                        <div key={a.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                          <button type="button" className="text-left" onClick={() => setActorForm(a)}>
                            <div className="font-semibold">{a.name}</div>
                            <div className="text-xs text-white/50">{a.id} / {a.type}</div>
                          </button>
                          <button
                            type="button"
                            className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/15"
                            onClick={() => update({ actors: db.actors.filter((x) => x.id !== a.id) })}
                          >
                            Sil
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === "events" ? (
              <div>
                <div className="text-sm font-semibold">Olaylar</div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs font-semibold text-white/70">Yeni Olay</div>
                    <div className="mt-2 grid gap-2">
                      <input
                        value={eventForm.id}
                        onChange={(e) => setEventForm((p) => ({ ...p, id: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                        placeholder="id (örn: event-1)"
                      />
                      <input
                        value={eventForm.date}
                        onChange={(e) => setEventForm((p) => ({ ...p, date: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                        placeholder="date (YYYY-MM-DD)"
                      />
                      <input
                        value={eventForm.title}
                        onChange={(e) => setEventForm((p) => ({ ...p, title: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                        placeholder="Başlık"
                      />
                      <textarea
                        value={eventForm.analysis}
                        onChange={(e) => setEventForm((p) => ({ ...p, analysis: e.target.value }))}
                        className="h-28 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                        placeholder="Analiz"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={eventForm.lngLat.lng}
                          onChange={(e) => setEventForm((p) => ({ ...p, lngLat: { ...p.lngLat, lng: Number(e.target.value) } }))}
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                          placeholder="lng"
                        />
                        <input
                          value={eventForm.lngLat.lat}
                          onChange={(e) => setEventForm((p) => ({ ...p, lngLat: { ...p.lngLat, lat: Number(e.target.value) } }))}
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                          placeholder="lat"
                        />
                      </div>
                      <input
                        value={eventForm.imageUrl ?? ""}
                        onChange={(e) => setEventForm((p) => ({ ...p, imageUrl: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                        placeholder="imageUrl (opsiyonel)"
                      />
                      <button
                        type="button"
                        className="rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
                        onClick={() => {
                          if (!eventForm.id.trim()) return;
                          update({ events: [...db.events.filter((e) => e.id !== eventForm.id), eventForm] });
                          setEventForm({ id: "", date: "", title: "", analysis: "", lngLat: { lng: 0, lat: 0 }, imageUrl: "", relatedIds: [] });
                        }}
                      >
                        Ekle / Güncelle
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs font-semibold text-white/70">Mevcut Olaylar</div>
                    <div className="mt-2 max-h-[320px] space-y-2 overflow-auto">
                      {db.events.map((e) => (
                        <div key={e.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                          <button type="button" className="text-left" onClick={() => setEventForm(e)}>
                            <div className="font-semibold">{e.title}</div>
                            <div className="text-xs text-white/50">{e.id} / {e.date}</div>
                          </button>
                          <button
                            type="button"
                            className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/15"
                            onClick={() => update({ events: db.events.filter((x) => x.id !== e.id) })}
                          >
                            Sil
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
