-- Iskan — Supabase schema
-- Run once in the Supabase Dashboard: SQL Editor → New query → Run.
--
-- After running this, copy the project URL and the service_role key into your
-- .env file (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY) and restart the app.

-- 1. Listings ---------------------------------------------------------------
create table if not exists public.properties (
  slug       text primary key,
  data       jsonb not null,
  purpose    text not null default 'sale',
  featured   boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_created_at_idx
  on public.properties (created_at desc);

create index if not exists properties_purpose_idx
  on public.properties (purpose);

-- 2. Admin users ------------------------------------------------------------
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  username      text not null unique,
  name          text not null default '',
  role          text not null default 'viewer'
                check (role in ('admin', 'editor', 'viewer')),
  password_hash text not null,
  created_at    timestamptz not null default now()
);

-- 3. Lock the tables down ---------------------------------------------------
-- All access happens server-side with the service_role key, which bypasses RLS.
-- Enabling RLS with no policies means the public anon key cannot read or write
-- these tables at all.
alter table public.properties enable row level security;
alter table public.users enable row level security;

-- 4. Image storage bucket ---------------------------------------------------
-- Public bucket: images are readable by URL, writes go through the service role.
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do update set public = true;
