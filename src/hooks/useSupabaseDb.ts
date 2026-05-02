"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { db as defaultDb, type DbActor, type DbCountry, type DbEvent, type DbRegion } from "@/data/database";
import { supabase } from "@/lib/supabase";

export type LocalDb = {
  regions: DbRegion[];
  countries: DbCountry[];
  actors: DbActor[];
  events: DbEvent[];
};

type ActorRow = {
  id: string;
  type: DbActor["type"];
  name: string;
  description: string | null;
  lng: number;
  lat: number;
  image_url: string | null;
  analysis: string | null;
  related_ids: string[] | null;
};

type EventRow = {
  id: string;
  date: string;
  title: string;
  analysis: string | null;
  lng: number;
  lat: number;
  image_url: string | null;
  related_ids: string[] | null;
};

type CountryRow = {
  id: string;
  name: string;
  region_id: string;
  lng: number;
  lat: number;
};

const LOAD_TIMEOUT_MS = 8000;

const emptyDb: LocalDb = {
  regions: defaultDb.regions,
  countries: [],
  actors: [],
  events: [],
};

function actorFromRow(row: ActorRow): DbActor {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    description: row.description ?? "",
    lngLat: { lng: row.lng, lat: row.lat },
    imageUrl: row.image_url ?? undefined,
    analysis: row.analysis ?? "",
    relatedIds: row.related_ids ?? [],
  };
}

function eventFromRow(row: EventRow): DbEvent {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    analysis: row.analysis ?? "",
    lngLat: { lng: row.lng, lat: row.lat },
    imageUrl: row.image_url ?? undefined,
    relatedIds: row.related_ids ?? [],
  };
}

function countryFromRow(row: CountryRow): DbCountry {
  return {
    id: row.id,
    name: row.name,
    regionId: row.region_id,
    lngLat: { lng: row.lng, lat: row.lat },
  };
}

function actorToRow(actor: DbActor, userId: string) {
  return {
    id: actor.id,
    user_id: userId,
    type: actor.type,
    name: actor.name,
    description: actor.description,
    lng: actor.lngLat.lng,
    lat: actor.lngLat.lat,
    image_url: actor.imageUrl ?? null,
    analysis: actor.analysis ?? "",
    related_ids: actor.relatedIds ?? [],
  };
}

function eventToRow(event: DbEvent, userId: string) {
  return {
    id: event.id,
    user_id: userId,
    date: event.date,
    title: event.title,
    analysis: event.analysis,
    lng: event.lngLat.lng,
    lat: event.lngLat.lat,
    image_url: event.imageUrl ?? null,
    related_ids: event.relatedIds ?? [],
  };
}

function countryToRow(country: DbCountry, userId: string) {
  return {
    id: country.id,
    user_id: userId,
    name: country.name,
    region_id: country.regionId,
    lng: country.lngLat.lng,
    lat: country.lngLat.lat,
  };
}

async function withTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeout = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), LOAD_TIMEOUT_MS);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export function useSupabaseDb() {
  const [user, setUser] = useState<User | null>(null);
  const [db, setDbState] = useState<LocalDb>(emptyDb);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDb = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [countriesRes, actorsRes, eventsRes] = await withTimeout(
        Promise.all([
          supabase.from("countries").select("id,name,region_id,lng,lat").order("name"),
          supabase.from("actors").select("id,type,name,description,lng,lat,image_url,analysis,related_ids").order("name"),
          supabase.from("events").select("id,date,title,analysis,lng,lat,image_url,related_ids").order("date"),
        ]),
        "Veriler yüklenirken zaman aşımı oluştu",
      );

      const firstError = countriesRes.error ?? actorsRes.error ?? eventsRes.error;
      if (firstError) {
        setError(firstError.message);
        setDbState(emptyDb);
        setIsLoading(false);
        return;
      }

      setDbState({
        regions: defaultDb.regions as DbRegion[],
        countries: ((countriesRes.data ?? []) as CountryRow[]).map(countryFromRow),
        actors: ((actorsRes.data ?? []) as ActorRow[]).map(actorFromRow),
        events: ((eventsRes.data ?? []) as EventRow[]).map(eventFromRow),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Veriler yüklenemedi");
      setDbState(emptyDb);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        void loadDb();
      } else {
        setDbState(emptyDb);
        setIsLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        void loadDb();
      } else {
        setDbState(emptyDb);
        setIsLoading(false);
      }
    });

    return () => {
      alive = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadDb]);

  const setDb = useCallback(
    async (next: LocalDb) => {
      if (!user) return;
      setError(null);

      const nextActors = next.actors.map((actor) => actorToRow(actor, user.id));
      const nextEvents = next.events.map((event) => eventToRow(event, user.id));
      const nextCountries = next.countries.map((country) => countryToRow(country, user.id));

      const results = await Promise.all([
        nextActors.length > 0 ? supabase.from("actors").upsert(nextActors, { onConflict: "id,user_id" }) : Promise.resolve({ error: null }),
        nextEvents.length > 0 ? supabase.from("events").upsert(nextEvents, { onConflict: "id,user_id" }) : Promise.resolve({ error: null }),
        nextCountries.length > 0 ? supabase.from("countries").upsert(nextCountries, { onConflict: "id,user_id" }) : Promise.resolve({ error: null }),
      ]);

      const firstError = results.find((result) => result.error)?.error;
      if (firstError) {
        setError(firstError.message);
        throw firstError;
      }

      setDbState(next);
      void loadDb();
    },
    [loadDb, user],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const exportAsDatabaseTs = useMemo(() => {
    const asTs = (obj: unknown) => JSON.stringify(obj, null, 2);
    return `export const db = {\n  regions: ${asTs(db.regions)} as any,\n  countries: ${asTs(db.countries)} as any,\n  actors: ${asTs(db.actors)} as any,\n  events: ${asTs(db.events)} as any,\n};`;
  }, [db.actors, db.countries, db.events, db.regions]);

  return {
    db,
    setDb,
    user,
    signOut,
    isLoading,
    error,
    reload: user ? () => loadDb() : undefined,
    exportAsDatabaseTs,
  };
}
