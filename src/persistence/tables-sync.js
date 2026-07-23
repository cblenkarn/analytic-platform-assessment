// ── Load + live-sync the normalized rubric/vendor/library tables, plus the
// per-assessment tables (priorities, sub-needs, use cases, use-case-cap
// links) ────────────────────────────────────────────────────────────────
// Reads are "refetch the small tables and reassemble" (reads carry no
// collision risk). Writes are row-scoped (see granular-save.js) — that's
// what actually prevents editors from overwriting each other.
//
// Protection for the row you're mid-editing: `dirty` (granular-save.js)
// tracks any pillar/capability/sub-capability/vendor/library-item with an
// unsaved local edit, keyed "<kind>:<id>". If a realtime change arrives for
// a row you're actively editing, it's queued and the sync banner appears
// instead of silently discarding what you're typing. A change to any OTHER
// row always applies immediately — it can't conflict with your edit.
//
// Because the in-memory shape is a nested tree (pillars > caps > subs) but
// `dirty` and realtime events are per-row-per-table, a full reassembly from
// freshly-fetched rows would normally wipe out any OTHER row you have
// mid-edit (including a brand-new capability/sub/pillar/vendor/library item
// that doesn't exist in the DB yet). snapshotDirty()/restoreDirty() below
// walk the tree before/after reassembly and splice any dirty node back into
// its (possibly new) parent, so a change to one row can never clobber an
// unsaved edit to another — no matter how deep it is in the tree.
import { byId } from '../ui/dom.js';
import { store } from '../model/state.js';
import {
  assembleFromNormalizedRows, buildRubric, reindex, defaultState,
} from '../model/rubric.js';
import { dirty, schedulePillarSave, scheduleCapabilitySave, scheduleSubSave } from './granular-save.js';
import {
  listPillars, listCapabilities, listSubCapabilities, listVendors,
  listVendorSupport, listRationale, listLibrary, listLibraryCapLinks,
  upsertPillar, upsertCapability, upsertSubCapability, upsertVendor,
  setVendorSupport, upsertRationale, upsertLibraryItem, addLibraryCapLink,
  listPriorities, listSubNeeds, listAssessmentUseCases, listAssessmentUseCaseCapLinks,
  sb,
} from './supabase.js';
import { setAuto } from './autosave.js';
import { requestRender } from '../ui/render-bus.js';
import { USE_CASE_LIBRARY as SEED_USECASES } from '../data/seed-usecases.js';

// ============================================================================
// Shared rubric / vendor / library tables
// ============================================================================

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
// (across all eight tables) so every future load reads from the DB.
async function seedTables() {
  const rubric = buildRubric();
  const pillarRows = [], capRows = [], subRows = [], supportRows = [], ratRows = [];
  rubric.forEach((p, pi) => {
    pillarRows.push({ id: p.key, name: p.name, sort_order: pi });
    p.caps.forEach((c, ci) => {
      capRows.push({ id: c.id, pillar_id: p.key, title: c.title, definition: c.def, sort_order: ci });
      c.subs.forEach((s, si) => {
        subRows.push({ id: s.id, capability_id: c.id, question: s.q, sort_order: si });
        Object.entries(s.sup || {}).forEach(([vendorId, supported]) => {
          supportRows.push({ sub_capability_id: s.id, vendor_id: vendorId, supported });
        });
        Object.entries(s.rat || {}).forEach(([vendorId, r]) => {
          ratRows.push({ sub_capability_id: s.id, vendor_id: vendorId, note: r.note, tone: r.tone, confidence: r.conf });
        });
      });
    });
  });
  const vendorRows = store.PLATFORMS.map((v, i) => ({ id: v.id, name: v.name, code: v.code, is_custom: !!v.custom, sort_order: i }));
  const libraryRows = SEED_USECASES.map((u, i) => ({ id: u.id, title: u.title, description: u.desc, sort_order: i }));
  const libraryCapLinks = SEED_USECASES.flatMap(u => (u.caps || []).map(cid => ({ use_case_id: u.id, capability_id: cid })));

  await Promise.all(pillarRows.map(r => upsertPillar(r.id, { name: r.name }, r.sort_order)));
  await Promise.all(capRows.map(r => upsertCapability(r.id, { pillar_id: r.pillar_id, title: r.title, definition: r.definition }, r.sort_order)));
  await Promise.all(subRows.map(r => upsertSubCapability(r.id, { capability_id: r.capability_id, question: r.question }, r.sort_order)));
  await Promise.all(vendorRows.map(r => upsertVendor(r.id, { name: r.name, code: r.code, is_custom: r.is_custom }, r.sort_order)));
  await Promise.all(supportRows.map(r => setVendorSupport(r.sub_capability_id, r.vendor_id, r.supported)));
  await Promise.all(ratRows.map(r => upsertRationale(r.sub_capability_id, r.vendor_id, { note: r.note, tone: r.tone, confidence: r.confidence })));
  await Promise.all(libraryRows.map(r => upsertLibraryItem(r.id, { title: r.title, description: r.description }, r.sort_order)));
  await Promise.all(libraryCapLinks.map(l => addLibraryCapLink(l.use_case_id, l.capability_id)));

  return fetchAll();
}

