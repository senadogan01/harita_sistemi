"use client";

import { useMemo } from "react";
import { Calendar } from "lucide-react";
import type { StrategicEvent } from "@/types/strategic";

export function Timeline({
  year,
  onChange,
  events,
  selectedEventId,
  onSelectEvent,
}: {
  year: number;
  onChange: (year: number) => void;
  events: StrategicEvent[];
  selectedEventId: string | null;
  onSelectEvent: (eventId: string) => void;
}) {
  const label = useMemo(() => `${year}`, [year]);
  const startYear = 1900;
  const endYear = 2026;

  return (
    <div className="pointer-events-auto absolute bottom-4 left-1/2 w-[min(900px,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-2.5 px-3 py-1.5">
        <div className="grid h-7 w-7 place-items-center rounded-xl bg-white/10">
          <Calendar className="h-3.5 w-3.5 text-white/80" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>{startYear}</span>
            <span className="font-semibold text-white/80">{label}</span>
            <span>{endYear}</span>
          </div>

          <div className="relative mt-1">
            <input
              type="range"
              min={startYear}
              max={endYear}
              value={year}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full accent-white"
            />

            <div className="pointer-events-none absolute inset-x-0 -top-3.5 h-3.5">
              {events.map((ev) => {
                const pct = ((ev.year - startYear) / (endYear - startYear)) * 100;
                const selected = selectedEventId === ev.id;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    title={ev.title}
                    onClick={() => onSelectEvent(ev.id)}
                    className={`pointer-events-auto absolute -translate-x-1/2 rounded-md border px-1 py-0 text-[9px] backdrop-blur-md transition-colors ${
                      selected
                        ? "border-white/30 bg-white/15 text-white/90"
                        : "border-white/10 bg-black/30 text-white/75 hover:bg-white/10"
                    }`}
                    style={{ left: `${pct}%` }}
                  >
                    <span className="hidden sm:inline">{ev.title}</span>
                    <span className="sm:hidden">{ev.year}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
