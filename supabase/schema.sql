-- ===================================================================
-- Merkle Analytic Platform Assessment - Supabase schema
-- Run once in the Supabase SQL Editor (SQL Editor > New query > Run).
-- ===================================================================

-- Single master rubric. One row, id = 'master'.
--   data = { platforms:[...], rubric:{...}, _rev:"clientId:ts" }
create table if not exists public.rubrics (
  id          text primary key,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Assessments store ONLY the client selections; the rubric is shared.
--   data = { moscow:{capId:priority}, needs:{subId:bool} }
create table if not exists public.assessments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  client      text,
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Live sync for the rubric editor (multiple editors see each other's saves).
do $$ begin
  alter publication supabase_realtime add table public.rubrics;
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------------
-- Row Level Security.
-- The policies below are OPEN (anon can read/write) so the static site
-- works with only the publishable key. This is fine for an internal,
-- unlisted, noindex tool. For real production, turn on Supabase Auth and
-- replace `to anon` with `to authenticated` on every policy below.
-- ------------------------------------------------------------------
alter table public.rubrics      enable row level security;
alter table public.assessments  enable row level security;

drop policy if exists rubrics_all on public.rubrics;
create policy rubrics_all on public.rubrics
  for all to anon using (true) with check (true);

drop policy if exists assessments_all on public.assessments;
create policy assessments_all on public.assessments
  for all to anon using (true) with check (true);
