// ── Load + live-sync the three rubric tables ──────────────────────────────
// Replaces the old single-blob "load whole rubric, diff on every interaction,
// save whole rubric" flow. Reads are still "refetch the small table and
// reassemble" (reads carry no collision risk). Writes are row-scoped (see
// granular-save.js) — that's what actually prevents editors from
// overwriting each other.
//
// Protection for the row you're mid-editing: `dirty` (granular-save.js)
// tracks any pillar/vendor-list/library-item with an unsaved local edit. If
// a realtime change arrives for a row you're actively editing, it's queued
// and the sync banner appears instead of silently discarding what you're
// typing. A change to any OTHER row always applies immediately — it can't
// conflict with your edit.
import { byId } from '../ui/dom.js';
import { store } from '../model/state.js';
import { assembleFromRows, applySelections, getSelections, exportPillarRow, exportVendorRow, exportLibraryItemRow, buildRubric } from '../model/rubric.js';
import { dirty, scheduleAllPillarsSave } from './granular-save.js';
import { listPillars, listVendors, listLibrary, upsertPillar, upsertVendor, upsertLibraryItem, sb } from './supabase.js';
import { setAuto } from './autosave.js';
import { requestRender } from '../ui/render-bus.js';
import { USE_CASE_LIBRARY as SEED_USECASES } from '../data/seed-usecases.js';

async function fetchAll() {
  const [pillarRows, vendorRows, libraryRows] = await Promise.all([listPillars(), listVendors(), listLibrary()]);
  return { pillarRows, vendorRows, libraryRows };
}

// First run against a fresh Supabase project: tables exist but are empty.
// Seed them once from the in-code fallback rubric/library and write it back
// so every future load reads from the DB.
async function seedTables() {
  const rubric = buildRubric();
  const pillarRows = rubric.map((p, i) => exportPillarRow(p, i));
  const vendorRows = store.PLATFORMS.map((v, i) => exportVendorRow(v, i));
  const libraryRows = SEED_USECASES.map((u, i) => exportLibraryItemRow({ ...u, caps: [...(u.caps || [])] }, i));
  await Promise.all(pillarRows.map(r => upsertPillar(r.key, r.data, r.sort_order)));
  await Promise.all(vendorRows.map(r => upsertVendor(r.id, r.data, r.sort_order)));
  await Promise.all(libraryRows.map(r => upsertLibraryItem(r.id, r.data, r.sort_order)));
  return { pillarRows, vendorRows, libraryRows };
}

// opts: { onLoaded?, applySavedSelections? }
//   onLoaded()               — called after every (re)assembly, e.g. to re-render a page-specific editor
//   applySavedSelections     — if true, re-applies the caller's current
//                               selections after a reassembly (assessment page only)
export async function loadTables({ onLoaded } = {}) {
  setAuto('saving', 'loading...');
  try {
    let { pillarRows, vendorRows, libraryRows } = await fetchAll();
    if (!pillarRows.length && !vendorRows.length) {
      ({ pillarRows, vendorRows, libraryRows } = await seedTables());
    }
    const repaired = assembleFromRows(pillarRows, vendorRows, libraryRows);
    if (repaired) scheduleAllPillarsSave(); // heal legacy duplicate/blank ids once, persist the fix
    if (onLoaded) onLoaded();
    setAuto('saved', 'all changes saved');
  } catch (e) { setAuto('err', 'load failed'); console.error(e); }
}

// Subscribes to all three tables. Applies remote changes immediately unless
// the affected row is locally dirty, in which case it's queued and the sync
// banner appears; "Reload" (wired here via #btnSyncReload) applies everything
// queued. onLoaded/preserveSelections mirror loadTables' options.
export function subscribeTables({ onLoaded, preserveSelections } = {}) {
  if (!sb) return null;
  let pendingReload = false;
  const showBanner = () => { pendingReload = true; byId('syncBanner')?.classList.add('show'); };

  const reapply = async () => {
    const sel = preserveSelections ? getSelections() : null;
    const { pillarRows, vendorRows, libraryRows } = await fetchAll();
    assembleFromRows(pillarRows, vendorRows, libraryRows);
    if (sel) applySelections(sel);
    if (onLoaded) onLoaded();
    requestRender();
  };

  const onPillar = (payload) => {
    const key = (payload.new && payload.new.key) || (payload.old && payload.old.key);
    if (key && dirty.pillars.has(key)) { showBanner(); return; }
    reapply(); setAuto('saved', 'updated by another editor');
  };
  const onVendors = () => {
    if (dirty.vendors) { showBanner(); return; }
    reapply(); setAuto('saved', 'updated by another editor');
  };
  const onLibrary = (payload) => {
    const id = (payload.new && payload.new.id) || (payload.old && payload.old.id);
    if (id && dirty.library.has(id)) { showBanner(); return; }
    reapply(); setAuto('saved', 'updated by another editor');
  };

  const channel = sb.channel('rubric-tables-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rubric_pillars' }, onPillar)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'vendors' }, onVendors)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'use_case_library' }, onLibrary)
    .subscribe();

  byId('btnSyncReload')?.addEventListener('click', async () => {
    if (!pendingReload) return;
    await reapply();
    pendingReload = false;
    byId('syncBanner')?.classList.remove('show');
    setAuto('saved', 'reloaded');
  });

  return channel;
}