// Legacy duplicate/blank-id repair (rare): resave every pillar/capability/
// sub-capability so the freshly-assigned ids persist. Only runs the one time
// assembleFromNormalizedRows() reports it found a collision.
function resaveAllAfterRepair() {
  store.RUBRIC.forEach((p, pi) => {
    schedulePillarSave(p.key, { sortOrder: pi });
    p.caps.forEach((c, ci) => {
      scheduleCapabilitySave(c.id, { sortOrder: ci });
      c.subs.forEach((s, si) => scheduleSubSave(s.id, { sortOrder: si }));
    });
  });
}

export async function loadTables({ onLoaded } = {}) {
  setAuto('saving', 'loading...');
  try {
    let rows = await fetchAll();
    if (!rows.pillars.length && !rows.vendors.length) rows = await seedTables();
    const repaired = assembleFromNormalizedRows(rows);
    if (repaired) resaveAllAfterRepair();
    if (onLoaded) onLoaded();
    setAuto('saved', 'all changes saved');
  } catch (e) { setAuto('err', 'load failed'); console.error(e); }
}

// ---- dirty-row preservation across a full reassembly ----------------------
function snapshotDirty() {
  const pillars = new Map(), caps = new Map(), subs = new Map(), vendors = new Map(), libItems = new Map();
  const capOwner = new Map(), subOwner = new Map();
  store.RUBRIC.forEach(p => {
    if (dirty.has('pillar:' + p.key)) pillars.set(p.key, p);
    p.caps.forEach(c => {
      if (dirty.has('capability:' + c.id)) { caps.set(c.id, c); capOwner.set(c.id, p.key); }
      c.subs.forEach(s => {
        if (dirty.has('sub:' + s.id)) { subs.set(s.id, s); subOwner.set(s.id, c.id); }
      });
    });
  });
  store.PLATFORMS.forEach(v => { if (dirty.has('vendor:' + v.id)) vendors.set(v.id, v); });
  store.USE_CASE_LIBRARY.forEach(it => { if (dirty.has('lib:' + it.id)) libItems.set(it.id, it); });
  return { pillars, caps, subs, vendors, libItems, capOwner, subOwner };
}
function restoreDirty(snap) {
  snap.pillars.forEach((p, key) => { const i = store.RUBRIC.findIndex(x => x.key === key); if (i >= 0) store.RUBRIC[i] = p; else store.RUBRIC.push(p); });
  snap.vendors.forEach((v, id) => { const i = store.PLATFORMS.findIndex(x => x.id === id); if (i >= 0) store.PLATFORMS[i] = v; else store.PLATFORMS.push(v); });
  snap.libItems.forEach((it, id) => { const i = store.USE_CASE_LIBRARY.findIndex(x => x.id === id); if (i >= 0) store.USE_CASE_LIBRARY[i] = it; else store.USE_CASE_LIBRARY.push(it); });
  snap.caps.forEach((c, id) => {
    const pillar = store.RUBRIC.find(p => p.key === snap.capOwner.get(id));
    if (!pillar) return; // owning pillar was deleted remotely — drop the orphaned in-flight edit
    const i = pillar.caps.findIndex(x => x.id === id);
    if (i >= 0) pillar.caps[i] = c; else pillar.caps.push(c);
  });
  snap.subs.forEach((s, id) => {
    const capId = snap.subOwner.get(id);
    let owner = null;
    for (const p of store.RUBRIC) { const c = p.caps.find(x => x.id === capId); if (c) { owner = c; break; } }
    if (!owner) return; // owning capability was deleted remotely — drop the orphaned in-flight edit
    const i = owner.subs.findIndex(x => x.id === id);
    if (i >= 0) owner.subs[i] = s; else owner.subs.push(s);
  });
  reindex();
}

