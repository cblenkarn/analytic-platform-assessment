#!/usr/bin/env node
// ===================================================================
// One-off migration: v2 (rubric_pillars / vendors / use_case_library, each a
// single jsonb "data" blob per row, plus assessments.data holding one jsonb
// blob of that assessment's whole selection state) → v3 fully normalized
// tables (see supabase/schema.sql — pillars/capabilities/sub_capabilities,
// vendor_support, rationale, use_case_library(_capabilities), and per-
// assessment priorities/sub_needs/use_cases(_capabilities)).
//
// Run this LOCALLY, once, after applying supabase/schema.sql:
//
//   SUPABASE_URL=https://xxxx.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
//   node scripts/migrate-v2-to-v3.mjs
//
// The service-role key is required because it bypasses RLS to read/write
// every row in one pass — get it from Supabase → Project Settings → API →
// service_role (secret). NEVER put this key in config.js, never commit it,
// never use it in the deployed app. Pass it only as an env var for this one
// run, then close the terminal.
//
// Safe to re-run for the rubric/vendor/library side: every write there is an
// upsert keyed by the same id the v2 data used. The per-assessment USE CASE
// section additionally guards itself — it skips an assessment's use cases if
// that assessment already has any rows in assessment_use_cases, so re-running
// won't create duplicates (assessment_use_cases uses a generated uuid, not
// the old client-side "uc1"/"uc2" ids, since those were only unique within
// one assessment, not globally). assessment_priorities/assessment_sub_needs
// are plain upserts and always safe to re-run.
//
// ORPHANED REFERENCES: v2's jsonb blobs never enforced referential
// integrity. It's entirely possible for an assessment's saved moscow/needs/
// use-case capability mappings — or a library item's capability mappings,
// or a stale vendor key left in some sub-capability's sup/rat map — to
// reference a capability, sub-capability, or vendor id that was later
// deleted from the live rubric (via the admin "Delete" button) and so no
// longer exists. The v3 tables enforce real foreign keys, so this script
// checks every reference against the ids it actually just migrated and
// SKIPS (with a logged count) anything that points nowhere, rather than
// letting the whole run die on the first bad reference.
//
// This script never touches or drops rubric_pillars, use_case_library, the
// old vendors rows, or the assessments.data column.
// ===================================================================
import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars first.');
  process.exit(1);
}
const sb = createClient(URL, KEY);
const now = () => new Date().toISOString();

