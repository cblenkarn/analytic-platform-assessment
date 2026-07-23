// ── Rubric lifecycle + domain model ───────────────────────────────────────
// Build/normalize/reindex the rubric, id helpers, counter sync, repair of
// legacy duplicate ids, admin hard-deletes, and the persistence-facing API
// (assembleFromNormalizedRows / export helpers).
//
// IMPORTANT: the in-memory shape (store.RUBRIC as nested pillars > caps >
// subs, each sub carrying sup/rat maps keyed by vendor id) is UNCHANGED from
// before. Only how it's assembled from the database changed — it now comes
// from eight normalized tables instead of one jsonb blob per pillar. Keeping
// the in-memory tree the same means every render/scoring module (matrix
// view, framework view, coverage.js, fit.js, profiles, etc.) needed zero
// changes; only the assembly/persistence boundary did.
//
// Pure DOM-free logic — rendering is triggered indirectly via the render bus.

import { store } from './state.js';
import { SEED } from '../data/seed-rubric.js';
import { RAT } from '../data/seed-rationale.js';
import { USE_CASE_LIBRARY as SEED_USECASES } from '../data/seed-usecases.js';
import { SEED_ORDER } from '../data/platforms.js';
import { requestRender } from '../ui/render-bus.js';
import { setAuto } from '../persistence/autosave.js';

// ---- change notification -------------------------------------------------
export function markChanged() { document.dispatchEvent(new Event('pet-selections-changed')); }

// ---- build / normalize ---------------------------------------------------
function cloneRat(sid) {
  const src = RAT[sid]; const out = {};
  if (src) Object.keys(src).forEach(pl => { out[pl] = { note: src[pl].note || '', tone: src[pl].tone || 'note', conf: src[pl].conf || '' }; });
  return out;
}

export function buildRubric() {
  return SEED.map((p, i) => ({
    key: String.fromCharCode(65 + i), name: p.name, retired: false,
    caps: p.caps.map(c => ({
      id: c.id, title: c.title, def: c.def, retired: false,
      subs: c.subs.map(s => {
        const sup = {}; SEED_ORDER.forEach((pid, j) => sup[pid] = !!(s.s && s.s[j]));
        return { id: s.id, q: s.q, sup, rat: cloneRat(s.id), retired: false };
      }),
    })),
  }));
}

export function normalizeRubric() {
  store.RUBRIC.forEach(p => {
    if (!p.key) p.key = 'P' + (++store.counters.pillar);
    if (!p.caps) p.caps = [];
    if (typeof p.retired !== 'boolean') p.retired = false;
    p.caps.forEach(c => {
      if (!c.subs) c.subs = [];
      if (typeof c.retired !== 'boolean') c.retired = false;
      c.subs.forEach(s => {
        if (!s.sup) s.sup = {};
        store.PLATFORMS.forEach(pl => { if (typeof s.sup[pl.id] !== 'boolean') s.sup[pl.id] = false; });
        if (!s.rat) s.rat = {};
        if (typeof s.retired !== 'boolean') s.retired = false;
      });
    });
  });
}

export function reindex() {
  store.SUBIDX = {};
  store.RUBRIC.forEach(p => p.caps.forEach(c => c.subs.forEach(s => { store.SUBIDX[s.id] = { sub: s, cap: c, pkey: p.key }; })));
}

export function defaultState() {
  const moscow = {}, needs = {};
  store.RUBRIC.forEach(p => p.caps.forEach(c => { moscow[c.id] = 'should'; c.subs.forEach(s => needs[s.id] = true); }));
  return { moscow, needs, useCases: [] };
}

// ---- id / lookup helpers -------------------------------------------------
export function findCap(id) { let r = null; store.RUBRIC.forEach(p => p.caps.forEach(c => { if (c.id === id) r = c; })); return r; }
export function findPillar(key) { return store.RUBRIC.find(p => p.key === key); }
export function pIndex(key) { return store.RUBRIC.findIndex(p => p.key === key); }
export function pLetter(key) { const i = pIndex(key); return i >= 0 ? String.fromCharCode(65 + i) : '?'; }
export function capMeta(capId) {
  for (const p of store.RUBRIC) for (const c of p.caps) if (c.id === capId) return { c, p, letter: pLetter(p.key) };
  return null;
}
export function capPillar(c) { return store.RUBRIC.find(p => p.caps.some(x => x.id === c.id)); }

