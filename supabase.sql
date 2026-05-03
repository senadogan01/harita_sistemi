create table if not exists public.countries (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  region_id text not null,
  lng double precision not null,
  lat double precision not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id, user_id)
);

create table if not exists public.actors (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('leader', 'org')),
  name text not null,
  description text not null default '',
  lng double precision not null,
  lat double precision not null,
  image_url text,
  analysis text not null default '',
  related_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id, user_id)
);

create table if not exists public.events (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  date text not null,
  title text not null,
  analysis text not null default '',
  lng double precision not null,
  lat double precision not null,
  image_url text,
  related_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id, user_id)
);

alter table public.countries enable row level security;
alter table public.actors enable row level security;
alter table public.events enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.countries to authenticated;
grant select, insert, update, delete on public.actors to authenticated;
grant select, insert, update, delete on public.events to authenticated;

drop policy if exists "Users can select own countries" on public.countries;
drop policy if exists "Users can insert own countries" on public.countries;
drop policy if exists "Users can update own countries" on public.countries;
drop policy if exists "Users can delete own countries" on public.countries;

create policy "Users can select own countries" on public.countries for select using (auth.uid() = user_id);
create policy "Users can insert own countries" on public.countries for insert with check (auth.uid() = user_id);
create policy "Users can update own countries" on public.countries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own countries" on public.countries for delete using (auth.uid() = user_id);

drop policy if exists "Users can select own actors" on public.actors;
drop policy if exists "Users can insert own actors" on public.actors;
drop policy if exists "Users can update own actors" on public.actors;
drop policy if exists "Users can delete own actors" on public.actors;

create policy "Users can select own actors" on public.actors for select using (auth.uid() = user_id);
create policy "Users can insert own actors" on public.actors for insert with check (auth.uid() = user_id);
create policy "Users can update own actors" on public.actors for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own actors" on public.actors for delete using (auth.uid() = user_id);

drop policy if exists "Users can select own events" on public.events;
drop policy if exists "Users can insert own events" on public.events;
drop policy if exists "Users can update own events" on public.events;
drop policy if exists "Users can delete own events" on public.events;

create policy "Users can select own events" on public.events for select using (auth.uid() = user_id);
create policy "Users can insert own events" on public.events for insert with check (auth.uid() = user_id);
create policy "Users can update own events" on public.events for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own events" on public.events for delete using (auth.uid() = user_id);