async function main() {
  console.log('Reading v2 tables...');
  const [{ data: pillarRows, error: e1 }, { data: vendorRows, error: e2 },
         { data: libRows, error: e3 }, { data: assessments, error: e4 }] = await Promise.all([
    sb.from('rubric_pillars').select('key,data,sort_order'),
    sb.from('vendors').select('id,data,sort_order'),
    sb.from('use_case_library').select('id,data,sort_order'),
    sb.from('assessments').select('id,data'),
  ]);
  if (e1) throw e1; if (e2) throw e2; if (e3) throw e3; if (e4) throw e4;

  console.log(`Found ${pillarRows.length} pillars, ${vendorRows.length} vendors, ${libRows.length} library items, ${assessments.length} assessments.`);

  // ---- vendors ----
  const validVendorIds = new Set(vendorRows.map(v => v.id));
  for (const v of vendorRows) {
    const d = v.data || {};
    const { error } = await sb.from('vendors').upsert({
      id: v.id, name: d.name || v.id, code: d.code || v.id, retired: !!d.retired,
      is_custom: !!d.custom, sort_order: v.sort_order ?? 0, updated_at: now(),
    });
    if (error) throw error;
  }
  console.log(`\u2713 vendors: ${vendorRows.length} rows upserted`);

  // ---- pillars -> capabilities -> sub_capabilities -> vendor_support/rationale ----
  const validCapIds = new Set(), validSubIds = new Set();
  let capCount = 0, subCount = 0, supportCount = 0, ratCount = 0, orphanVendorRefs = 0;
  for (const p of pillarRows) {
    const pd = p.data || {};
    { const { error } = await sb.from('pillars').upsert({
        id: p.key, name: pd.name || p.key, retired: !!pd.retired, sort_order: p.sort_order ?? 0, updated_at: now(),
      });
      if (error) throw error; }

    const caps = Array.isArray(pd.caps) ? pd.caps : [];
    for (let ci = 0; ci < caps.length; ci++) {
      const c = caps[ci];
      { const { error } = await sb.from('capabilities').upsert({
          id: c.id, pillar_id: p.key, title: c.title || c.id, definition: c.def || '',
          retired: !!c.retired, sort_order: ci, updated_at: now(),
        });
        if (error) throw error; }
      validCapIds.add(c.id);
      capCount++;

      const subs = Array.isArray(c.subs) ? c.subs : [];
      for (let si = 0; si < subs.length; si++) {
        const s = subs[si];
        { const { error } = await sb.from('sub_capabilities').upsert({
            id: s.id, capability_id: c.id, question: s.q || '', retired: !!s.retired,
            sort_order: si, updated_at: now(),
          });
          if (error) throw error; }
        validSubIds.add(s.id);
        subCount++;

        // Sparse: only write a row when a cell is actually TRUE. A missing
        // vendor_support row means "not supported" — matches the app's
        // normalizeRubric() default. Skip any vendorId that no longer
        // exists (a leftover key for a since-deleted vendor).
        for (const [vendorId, supported] of Object.entries(s.sup || {})) {
          if (!supported) continue;
          if (!validVendorIds.has(vendorId)) { orphanVendorRefs++; continue; }
          const { error } = await sb.from('vendor_support')
            .upsert({ sub_capability_id: s.id, vendor_id: vendorId, supported: true, updated_at: now() });
          if (error) throw error;
          supportCount++;
        }
        for (const [vendorId, r] of Object.entries(s.rat || {})) {
          if (!r || !r.note || !r.note.trim()) continue;
          if (!validVendorIds.has(vendorId)) { orphanVendorRefs++; continue; }
          const { error } = await sb.from('rationale').upsert({
            sub_capability_id: s.id, vendor_id: vendorId, note: r.note,
            tone: r.tone || 'note', confidence: r.conf || '', updated_at: now(),
          });
          if (error) throw error;
          ratCount++;
        }
      }
    }
  }
  console.log(`\u2713 pillars: ${pillarRows.length}, capabilities: ${capCount}, sub-capabilities: ${subCount}, support cells: ${supportCount}, rationale notes: ${ratCount}${orphanVendorRefs ? ` (skipped ${orphanVendorRefs} stale vendor references)` : ''}`);

  // ---- use-case library ----
  const validLibIds = new Set(libRows.map(l => l.id));
  let libCapLinks = 0, orphanLibCapRefs = 0;
  for (let i = 0; i < libRows.length; i++) {
    const l = libRows[i]; const d = l.data || {};
    { const { error } = await sb.from('use_case_library').upsert({
        id: l.id, title: d.title || '', description: d.desc || '', sort_order: l.sort_order ?? i, updated_at: now(),
      });
      if (error) throw error; }
    for (const capId of (d.caps || [])) {
      if (!validCapIds.has(capId)) { orphanLibCapRefs++; continue; }
      const { error } = await sb.from('use_case_library_capabilities').upsert({ use_case_id: l.id, capability_id: capId });
      if (error) throw error;
      libCapLinks++;
    }
  }
  console.log(`\u2713 use_case_library: ${libRows.length} rows upserted, ${libCapLinks} capability mappings${orphanLibCapRefs ? ` (skipped ${orphanLibCapRefs} stale capability references)` : ''}`);

  // ---- assessments: split each assessment's jsonb blob into the new tables ----
  let ucCount = 0, skipped = 0, orphanPriorities = 0, orphanNeeds = 0, orphanUcCaps = 0, orphanSourceLib = 0;
  for (const a of assessments) {
    const d = a.data || {};

    for (const [capId, moscow] of Object.entries(d.moscow || {})) {
      if (!validCapIds.has(capId)) { orphanPriorities++; continue; }
      const { error } = await sb.from('assessment_priorities')
        .upsert({ assessment_id: a.id, capability_id: capId, moscow, updated_at: now() });
      if (error) throw error;
    }
    for (const [subId, needed] of Object.entries(d.needs || {})) {
      if (!validSubIds.has(subId)) { orphanNeeds++; continue; }
      const { error } = await sb.from('assessment_sub_needs')
        .upsert({ assessment_id: a.id, sub_capability_id: subId, needed: !!needed, updated_at: now() });
      if (error) throw error;
    }

    // Guard: skip use-case migration if this assessment already has rows
    // (keeps the script safe to re-run without duplicating use cases, since
    // assessment_use_cases.id is a freshly generated uuid each time).
    const { data: already, error: eChk } = await sb.from('assessment_use_cases').select('id').eq('assessment_id', a.id).limit(1);
    if (eChk) throw eChk;
    if (already && already.length) { skipped++; continue; }

    const useCases = Array.isArray(d.useCases) ? d.useCases : [];
    for (let i = 0; i < useCases.length; i++) {
      const u = useCases[i];
      // source_lib_id references use_case_library(id) on delete set null —
      // if the library item was since deleted, just store null instead of
      // failing the whole use case.
      let sourceLibId = u.sourceLibId || null;
      if (sourceLibId && !validLibIds.has(sourceLibId)) { orphanSourceLib++; sourceLibId = null; }
      const { data: inserted, error } = await sb.from('assessment_use_cases')
        .insert({
          assessment_id: a.id, title: u.title || '', description: u.desc || '',
          source_lib_id: sourceLibId, sort_order: i,
        })
        .select('id').single();
      if (error) throw error;
      for (const capId of (u.capIds || [])) {
        if (!validCapIds.has(capId)) { orphanUcCaps++; continue; }
        const { error: e5 } = await sb.from('assessment_use_case_capabilities')
          .upsert({ assessment_id: a.id, use_case_id: inserted.id, capability_id: capId });
        if (e5) throw e5;
      }
      ucCount++;
    }
  }
  const orphanNote = [
    orphanPriorities && `${orphanPriorities} stale priority reference(s)`,
    orphanNeeds && `${orphanNeeds} stale sub-need reference(s)`,
    orphanUcCaps && `${orphanUcCaps} stale use-case capability reference(s)`,
    orphanSourceLib && `${orphanSourceLib} stale library-source reference(s) (kept the use case, cleared the link)`,
  ].filter(Boolean).join(', ');
  console.log(`\u2713 assessments: ${assessments.length} rows (priorities + sub-needs), ${ucCount} captured use cases migrated${skipped ? `, ${skipped} assessment(s) skipped (already migrated)` : ''}${orphanNote ? ` — skipped: ${orphanNote}` : ''}`);

  console.log('\nDone. rubric_pillars, the old data columns on vendors/use_case_library, and');
  console.log('assessments.data are untouched. Verify /admin, /usecases, and an existing');
  console.log('/assessment?id=... load and save correctly, then drop the old storage yourself');
  console.log('once confident:');
  console.log('  drop table if exists public.rubric_pillars;');
  console.log('  alter table public.assessments drop column if exists data;');
  console.log('  alter table public.vendors drop column if exists data;');
  console.log('  alter table public.use_case_library drop column if exists data;');
}

main().catch(e => { console.error('Migration failed:', e); process.exit(1); });
