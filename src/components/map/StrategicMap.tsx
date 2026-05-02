"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Marker,
  NavigationControl,
  type MapRef as MapboxMapRef,
} from "react-map-gl/mapbox";
import MapLibre, {
  Marker as MapLibreMarker,
  NavigationControl as MapLibreNavigationControl,
  Popup as MapLibrePopup,
  type MapRef as MapLibreMapRef,
} from "react-map-gl/maplibre";
import { Popup } from "react-map-gl/mapbox";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import { MapPin as MapPinIcon } from "lucide-react";
import type { FogSpecification } from "mapbox-gl";
import type { MapItem } from "@/types/strategic";

type MapController = {
  flyTo: (...args: unknown[]) => void;
  fitBounds: (...args: unknown[]) => void;
  getMap?: () => unknown;
};

export function StrategicMap({
  items,
  onSelectItem,
  onMapClick,
  onMapHover,
  onControllerReady,
  projectionName,
  clickedLocation,
  onCloseClickedLocation,
  placeMarkers,
  onSelectPlaceMarker,
}: {
  items: MapItem[];
  onSelectItem: (item: MapItem) => void;
  onMapClick: (lng: number, lat: number) => void;
  onMapHover?: (lng: number, lat: number) => void;
  onControllerReady?: (controller: MapController) => void;
  projectionName?: "globe" | "mercator";
  clickedLocation?: {
    lng: number;
    lat: number;
    label?: string;
    details?: string;
    country?: string;
  } | null;
  onCloseClickedLocation?: () => void;
  placeMarkers?: Array<{ id: string; name: string; kind: string; lng: number; lat: number }>;
  onSelectPlaceMarker?: (placeId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapboxRef = useRef<MapboxMapRef | null>(null);
  const mapLibreRef = useRef<MapLibreMapRef | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim().replace(/^['"]|['"]$/g, "");
  const preferMapbox = process.env.NEXT_PUBLIC_PREFER_MAPBOX === "1";
  const [mapError, setMapError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const tokenLooksValid = useMemo(() => {
    if (!token) return false;
    if (!token.startsWith("pk.")) return false;
    return token.length >= 50;
  }, [token]);

  const shouldFallbackToMapLibre = useMemo(() => {
    if (!preferMapbox) return true;
    if (!tokenLooksValid) return true;
    if (!mapError) return false;
    const msg = mapError.toLowerCase();
    return msg.includes("token") || msg.includes("access token") || msg.includes("geçersiz");
  }, [mapError, preferMapbox, tokenLooksValid]);

  const mapLibreStyle = useMemo<StyleSpecification>(
    () => ({
      version: 8,
      name: "OSM Raster (Dark)",
      sources: {
        osm: {
          type: "raster",
          tiles: [
            "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
            "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
            "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution:
            "© OpenStreetMap contributors",
        },
      },
      layers: [
        {
          id: "background",
          type: "background",
          paint: {
            "background-color": "#070A12",
          },
        },
        {
          id: "osm",
          type: "raster",
          source: "osm",
          paint: {
            "raster-opacity": 1,
            "raster-brightness-max": 0.9,
            "raster-contrast": 0.1,
            "raster-saturation": -0.2,
          },
        },
      ],
    }),
    [],
  );

  const initialViewState = useMemo(
    () => ({
      longitude: 34.8,
      latitude: 38.9,
      zoom: 2.8,
      pitch: 55,
      bearing: -20,
    }),
    [],
  );

  const handleLoad = useCallback(() => {
    const map = mapboxRef.current?.getMap();
    if (!map) return;

    const m = map as unknown as {
      getSource: (id: string) => unknown;
      addSource: (id: string, source: unknown) => void;
      setTerrain: (t: unknown) => void;
      setFog: (f: FogSpecification) => void;
    };

    if (!m.getSource("mapbox-dem")) {
      m.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
    }

    m.setTerrain({ source: "mapbox-dem", exaggeration: 1.25 });

    const fog: FogSpecification = {
      range: [0.5, 10] as [number, number],
      color: "#0b1220",
      "high-color": "#1b2a4a",
      "space-color": "#000000",
      "horizon-blend": 0.2,
      "star-intensity": 0.15,
    };

    m.setFog(fog);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const active = (mapboxRef.current ?? mapLibreRef.current) as unknown as { getMap?: () => { resize?: () => void } };
      active?.getMap?.()?.resize?.();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const sharedOverlay = (
    <>
      <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[11px] text-white/75 backdrop-blur-md">
        <div>
          token: <span className="font-semibold">{token ? `ok (${token.length})` : "missing"}</span>
        </div>
        <div>
          loaded: <span className="font-semibold">{loaded ? "yes" : "no"}</span>
        </div>
        <div>
          engine: <span className="font-semibold">{shouldFallbackToMapLibre ? "maplibre" : "mapbox"}</span>
        </div>
        <div>
          preferMapbox: <span className="font-semibold">{preferMapbox ? "1" : "0"}</span>
        </div>
        <div className="max-w-[260px] truncate">
          error: <span className="font-semibold">{mapError ?? "-"}</span>
        </div>
      </div>

      {shouldFallbackToMapLibre ? (
        <div className="pointer-events-none absolute right-3 top-20 z-10 max-w-[320px] rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[11px] text-white/75 backdrop-blur-md">
          Mapbox token geçersiz/eksik görünüyor. Dünya haritası MapLibre (OSM) fallback ile gösteriliyor.
        </div>
      ) : null}
    </>
  );

  if (shouldFallbackToMapLibre) {
    return (
      <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: "100vh" }}>
        <MapLibre
          mapLib={maplibregl}
          ref={mapLibreRef}
          initialViewState={initialViewState}
          mapStyle={mapLibreStyle}
          onLoad={() => {
            setLoaded(true);
            const controller = mapLibreRef.current as unknown as MapController;
            if (controller) onControllerReady?.(controller);
          }}
          onError={(e) => {
            const maybe = e as unknown as { error?: { message?: string } };
            const msg = maybe?.error?.message ?? "Bilinmeyen harita hatası";
            setMapError(msg);
          }}
          onClick={(e) => onMapClick(e.lngLat.lng, e.lngLat.lat)}
          onMouseMove={(e) => onMapHover?.(e.lngLat.lng, e.lngLat.lat)}
          style={{ width: "100%", height: "100%", minHeight: "100vh", position: "relative", zIndex: 0 }}
          attributionControl={false}
        >
          {sharedOverlay}
          <MapLibreNavigationControl position="bottom-right" />

          {clickedLocation ? (
            <MapLibrePopup
              longitude={clickedLocation.lng}
              latitude={clickedLocation.lat}
              anchor="bottom"
              closeButton
              closeOnClick={false}
              onClose={onCloseClickedLocation}
            >
              <div className="min-w-[220px] max-w-[280px] text-xs text-black">
                <div className="font-semibold">{clickedLocation.label ?? "Seçilen nokta"}</div>
                {clickedLocation.country ? <div className="mt-1 opacity-80">{clickedLocation.country}</div> : null}
                {clickedLocation.details ? (
                  <div className="mt-1 opacity-80">{clickedLocation.details}</div>
                ) : (
                  <div className="mt-1 opacity-60">Yer bilgisi yükleniyor...</div>
                )}
                <div className="mt-2 font-mono text-[10px] text-gray-500">
                  {clickedLocation.lat.toFixed(6)}, {clickedLocation.lng.toFixed(6)}
                </div>
              </div>
            </MapLibrePopup>
          ) : null}

          {items.map((pin) => (
            <MapLibreMarker
              key={pin.id}
              longitude={pin.lngLat.lng}
              latitude={pin.lngLat.lat}
              anchor="bottom"
              onClick={(ev) => {
                ev.originalEvent.stopPropagation();
                onSelectItem(pin);
              }}
            >
              <button
                type="button"
                className="group grid place-items-center rounded-full bg-white/10 p-2 backdrop-blur-md ring-1 ring-white/15 hover:bg-white/15"
                aria-label={pin.title}
              >
                <MapPinIcon className="h-5 w-5 text-white/90 drop-shadow" />
                <span className="pointer-events-none absolute -top-10 hidden whitespace-nowrap rounded-lg bg-black/60 px-2 py-1 text-xs text-white/90 group-hover:block">
                  {pin.title}
                </span>
              </button>
            </MapLibreMarker>
          ))}

          {(placeMarkers ?? []).map((p) => (
            <MapLibreMarker
              key={p.id}
              longitude={p.lng}
              latitude={p.lat}
              anchor="bottom"
              onClick={(ev) => {
                ev.originalEvent.stopPropagation();
                onSelectPlaceMarker?.(p.id);
              }}
            >
              <button
                type="button"
                className="group grid place-items-center rounded-full bg-emerald-400/20 p-2 backdrop-blur-md ring-1 ring-emerald-200/20 hover:bg-emerald-400/30"
                aria-label={p.name}
              >
                <MapPinIcon className="h-5 w-5 text-emerald-100/90 drop-shadow" />
                <span className="pointer-events-none absolute -top-10 hidden whitespace-nowrap rounded-lg bg-black/60 px-2 py-1 text-xs text-white/90 group-hover:block">
                  {p.name}
                </span>
              </button>
            </MapLibreMarker>
          ))}
        </MapLibre>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: "100vh" }}>
      <Map
        ref={mapboxRef}
        initialViewState={initialViewState}
        projection={{ name: projectionName ?? "globe" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={token}
        onLoad={() => {
          setLoaded(true);
          const controller = mapboxRef.current as unknown as MapController;
          if (controller) onControllerReady?.(controller);
          handleLoad();
        }}
        onError={(e) => {
          const msg = e?.error?.message ?? "Bilinmeyen Mapbox hatası";
          setMapError(msg);
        }}
        onClick={(e) => onMapClick(e.lngLat.lng, e.lngLat.lat)}
        onMouseMove={(e) => onMapHover?.(e.lngLat.lng, e.lngLat.lat)}
        terrain={{ source: "mapbox-dem", exaggeration: 1.25 }}
        style={{ width: "100%", height: "100%", minHeight: "100vh", position: "relative", zIndex: 0 }}
        attributionControl={false}
      >
        {sharedOverlay}
        <NavigationControl position="bottom-right" />

        {clickedLocation ? (
          <Popup
            longitude={clickedLocation.lng}
            latitude={clickedLocation.lat}
            anchor="bottom"
            closeButton
            closeOnClick={false}
            onClose={onCloseClickedLocation}
          >
            <div className="min-w-[220px] max-w-[280px] text-xs text-black">
              <div className="font-semibold">{clickedLocation.label ?? "Seçilen nokta"}</div>
              {clickedLocation.country ? <div className="mt-1 opacity-80">{clickedLocation.country}</div> : null}
              {clickedLocation.details ? (
                <div className="mt-1 opacity-80">{clickedLocation.details}</div>
              ) : (
                <div className="mt-1 opacity-60">Yer bilgisi yükleniyor...</div>
              )}
              <div className="mt-2 font-mono text-[10px] text-gray-500">
                {clickedLocation.lat.toFixed(6)}, {clickedLocation.lng.toFixed(6)}
              </div>
            </div>
          </Popup>
        ) : null}

        {items.map((pin) => (
          <Marker
            key={pin.id}
            longitude={pin.lngLat.lng}
            latitude={pin.lngLat.lat}
            anchor="bottom"
            onClick={(ev) => {
              ev.originalEvent.stopPropagation();
              onSelectItem(pin);
            }}
          >
            <button
              type="button"
              className="group grid place-items-center rounded-full bg-white/10 p-2 backdrop-blur-md ring-1 ring-white/15 hover:bg-white/15"
              aria-label={pin.title}
            >
              <MapPinIcon className="h-5 w-5 text-white/90 drop-shadow" />
              <span className="pointer-events-none absolute -top-10 hidden whitespace-nowrap rounded-lg bg-black/60 px-2 py-1 text-xs text-white/90 group-hover:block">
                {pin.title}
              </span>
            </button>
          </Marker>
        ))}

        {(placeMarkers ?? []).map((p) => (
          <Marker
            key={p.id}
            longitude={p.lng}
            latitude={p.lat}
            anchor="bottom"
            onClick={(ev) => {
              ev.originalEvent.stopPropagation();
              onSelectPlaceMarker?.(p.id);
            }}
          >
            <button
              type="button"
              className="group grid place-items-center rounded-full bg-emerald-400/20 p-2 backdrop-blur-md ring-1 ring-emerald-200/20 hover:bg-emerald-400/30"
              aria-label={p.name}
            >
              <MapPinIcon className="h-5 w-5 text-emerald-100/90 drop-shadow" />
              <span className="pointer-events-none absolute -top-10 hidden whitespace-nowrap rounded-lg bg-black/60 px-2 py-1 text-xs text-white/90 group-hover:block">
                {p.name}
              </span>
            </button>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
