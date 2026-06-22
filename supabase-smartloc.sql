-- SMARTLOC Supabase schema
-- Jalankan file ini di Supabase Dashboard > SQL Editor.

create table if not exists public.smartloc_users (
  id text primary key,
  name text not null,
  email text not null unique,
  password text not null,
  role text not null check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

create table if not exists public.smartloc_criteria (
  id text primary key,
  name text not null,
  weight numeric not null default 0,
  kind text not null check (kind in ('benefit', 'cost')),
  attribute text,
  unit text
);

create table if not exists public.smartloc_alternatives (
  id text primary key,
  name text not null,
  address text not null,
  latitude numeric not null,
  longitude numeric not null,
  photo_url text not null,
  values jsonb not null default '{}'::jsonb
);

create table if not exists public.smartloc_expert_datasets (
  id text primary key,
  expert_name text not null,
  expertise text not null default '',
  source text not null default '',
  imported_at timestamptz not null default now(),
  notes text not null default '',
  criteria jsonb not null default '[]'::jsonb,
  alternatives jsonb not null default '[]'::jsonb,
  smart_ranking jsonb not null default '[]'::jsonb,
  saw_ranking jsonb not null default '[]'::jsonb
);

create table if not exists public.smartloc_landing_media (
  id text primary key,
  title text not null,
  location_name text not null,
  type text not null check (type in ('image', 'video')),
  url text not null,
  poster_url text,
  caption text not null default '',
  created_at timestamptz not null default now()
);

alter table public.smartloc_users enable row level security;
alter table public.smartloc_criteria enable row level security;
alter table public.smartloc_alternatives enable row level security;
alter table public.smartloc_expert_datasets enable row level security;
alter table public.smartloc_landing_media enable row level security;

-- Bucket publik untuk foto/video SMARTLOC.
insert into storage.buckets (id, name, public)
values ('smartloc-media', 'smartloc-media', true)
on conflict (id) do update set public = true;

-- Izinkan browser mengunggah media ke bucket ini memakai anon key.
-- Database aplikasi tetap aman karena tabel hanya diakses lewat server/service role.
drop policy if exists "smartloc media public read" on storage.objects;
create policy "smartloc media public read"
on storage.objects for select
to public
using (bucket_id = 'smartloc-media');

drop policy if exists "smartloc media anon insert" on storage.objects;
create policy "smartloc media anon insert"
on storage.objects for insert
to anon
with check (bucket_id = 'smartloc-media');

drop policy if exists "smartloc media anon update" on storage.objects;
create policy "smartloc media anon update"
on storage.objects for update
to anon
using (bucket_id = 'smartloc-media')
with check (bucket_id = 'smartloc-media');
