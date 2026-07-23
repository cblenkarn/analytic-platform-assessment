// ── Load + live-sync the normalized tables (v3) ───────────────────────────
// Reads still fetch every row of these (small) reference tables and
// reassemble the nested in-memory tree the rest of the app expects
// (unchanged shape — see model/rubric.js assembleFromNormalizedRows). Writes
// are row-scoped (granular-save.js) — that's what actually prevents editors
// from overwriting each other, right down to a single support checkbox or
// rationale note.
//
// Protection for the row you're mid-editing: `dirty` (granular-save.js)
// tracks any pillar/capability/sub-capability/vendor/support-cell/rationale-
// cell/library-item with an unsaved local edit. If a realtime change arrives
// for a row you're actively editing, it's queued and the sync banner appears
// instead of silently discarding what you're typing. A change to any OTHER
// row always applies immediately — it can't conflict with your edit.
import { byId } from '../ui/dom.js';
import { store } from '../model/state.js';
import { assembleFromRows, applySelections, getSelections, exportPillarRow, exportVendorRow, exportLibraryItemRow, buildRubric } from '../model/rubric.js';
import { dirty, scheduleAllPillarsSave } from './granular-save.js';
import {
  listPillars, listCapabilities, listSubCapabilities, listVendors, listVendorSupport, listRationale,
  listLibrary, listLibraryCapLinks,
  upsertPillar, upsertCapability, upsertSubCapability, upsertVendor, setVendorSupport, upsertRationale,
  upsertLibraryItem, addLibraryCapLink,
  listPriorities, listSubNeeds, listAssessmentUseCases, listAssessmentUseCaseCapLinks,
  sb,
} from './supabase.js';
import { setAuto } from './autosave.js';
import { requestRender } from '../ui/render-bus.js';
import { USE_CASE_LIBRARY as SEED_USECASES } from '../data/seed-usecases.js';

async function fetchAll() {
  const [pillars, capabilities, subCapabilities, vendors, vendorSupport, rationale, libraryItems, libraryCapLinks] =
    await Promise.all([
      listPillars(), listCapabilities(), listSubCapabilities(), listVendors(),
      listVendorSupport(), listRationale(), listLibrary(), listLibraryCapLinks(),
    ]);
  return { pillars, capabilities, subCapabilities, vendors, vendorSupport, rationale, libraryItems, libraryCapLinks };
}

// First run against a fresh Supabase project: tables exist but are empty.
// Seed them once from the in-code fallback rubric/library and write it back
// so every future load reads from the DB.
async function seedTables() {
  const rubric = buildRubric();
  const pillarRows = [], capRows = [], subRows = [], supportRows = [], ratRows = [];
  rubric.forEach((p, pi) => {
    pillarRows.push({ id: p.key, name: p.name, retired: p.retired, sort_order: pi });
    p.caps.forEach((c, ci) => {
      capRows.push({ id: c.id, pillar_id: p.key, title: c.title, definition: c.def, retired: c.retired, sort_order: ci });
      c.subs.forEach((s, si) => {
        subRows.push({ id: s.id, capability_id: c.id, question: s.q, retired: s.retired, sort_order: si });
        Object.entries(s.sup || {}).forEach(([vid, val]) => { if (val) supportRows.push([s.id, vid, true]); });
        Object.entries(s.rat || {}).forEach(([vid, r]) => {
          if (r && r.note) ratRows.push([s.id, vid, { note: r.note, tone: r.tone || 'note', confidence: r.conf || '' }]);
        });
      });
    });
  });
  const vendorRows = store.PLATFORMS.map((v, i) => ({ id: v.id, name: v.name, code: v.code, retired: !!v.retired, is_custom: !!v.custom, sort_order: i }));
  const libRows = SEED_USECASES.map((u, i) => ({ id: u.id, title: u.title, description: u.desc, sort_order: i }));
  const libLinks = []; SEED_USECASES.forEach(u => (u.caps || []).forEach(cid => libLinks.push([u.id, cid])));

  await Promise.all(pillarRows.map(r => upsertPillar(r.id, { name: r.name, retired: r.retired }, r.sort_order)));
  await Promise.all(capRows.map(r => upsertCapability(r.id, { pillar_id: r.pillar_id, title: r.title, definition: r.definition, retired: r.retired }, r.sort_order)));
  await Promise.all(subRows.map(r => upsertSubCapability(r.id, { capability_id: r.capability_id, question: r.question, retired: r.retired }, r.sort_order)));
  await Promise.all(vendorRows.map(r => upsertVendor(r.id, { name: r.name, code: r.code, retired: r.retired, is_custom: r.is_custom }, r.sort_order)));
  await Promise.all(supportRows.map(([sid, vid, val]) => setVendorSupport(sid, vid, val)));
  await Promise.all(ratRows.map(([sid, vid, fields]) => upsertRationale(sid, vid, fields)));
  await Promise.all(libRows.map(r => upsertLibraryItem(r.id, { title: r.title, description: r.description }, r.sort_order)));
  await Promise.all(libLinks.map(([uid, cid]) => addLibraryCapLink(uid, cid)));
}

// opts: { onLoaded? } — called after every (re)assembly, e.g. to re-render a
// page-specific editor (library page, admin page).
export async function loadTables({ onLoaded } = {}) {
  setAuto('saving', 'loading...');
  try {
    let rows = await fetchAll();
    if (!rows.pillars.length && !rows.vendors.length) { await seedTables(); rows = await fetchAll(); }
    const repaired = assembleFromNormalizedRows(rows);
    if (repaired) scheduleAllPillarsSave(); // heal legacy duplicate/blank ids once, persist the fix
    if (onLoaded) onLoaded();
    setAuto('saved', 'all changes saved');
  } catch (e) { setAuto('err', 'load failed'); console.error(e); }
}

// Every table whose rows can be locally "dirty" (mid-edit) — realtime events
// for these check `dirty` before reapplying; a row you're not editing always
// applies immediately. use_case_library_capabilities has no meaningful edit
// conflict (a checkbox-style link toggle is already a single atomic write),
// so it always reapplies immediately.
const TRACKED_TABLES = [
  { table: 'pillars', keyOf: r => 'pillar:' + r.id },
  { table: 'capabilities', keyOf: r => 'capability:' + r.id },
  { table: 'sub_capabilities', keyOf: r => 'sub:' + r.id },
  { table: 'vendors', keyOf: r => 'vendor:' + r.id },
  { table: 'vendor_support', keyOf: r => 'support:' + r.sub_capability_id + ':' + r.vendor_id },
  { table: 'rationale', keyOf: r => 'rationale:' + r.sub_capability_id + ':' + r.vendor_id },
  { table: 'use_case_library', keyOf: r => 'lib:' + r.id },
  { table: 'use_case_library_capabilities', keyOf: () => null },
];

export function subscribeTables({ onLoaded } = {}) {
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

  const channel = sb.channel('rubric-tables-sync');
  TRACKED_TABLES.forEach(({ table, keyOf }) => {
    channel.on('postgres_changes', { event: '*', schema: 'public', table }, payload => {
      const row = payload.new || payload.old;
      const key = row ? keyOf(row) : null;
      if (key && dirty.has(key)) { showBanner(); return; }
      reapply(); setAuto('saved', 'updated by another editor');
    });
  });
  channel.subscribe();

  byId('btnSyncReload')?.addEventListener('click', async () => {
    if (!pendingReload) return;
    await reapply();
    pendingReload = false;
    byId('syncBanner')?.classList.remove('show');
    setAuto('saved', 'reloaded');
  });

  return channel;
}
