-- ===================================================================
-- Merkle Analytic Platform Assessment — normalized schema
--
-- WHY THIS CHANGED FROM THE ORIGINAL SINGLE-BLOB SCHEMA
-- The original schema kept the entire rubric (all pillars, capabilities,
-- sub-capabilities, vendors, AND the use-case library) as one ~90KB JSON
-- blob in a single row (rubrics.master). Every edit — even toggling one
-- checkbox — re-saved the WHOLE document. Two editors working in different
-- pillars at the same time could silently overwrite each other: whoever's
-- debounced save fired last would win with a stale copy of everything the
-- other person had just changed elsewhere in the document.
--
-- This schema splits the rubric into one row PER PILLAR, PER VENDOR, and
-- PER LIBRARY USE CASE. Every edit now writes only the one row that
-- changed. Two editors touching different pillars/vendors/use-cases can
-- never collide — Postgres just applies both writes to different rows.
-- Editors touching the SAME row still resolve last-write-wins on that row
-- only (normal Postgres behaviour), not on the entire rubric.
--
-- Run this once in the Supabase SQL Editor. It only CREATEs new tables —
-- it does not touch or drop your existing `rubrics` table, so your current
-- data stays intact as a rollback reference until you're ready to remove it
-- yourself (see the migration note below).
-- ===================================================================

-- ---- Rubric pillars: one row per pillar -------------------------------
-- data = { name, retired, caps: [ { id, title, def, retired, subs: [
--           { id, q, retired, sup: {vendorId: bool}, rat: {vendorId: {note,tone,conf}} }
--         ] } ] }
-- (Same nested shape each pillar object had inside the old single blob —
-- the in-memory model and every scoring/render function are unchanged.)
create table if not exists public.rubric_pillars (
  key         text primary key,
  data        jsonb not null default '{}'::jsonb,
  sort_order  integer not null default 0,
  updated_at  timestamptz not null default now()
);

-- ---- Vendors: one row per platform ------------------------------------
-- data = { name, code, retired, custom }
create table if not exists public.vendors (
  id          text primary key,
  data        jsonb not null default '{}'::jsonb,
  sort_order  integer not null default 0,
  updated_at  timestamptz not null default now()
);

-- ---- Use-case library: one row per master library item ----------------
-- data = { title, desc, caps: [capabilityId, ...] }
create table if not exists public.use_case_library (
  id          text primary key,
  data        jsonb not null default '{}'::jsonb,
  sort_order  integer not null default 0,
  updated_at  timestamptz not null default now()
);

-- ---- Assessments: unchanged ---------------------------------------------
-- Each assessment already stores only ITS OWN selections
-- ({moscow, needs, useCases}), scoped to one row — this was never the
-- collision risk, so it's untouched.
create table if not exists public.assessments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  client      text,
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---- Live sync: add the new tables to realtime -------------------------
do $$ begin
  alter publication supabase_realtime add table public.rubric_pillars;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.vendors;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.use_case_library;
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------------
-- Row Level Security — OPEN (anon can read/write), matching your current
-- posture so the static site keeps working with only the publishable key.
-- Tighten with Supabase Auth + `to authenticated` when you're ready.
-- ------------------------------------------------------------------
alter table public.rubric_pillars   enable row level security;
alter table public.vendors          enable row level security;
alter table public.use_case_library enable row level security;
alter table public.assessments      enable row level security;

drop policy if exists rubric_pillars_all on public.rubric_pillars;
create policy rubric_pillars_all on public.rubric_pillars
  for all to anon using (true) with check (true);

drop policy if exists vendors_all on public.vendors;
create policy vendors_all on public.vendors
  for all to anon using (true) with check (true);

drop policy if exists use_case_library_all on public.use_case_library;
create policy use_case_library_all on public.use_case_library
  for all to anon using (true) with check (true);

drop policy if exists assessments_all on public.assessments;
create policy assessments_all on public.assessments
  for all to anon using (true) with check (true);

-- ===================================================================
-- MIGRATION: your existing data lives in the old `rubrics` table
-- (id='master', data jsonb = {platforms, rubric, useCases}). Run
-- scripts/migrate-to-tables.mjs ONCE (locally, with your service-role
-- key — never in the deployed app) to copy it into the tables above.
-- The old `rubrics` table is left untouched; drop it yourself once
-- you've verified the new tables are correct:
--
--   drop table if exists public.rubrics;
-- ===================================================================
