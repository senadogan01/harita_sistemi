"use client";

import { useMemo, useState } from "react";
import { Globe } from "lucide-react";
import type { DbRegionId } from "@/data/database";
import { db as defaultDb } from "@/data/database";

export function LeftPanel({
  onSelectRegion,
  hoveredLabel,
  selectedCountry,
  activeRegionId: controlledActiveRegionId,
  onActiveRegionChange,
  db = defaultDb,
}: {
  onSelectRegion: (regionId: DbRegionId) => void;
  hoveredLabel?: string | null;
  selectedCountry?: string | null;
  activeRegionId?: DbRegionId;
  onActiveRegionChange?: (regionId: DbRegionId) => void;
  db?: typeof defaultDb;
}) {
  const [uncontrolledActiveRegionId, setUncontrolledActiveRegionId] = useState<DbRegionId>("middle-east");

  const activeRegionId = controlledActiveRegionId ?? uncontrolledActiveRegionId;

  const setActiveRegionId = (next: DbRegionId) => {
    onActiveRegionChange?.(next);
    if (controlledActiveRegionId === undefined) setUncontrolledActiveRegionId(next);
  };

  const effectiveActiveRegionId = useMemo<DbRegionId>(() => {
    if (db.regions.length === 0) return activeRegionId;
    const stillExists = db.regions.some((r) => r.id === activeRegionId);
    if (stillExists) return activeRegionId;
    return db.regions[0]!.id as DbRegionId;
  }, [activeRegionId, db.regions]);

  const activeRegion = useMemo(
    () => db.regions.find((r) => r.id === effectiveActiveRegionId) ?? db.regions[0],
    [db.regions, effectiveActiveRegionId],
  );

  return (
    <aside className="pointer-events-auto absolute left-4 top-4 bottom-24 w-[340px] overflow-hidden rounded-2xl border border-violet-200/15 bg-gradient-to-b from-violet-500/10 to-indigo-500/5 backdrop-blur-xl shadow-2xl">
      <div className="flex h-full flex-col">
        <div className="border-b border-violet-200/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/20 ring-1 ring-violet-200/15">
                <Globe className="h-5 w-5 text-white/90" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white/90">STRATEJİK MENÜ</div>
                <div className="mt-0.5 text-xs text-white/55">Bölge seç</div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-full overflow-y-auto px-4 py-3">
          <section className="mb-5">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-white/70">
              <Globe className="h-4 w-4" />
              <span>BÖLGELER</span>
            </div>
            <div className="space-y-2">
              {db.regions.map((r) => {
                const active = r.id === effectiveActiveRegionId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setActiveRegionId(r.id);
                      onSelectRegion(r.id);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                      active
                        ? "border-violet-200/25 bg-violet-500/20 text-white/95"
                        : "border-violet-200/10 bg-black/20 text-white/85 hover:bg-violet-500/10"
                    }`}
                  >
                    <span className="truncate font-semibold">{r.name}</span>
                    <span className="text-xs text-white/45">{r.id}</span>
                  </button>
                );
              })}
            </div>
          </section>

        <div className="mt-2 rounded-xl border border-violet-200/10 bg-black/20 px-3 py-2 text-xs text-white/55">
          <div className="font-semibold text-white/70">Aktif Bölge</div>
          <div className="mt-1">
            {activeRegion?.name} <span className="text-white/40">({activeRegionId})</span>
          </div>
          {selectedCountry ? <div className="mt-1 text-white/65">Seçili ülke: {selectedCountry}</div> : null}
          {hoveredLabel ? <div className="mt-1 text-white/65">{hoveredLabel}</div> : null}
        </div>
      </div>
    </div>
    </aside>
  );
}