// ---- counter sync + repair ----------------------------------------------
function setVendorCounter()  { store.counters.vendor = store.PLATFORMS.reduce((m, p) => { const n = /^v(\d+)$/.exec(p.id); return n ? Math.max(m, +n[1]) : m; }, 0); }
function setPillarCounter()  { store.counters.pillar = store.RUBRIC.reduce((m, p) => { const n = /^P(\d+)$/.exec(p.key || ''); return n ? Math.max(m, +n[1]) : m; }, 0); }
function setCapCounter()     { let m = 15; store.RUBRIC.forEach(p => p.caps.forEach(c => { const n = /^C(\d+)$/.exec(c.id || ''); if (n) m = Math.max(m, +n[1]); })); store.counters.cap = m; }
function setSubCounter()     { let m = 0; store.RUBRIC.forEach(p => p.caps.forEach(c => c.subs.forEach(s => { const n = /^sx(\d+)$/.exec(s.id || ''); if (n) m = Math.max(m, +n[1]); }))); store.counters.sub = m; }
export function syncCounters() { setVendorCounter(); setPillarCounter(); setCapCounter(); setSubCounter(); }

// One-time repair for rubrics saved with duplicate/blank ids. Runs on every
// load; only touches items whose id collides with one seen earlier, so a
// healthy rubric is untouched (returns false). Must run AFTER syncCounters().
export function repairRubric() {
  let changed = false;
  const pKeys = new Set();
  store.RUBRIC.forEach(p => { if (!p.key || pKeys.has(p.key)) { p.key = 'P' + (++store.counters.pillar); changed = true; } pKeys.add(p.key); });
  const capIds = new Set();
  store.RUBRIC.forEach(p => p.caps.forEach(c => { if (!c.id || capIds.has(c.id)) { c.id = 'C' + (++store.counters.cap); changed = true; } capIds.add(c.id); }));
  const subIds = new Set();
  store.RUBRIC.forEach(p => p.caps.forEach(c => c.subs.forEach(s => { if (!s.id || subIds.has(s.id)) { s.id = 'sx' + (++store.counters.sub); changed = true; } subIds.add(s.id); })));
  return changed;
}

// ---- admin-only hard deletes (gated by ?admin=<token>) -------------------
// Each delete removes exactly one row and lets ON DELETE CASCADE clean up
// its children (capabilities under a pillar, sub-capabilities under a
// capability, and — for vendors — every vendor_support/rationale cell for
// that vendor). No more resaving unrelated sibling rows to "clean up" after
// a delete, the way v2's deleteVendor had to resave every pillar blob.
async function withAuto(action) {
  setAuto('saving', 'saving...');
  try { await action(); setAuto('saved', 'all changes saved \u00b7 ' + new Date().toLocaleTimeString()); }
  catch (e) { setAuto('err', 'save failed - retry an edit'); console.error(e); }
}

export function deletePillar(key) {
  store.RUBRIC = store.RUBRIC.filter(p => p.key !== key); reindex(); markChanged();
  withAuto(async () => { const { deletePillarRow } = await import('../persistence/supabase.js'); await deletePillarRow(key); });
}
export function deleteCap(id) {
  store.RUBRIC.forEach(p => { p.caps = p.caps.filter(c => c.id !== id); });
  delete store.S.moscow[id];
  store.USE_CASE_LIBRARY.forEach(it => { if (it.caps) it.caps = it.caps.filter(cid => cid !== id); });
  (store.S.useCases || []).forEach(u => { if (u.capIds) u.capIds = u.capIds.filter(cid => cid !== id); });
  reindex(); markChanged();
  withAuto(async () => { const { deleteCapabilityRow } = await import('../persistence/supabase.js'); await deleteCapabilityRow(id); });
}
export function deleteSub(id) {
  store.RUBRIC.forEach(p => p.caps.forEach(c => { c.subs = c.subs.filter(s => s.id !== id); }));
  delete store.S.needs[id];
  reindex(); markChanged();
  withAuto(async () => { const { deleteSubCapabilityRow } = await import('../persistence/supabase.js'); await deleteSubCapabilityRow(id); });
}
export function deleteVendor(id) {
  store.PLATFORMS = store.PLATFORMS.filter(p => p.id !== id);
  store.RUBRIC.forEach(p => p.caps.forEach(c => c.subs.forEach(s => { delete s.sup[id]; if (s.rat) delete s.rat[id]; })));
  reindex(); markChanged();
  withAuto(async () => { const { deleteVendorRow } = await import('../persistence/supabase.js'); await deleteVendorRow(id); });
}