// Subscribes to all eight shared tables. Applies remote changes immediately
// unless the affected row is locally dirty, in which case it's queued and
// the sync banner appears; "Reload" (wired here via #btnSyncReload) applies
// everything queued.
export function subscribeTables({ onLoaded } = {}) {
  if (!sb) return null;
  let pendingReload = false;
  const showBanner = () => { pendingReload = true; byId('syncBanner')?.classList.add('show'); };

  const reapply = async () => {
    const snap = snapshotDirty();
    const rows = await fetchAll();
    assembleFromNormalizedRows(rows);
    restoreDirty(snap);
    if (onLoaded) onLoaded();
    requestRender();
  };

  const rowId = (payload, field = 'id') => (payload.new && payload.new[field]) ?? (payload.old && payload.old[field]);
  const cellKey = (payload) => rowId(payload, 'sub_capability_id') + ':' + rowId(payload, 'vendor_id');

  const guarded = (dirtyKeyFn) => (payload) => {
    const key = dirtyKeyFn(payload);
    if (key && dirty.has(key)) { showBanner(); return; }
    reapply(); setAuto('saved', 'updated by another editor');
  };

  const channel = sb.channel('rubric-tables-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pillars' }, guarded(p => 'pillar:' + rowId(p)))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'capabilities' }, guarded(p => 'capability:' + rowId(p)))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sub_capabilities' }, guarded(p => 'sub:' + rowId(p)))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'vendors' }, guarded(p => 'vendor:' + rowId(p)))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'vendor_support' }, guarded(p => 'support:' + cellKey(p)))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rationale' }, guarded(p => 'rationale:' + cellKey(p)))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'use_case_library' }, guarded(p => 'lib:' + rowId(p)))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'use_case_library_capabilities' }, () => { reapply(); setAuto('saved', 'updated by another editor'); })
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

// ============================================================================
// Per-assessment tables (priorities, sub-needs, captured use cases + their
// capability links) — each lives in its own table keyed by assessment_id, so
// loading/saving one assessment never touches another's rows, and a single
// MoSCoW click or "needed" checkbox (see framework.events.js, via
// granular-save's saveNow) writes exactly one row.
// ============================================================================

export async function loadAssessmentSelections(assessmentId) {
  const [priorities, subNeeds, ucRows, ucCapLinks] = await Promise.all([
    listPriorities(assessmentId), listSubNeeds(assessmentId),
    listAssessmentUseCases(assessmentId), listAssessmentUseCaseCapLinks(assessmentId),
  ]);
  const base = defaultState();
  const moscow = { ...base.moscow };
  priorities.forEach(r => { moscow[r.capability_id] = r.moscow; });
  const needs = { ...base.needs };
  subNeeds.forEach(r => { needs[r.sub_capability_id] = r.needed; });
  const capsByUC = new Map();
  ucCapLinks.forEach(l => { if (!capsByUC.has(l.use_case_id)) capsByUC.set(l.use_case_id, []); capsByUC.get(l.use_case_id).push(l.capability_id); });
  const useCases = ucRows.map(u => ({ id: u.id, title: u.title, desc: u.description, capIds: capsByUC.get(u.id) || [], sourceLibId: u.source_lib_id }));
  store.S = { moscow, needs, useCases };
  store.collapsedPillars.clear();
  requestRender();
}

export function subscribeAssessment(assessmentId, { onLoaded } = {}) {
  if (!sb) return null;
  const reapply = async () => { await loadAssessmentSelections(assessmentId); if (onLoaded) onLoaded(); };
  const filter = `assessment_id=eq.${assessmentId}`;
  const channel = sb.channel('assessment-' + assessmentId + '-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'assessment_priorities', filter }, reapply)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'assessment_sub_needs', filter }, reapply)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'assessment_use_cases', filter }, reapply)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'assessment_use_case_capabilities', filter }, reapply)
    .subscribe();
  return channel;
}
