import { NextResponse } from "next/server";

type CacheEntry = { status: number; body: string; contentType: string; ts: number };

const g = globalThis as unknown as {
  __nominatimSearchCache?: Map<string, CacheEntry>;
};

const cache = (g.__nominatimSearchCache ??= new Map<string, CacheEntry>());
const TTL_MS = 1000 * 60 * 60 * 24;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const limit = searchParams.get("limit") ?? "6";

  if (!q) {
    return NextResponse.json({ error: "Missing q" }, { status: 400 });
  }

  const cacheKey = `limit=${limit}&q=${q.trim().toLowerCase()}`;
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
    "https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1" +
    `&limit=${encodeURIComponent(limit)}` +
    `&q=${encodeURIComponent(q)}` +
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
