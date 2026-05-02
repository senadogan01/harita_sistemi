import { NextResponse } from "next/server";

type CacheEntry = { status: number; body: string; contentType: string; ts: number };

const g = globalThis as unknown as {
  __nominatimReverseCache?: Map<string, CacheEntry>;
};

const cache = (g.__nominatimReverseCache ??= new Map<string, CacheEntry>());
const TTL_MS = 1000 * 60 * 60 * 24;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const zoom = searchParams.get("zoom") ?? "18";

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  const cacheKey = `z=${zoom}&lat=${Number(lat).toFixed(6)}&lon=${Number(lon).toFixed(6)}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.ts < TTL_MS) {
    return new NextResponse(hit.body, {
      status: hit.status,
      headers: {
        "Content-Type": hit.contentType,
        "Cache-Control": "no-store",
        "X-Cache": "HIT",
      },
    });
  }

  const upstream =
    "https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1" +
    `&zoom=${encodeURIComponent(zoom)}` +
    `&lat=${encodeURIComponent(lat)}` +
    `&lon=${encodeURIComponent(lon)}` +
    `&email=${encodeURIComponent(process.env.NOMINATIM_EMAIL ?? "local-dev@example.com")}`;

  const res = await fetch(upstream, {
    headers: {
      Accept: "application/json",
      "User-Agent": "harita_sistemi/1.0 (proxy; contact: local-dev)",
      Referer: "http://localhost:3000",
    },
    cache: "no-store",
  });

  const text = await res.text();

  cache.set(cacheKey, {
    status: res.status,
    body: text,
    contentType: res.headers.get("content-type") ?? "application/json",
    ts: Date.now(),
  });

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  });
}