// ---- persistence-facing API ----------------------------------------------
// Rebuild store.PLATFORMS / store.RUBRIC / store.USE_CASE_LIBRARY from flat
// rows fetched from the eight normalized tables (see persistence/tables-sync.js
// fetchAll()). Groups rows by parent id, sorts by sort_order, and produces
// the exact same nested shape buildRubric() always produced — the one every
// render/scoring module already expects. Does not touch store.S.
export function assembleFromNormalizedRows({ pillars, capabilities, subCapabilities, vendors, vendorSupport, rationale, libraryItems, libraryCapLinks }) {
  if (Array.isArray(vendors) && vendors.length) {
    store.PLATFORMS = vendors.map(v => ({ id: v.id, name: v.name, code: v.code, retired: !!v.retired, custom: !!v.is_custom }));
  }

  const subsByCap = new Map();
  (subCapabilities || []).forEach(s => {
    if (!subsByCap.has(s.capability_id)) subsByCap.set(s.capability_id, []);
    subsByCap.get(s.capability_id).push(s);
  });
  subsByCap.forEach(arr => arr.sort((a, b) => a.sort_order - b.sort_order));

  const supportBySub = new Map();
  (vendorSupport || []).forEach(r => {
    if (!supportBySub.has(r.sub_capability_id)) supportBySub.set(r.sub_capability_id, {});
    supportBySub.get(r.sub_capability_id)[r.vendor_id] = !!r.supported;
  });

  const ratBySub = new Map();
  (rationale || []).forEach(r => {
    if (!ratBySub.has(r.sub_capability_id)) ratBySub.set(r.sub_capability_id, {});
    ratBySub.get(r.sub_capability_id)[r.vendor_id] = { note: r.note || '', tone: r.tone || 'note', conf: r.confidence || '' };
  });

  const capsByPillar = new Map();
  (capabilities || []).forEach(c => {
    if (!capsByPillar.has(c.pillar_id)) capsByPillar.set(c.pillar_id, []);
    capsByPillar.get(c.pillar_id).push(c);
  });
  capsByPillar.forEach(arr => arr.sort((a, b) => a.sort_order - b.sort_order));

  const sortedPillars = Array.isArray(pillars) ? [...pillars].sort((a, b) => a.sort_order - b.sort_order) : [];
  const rubric = sortedPillars.map(p => ({
    key: p.id, name: p.name, retired: !!p.retired,
    caps: (capsByPillar.get(p.id) || []).map(c => ({
      id: c.id, title: c.title, def: c.definition, retired: !!c.retired,
      subs: (subsByCap.get(c.id) || []).map(s => ({
        id: s.id, q: s.question, retired: !!s.retired,
        sup: supportBySub.get(s.id) || {},
        rat: ratBySub.get(s.id) || {},
      })),
    })),
  }));
  store.RUBRIC = rubric.length ? rubric : buildRubric();

  if (Array.isArray(libraryItems)) {
    const capsByUC = new Map();
    (libraryCapLinks || []).forEach(l => {
      if (!capsByUC.has(l.use_case_id)) capsByUC.set(l.use_case_id, []);
      capsByUC.get(l.use_case_id).push(l.capability_id);
    });
    store.USE_CASE_LIBRARY = [...libraryItems].sort((a, b) => a.sort_order - b.sort_order)
      .map(u => ({ id: u.id, title: u.title, desc: u.description, caps: capsByUC.get(u.id) || [] }));
  }

  normalizeRubric();
  syncCounters();
  const repaired = repairRubric();
  reindex();
  requestRender();
  return repaired;
}

// Human-readable full export for the admin "Export backup (.json)" button —
// pure serialization of current in-memory state; doesn't touch the DB.
export function exportData() {
  return { platforms: store.PLATFORMS, rubric: store.RUBRIC, useCases: store.USE_CASE_LIBRARY,
    selections: { moscow: store.S.moscow, needs: store.S.needs, useCases: store.S.useCases } };
}
export function exportRubric() { return { platforms: store.PLATFORMS, rubric: store.RUBRIC, useCases: store.USE_CASE_LIBRARY }; }

export function setEditMode(b) { store.editMode = !!b; requestRender(); }

// ---- initial (offline / pre-load) model ---------------------------------
export function initModel() {
  store.RUBRIC = buildRubric();
  normalizeRubric();
  reindex();
  store.S = defaultState();
  store.USE_CASE_LIBRARY = SEED_USECASES.map(x => ({ ...x, caps: [...(x.caps || [])] }));
  syncCounters();
}

// Build the seed model on import so `store` is never in a half-initialised
// state; page entries replace it via assembleFromNormalizedRows() once
// Supabase responds (or via loadAssessmentSelections() for store.S).
initModel();
