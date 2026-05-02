"use client";

import { Calendar, Crosshair, Image as ImageIcon, Tag, X } from "lucide-react";
import Image from "next/image";
import type { MapItem } from "@/types/strategic";

export function RightPanel({
  selectedItem,
  onClose,
}: {
  selectedItem: MapItem | null;
  onClose: () => void;
}) {
  if (!selectedItem) return null;

  return (
    <aside className="pointer-events-auto absolute right-4 top-4 bottom-24 w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white/90">{selectedItem.title}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/55">
            <span className="inline-flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              <span className="capitalize">{selectedItem.kind}</span>
            </span>
            {typeof selectedItem.year === "number" ? (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{selectedItem.year}</span>
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Crosshair className="h-3.5 w-3.5" />
              <span className="truncate">
                {selectedItem.lngLat.lat.toFixed(4)}, {selectedItem.lngLat.lng.toFixed(4)}
              </span>
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white/80 hover:bg-white/15"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="h-full overflow-y-auto px-4 py-4">
        <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          {selectedItem.imageUrl ? (
            <div className="relative h-40 w-full">
              <Image
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                fill
                className="object-cover"
                sizes="420px"
              />
            </div>
          ) : (
            <div className="flex h-28 items-center justify-center gap-2 text-xs text-white/50">
              <ImageIcon className="h-4 w-4" />
              <span>Görsel yok</span>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-xs font-semibold tracking-wide text-white/60">Özet</div>
          <div className="mt-2 text-sm leading-6 text-white/85">{selectedItem.summary}</div>
        </div>

        {selectedItem.analysis ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs font-semibold tracking-wide text-white/60">Analiz</div>
            <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/80">
              {selectedItem.analysis}
            </div>
          </div>
        ) : null}

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-xs font-semibold tracking-wide text-white/60">Analiz (İskelet)</div>
          <div className="mt-2 space-y-2 text-sm text-white/75">
            <div className="rounded-xl bg-white/5 px-3 py-2">Kilit çıkarımlar</div>
            <div className="rounded-xl bg-white/5 px-3 py-2">Risk & fırsatlar</div>
            <div className="rounded-xl bg-white/5 px-3 py-2">Tarihsel bağlam</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
