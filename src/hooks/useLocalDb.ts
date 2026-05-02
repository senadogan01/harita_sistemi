"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { DbActor, DbCountry, DbEvent, DbRegion } from "@/data/database";
import { db as defaultDb } from "@/data/database";

export type LocalDb = {
  regions: DbRegion[];
  countries: DbCountry[];
  actors: DbActor[];
  events: DbEvent[];
};

const STORAGE_KEY = "strategic_db_v1";
const EMIT_EVENT = "strategic_db_v1_changed";

const DEFAULT_SNAPSHOT: LocalDb = {
  regions: defaultDb.regions,
  countries: defaultDb.countries,
  actors: defaultDb.actors,
  events: defaultDb.events,
};

let lastRawCache: string | null = null;
let lastSnapshotCache: LocalDb = DEFAULT_SNAPSHOT;

const getServerSnapshot = () => DEFAULT_SNAPSHOT;

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeDb(value: unknown): LocalDb {
  const v = value as Partial<LocalDb> | null;
  return {
    regions: Array.isArray(v?.regions) ? (v!.regions as DbRegion[]) : defaultDb.regions,
    countries: Array.isArray(v?.countries) ? (v!.countries as DbCountry[]) : defaultDb.countries,
    actors: Array.isArray(v?.actors) ? (v!.actors as DbActor[]) : defaultDb.actors,
    events: Array.isArray(v?.events) ? (v!.events as DbEvent[]) : defaultDb.events,
  };
}

export function useLocalDb() {
  const getSnapshot = useCallback((): LocalDb => {
    if (typeof window === "undefined") return DEFAULT_SNAPSHOT;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === lastRawCache) return lastSnapshotCache;

    lastRawCache = raw;
    if (!raw) {
      lastSnapshotCache = DEFAULT_SNAPSHOT;
      return lastSnapshotCache;
    }

    lastSnapshotCache = normalizeDb(safeParse(raw));
    return lastSnapshotCache;
  }, []);

  const subscribe = useCallback((onStoreChange: () => void) => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      onStoreChange();
    };

    const onCustom = () => onStoreChange();

    window.addEventListener("storage", onStorage);
    window.addEventListener(EMIT_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EMIT_EVENT, onCustom);
    };
  }, []);

  const db = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setDb = useCallback((next: LocalDb) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EMIT_EVENT));
  }, []);

  const resetToFileDb = useCallback(() => {
    setDb(normalizeDb(defaultDb));
  }, [setDb]);

  const clearAll = useCallback(() => {
    setDb({ regions: [], countries: [], actors: [], events: [] });
  }, [setDb]);

  const exportAsDatabaseTs = useMemo(() => {
    const asTs = (obj: unknown) => JSON.stringify(obj, null, 2);
    return `export const db = {\n  regions: ${asTs(db.regions)} as any,\n  countries: ${asTs(db.countries)} as any,\n  actors: ${asTs(db.actors)} as any,\n  events: ${asTs(db.events)} as any,\n};`;
  }, [db.actors, db.countries, db.events, db.regions]);

  return {
    db,
    setDb,
    resetToFileDb,
    clearAll,
    exportAsDatabaseTs,
  };
}
