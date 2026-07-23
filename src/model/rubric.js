// ── Rubric lifecycle + domain model ───────────────────────────────────────
// Build/normalize/reindex the rubric, id helpers, counter sync, repair of
// legacy duplicate ids, admin hard-deletes, and the persistence-facing API
// (assembleFromRows / applySelections / getSelections / export).
// Pure DOM-free logic — rendering is triggered indirectly via the render bus.

import { store } from './state.js';
import { SEED } from '../data/seed-rubric.js';
import { RAT } from '../data/seed-rationale.js';
import { USE_CASE_LIBRARY as SEED_USECASES } from '../data/seed-usecases.js';
import { SEED_ORDER } from '../data/platforms.js';
import { requestRender } from '../ui/render-bus.js';

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
export function setUseCaseCounter() { store.counters.useCase = (store.S.useCases || []).reduce((m, u) => { const n = /^uc(\d+)$/.exec(u.id || ''); return n ? Math.max(m, +n[1]) : m; }, 0); }
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
// Each delete also removes/resaves exactly the DB row(s) it touches —
// deletePillar/deleteCap/deleteSub only ever touch one pillar row;
// deleteVendor is the one cross-cutting case (it strips that vendor's key
// out of every sub's sup/rat map, i.e. every pillar row), so it resaves all
// pillars once. This is a rare, admin-gated action — the occasional full
// resave is fine.
export function deletePillar(key) {
  store.RUBRIC = store.RUBRIC.filter(p => p.key !== key); reindex(); markChanged();
  deletePillarRowAndNotify(key);
}
export function deleteCap(id) {
  const owner = capPillar(findCap(id) || {}); const pkey = owner && owner.key;
  store.RUBRIC.forEach(p => { p.caps = p.caps.filter(c => c.id !== id); });
  delete store.S.moscow[id];
  store.USE_CASE_LIBRARY.forEach(it => { if (it.caps) it.caps = it.caps.filter(cid => cid !== id); });
  (store.S.useCases || []).forEach(u => { if (u.capIds) u.capIds = u.capIds.filter(cid => cid !== id); });
  reindex(); markChanged();
  if (pkey) resavePillarNow(pkey);
}
export function deleteSub(id) {
  const info = store.SUBIDX[id]; const pkey = info && info.pkey;
  store.RUBRIC.forEach(p => p.caps.forEach(c => { c.subs = c.subs.filter(s => s.id !== id); }));
  delete store.S.needs[id];
  reindex(); markChanged();
  if (pkey) resavePillarNow(pkey);
}
export function deleteVendor(id) {
  store.PLATFORMS = store.PLATFORMS.filter(p => p.id !== id);
  store.RUBRIC.forEach(p => p.caps.forEach(c => c.subs.forEach(s => { delete s.sup[id]; if (s.rat) delete s.rat[id]; })));
  reindex(); markChanged();
  deleteVendorRowAndNotify(id);
  store.RUBRIC.forEach((p, i) => resavePillarNow(p.key));
}

// Thin wrappers so this module doesn't import persistence eagerly at parse
// time (avoids a load-order cycle with granular-save's own model imports).
async function resavePillarNow(key) {
  const { schedulePillarSave } = await import('../persistence/granular-save.js');
  schedulePillarSave(key);
}
async function deletePillarRowAndNotify(key) {
  const { deletePillarRow } = await import('../persistence/supabase.js');
  try { await deletePillarRow(key); } catch (e) { console.error(e); }
}
async function deleteVendorRowAndNotify(id) {
  const { deleteVendorRow } = await import('../persistence/supabase.js');
  try { await deleteVendorRow(id); } catch (e) { console.error(e); }
}

// ---- persistence-facing API (row-based; used by page entries) -----------
// Each pillar/vendor/library item round-trips to exactly one DB row. These
// helpers convert between that row shape ({key|id, data, sort_order}) and
// the in-memory object shape (unchanged from the original single-blob model,
// so every scoring/render function below is untouched).
export function exportPillarRow(pillar, index) { const { key, ...rest } = pillar; return { key, data: rest, sort_order: index }; }
export function exportVendorRow(vendor, index) { const { id, ...rest } = vendor; return { id, data: rest, sort_order: index }; }
export function exportLibraryItemRow(item, index) { const { id, ...rest } = item; return { id, data: rest, sort_order: index }; }

// Rebuild store.PLATFORMS / store.RUBRIC / store.USE_CASE_LIBRARY from rows
// fetched from the three tables. Does not touch store.S — callers decide
// (initial load sets a default state; the assessment page re-applies the
// user's saved selections on top; see applySelections below).
export function assembleFromRows(pillarRows, vendorRows, libraryRows) {
  if (Array.isArray(vendorRows) && vendorRows.length) store.PLATFORMS = vendorRows.map(r => ({ id: r.id, ...r.data }));
  store.RUBRIC = Array.isArray(pillarRows) && pillarRows.length ? pillarRows.map(r => ({ key: r.key, ...r.data })) : buildRubric();
  if (Array.isArray(libraryRows)) store.USE_CASE_LIBRARY = libraryRows.map(r => ({ id: r.id, ...r.data }));
  normalizeRubric();
  syncCounters();
  const repaired = repairRubric();
  reindex();
  requestRender();
  return repaired;
}

// Human-readable full export for the admin "Export backup (.json)" button —
// same shape as the original single-blob format. Pure serialization of
// current in-memory state; doesn't touch the DB.
export function exportData() {
  return { platforms: store.PLATFORMS, rubric: store.RUBRIC, useCases: store.USE_CASE_LIBRARY,
    selections: { moscow: store.S.moscow, needs: store.S.needs, useCases: store.S.useCases } };
}
export function exportRubric() { return { platforms: store.PLATFORMS, rubric: store.RUBRIC, useCases: store.USE_CASE_LIBRARY }; }

// Overlay an assessment's saved selections on top of the loaded rubric.
export function applySelections(sel) {
  const base = defaultState();
  store.S = {
    moscow: { ...base.moscow, ...((sel && sel.moscow) || {}) },
    needs:  { ...base.needs,  ...((sel && sel.needs)  || {}) },
    useCases: Array.isArray(sel && sel.useCases) ? sel.useCases : [],
  };
  setUseCaseCounter(); store.collapsedPillars.clear(); requestRender();
}

export function getSelections() { return { moscow: store.S.moscow, needs: store.S.needs, useCases: store.S.useCases }; }
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
// state; page entries replace it via assembleFromRows() once Supabase responds.
initModel();
