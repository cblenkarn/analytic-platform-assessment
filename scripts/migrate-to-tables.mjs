#!/usr/bin/env node
// ===================================================================
// One-off migration: copies the old single-blob rubric (rubrics.master)
// into the new normalized tables (rubric_pillars, vendors, use_case_library).
//
// Run this LOCALLY, once, after applying supabase/schema.sql:
//
//   SUPABASE_URL=https://xxxx.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
//   node scripts/migrate-to-tables.mjs
//
// The service-role key is required because it bypasses RLS to read/write
// every row in one pass — get it from Supabase → Project Settings → API →
// service_role (secret). NEVER put this key in config.js, never commit it,
// never use it in the deployed app. Pass it only as an env var for this
// one run, then close the terminal.
//
// Safe to re-run: every write is an upsert keyed by the same id/key the
// old data used, so running this twice just re-applies the same rows.
// It never touches or deletes the old `rubrics` table.
// ===================================================================
import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars first.');
  process.exit(1);
}
const sb = createClient(URL, KEY);

async function main() {
  console.log('Reading rubrics.master ...');
  const { data: row, error } = await sb.from('rubrics').select('data').eq('id', 'master').maybeSingle();
  if (error) throw error;
  if (!row) { console.log('No rubrics.master row found — nothing to migrate.'); return; }
  const old = row.data || {};
  const platforms = Array.isArray(old.platforms) ? old.platforms : [];
  const rubric = Array.isArray(old.rubric) ? old.rubric : [];
  const useCases = Array.isArray(old.useCases) ? old.useCases : [];

  console.log(`Found ${rubric.length} pillars, ${platforms.length} vendors, ${useCases.length} library use cases.`);

  // ---- vendors ----
  for (let i = 0; i < platforms.length; i++) {
    const { id, ...rest } = platforms[i];
    const { error: e } = await sb.from('vendors').upsert({ id, data: rest, sort_order: i, updated_at: new Date().toISOString() });
    if (e) throw e;
  }
  console.log(`✓ vendors: ${platforms.length} rows upserted`);

  // ---- pillars ----
  for (let i = 0; i < rubric.length; i++) {
    const { key, ...rest } = rubric[i];
    const { error: e } = await sb.from('rubric_pillars').upsert({ key, data: rest, sort_order: i, updated_at: new Date().toISOString() });
    if (e) throw e;
  }
  console.log(`✓ rubric_pillars: ${rubric.length} rows upserted`);

  // ---- use-case library ----
  for (let i = 0; i < useCases.length; i++) {
    const { id, ...rest } = useCases[i];
    const { error: e } = await sb.from('use_case_library').upsert({ id, data: rest, sort_order: i, updated_at: new Date().toISOString() });
    if (e) throw e;
  }
  console.log(`✓ use_case_library: ${useCases.length} rows upserted`);

  console.log('\nDone. The old rubrics.master row is untouched — verify the new tables in');
  console.log('/admin and /usecases, then drop the old `rubrics` table yourself when ready.');
}

main().catch(e => { console.error('Migration failed:', e); process.exit(1); });
