-- Merkle Analytic Platform Assessment — Supabase schema
-- Run this once in the Supabase dashboard → SQL Editor → New query → Run.

create extension if not exists "pgcrypto";

-- Master rubric (platforms, pillars, capabilities, sub-capabilities, support, SME rationale)
-- stored as a single JSON document under id = 'master'.
create table if not exists public.rubrics (
  id          text primary key default 'master',
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

-- Saved assessments. Each row is a self-contained snapshot
-- (platforms + rubric + MoSCoW/needs selections) so it stays reproducible
-- even after the master rubric changes later.
create table if not exists public.assessments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  client      text,
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists assessments_updated_idx on public.assessments (updated_at desc);

-- Row Level Security
alter table public.rubrics      enable row level security;
alter table public.assessments  enable row level security;

-- ⚠ Internal-tool policies: allow the public anon key full access.
-- This is fine for an internal tool behind a private URL, but for real
-- production you should enable Supabase Auth and change `to anon`
-- to `to authenticated` (and optionally scope rows to a team/owner).
drop policy if exists "rubrics_anon_all" on public.rubrics;
create policy "rubrics_anon_all" on public.rubrics
  for all to anon using (true) with check (true);

drop policy if exists "assessments_anon_all" on public.assessments;
create policy "assessments_anon_all" on public.assessments
  for all to anon using (true) with check (true);
