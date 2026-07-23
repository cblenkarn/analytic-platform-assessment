// ── Structural rubric edits (admin) — behaviour matches the original inline
// handlers (new sub in-scope, new cap defaults to "should", pillar expands).
// Every mutator schedules a save of ONLY the row(s) it touched — see
// persistence/granular-save.js — never a resave of the whole rubric. ──────
import { store } from './state.js';
import { reindex, markChanged, findPillar, findCap, capPillar } from './rubric.js';
import { schedulePillarSave, scheduleVendorsSave } from '../persistence/granular-save.js';

// ---- add (return the id/key; caller sets pendingFocus selector) ----
export function addPillar() {
  const key = 'P' + (++store.counters.pillar);
  store.RUBRIC.push({ key, name: 'New pillar', retired: false, caps: [] });
  reindex(); markChanged(); schedulePillarSave(key);
  return key;
}
export function addCap(pillarKey) {
  const p = findPillar(pillarKey); if (!p) return null;
  const id = 'C' + (++store.counters.cap);
  p.caps.push({ id, title: 'New capability', def: '', retired: false, subs: [] });
  store.S.moscow[id] = 'should';
  reindex(); store.collapsedPillars.delete(p.key); markChanged(); schedulePillarSave(pillarKey);
  return id;
}
export function addSub(capId) {
  const c = findCap(capId); if (!c) return null;
  const pkeyBefore = capPillar(c)?.key;
  const id = 'sx' + (++store.counters.sub);
  const sup = {}; store.PLATFORMS.forEach(p => sup[p.id] = false);
  c.subs.push({ id, q: 'New sub-capability — describe a distinguishing requirement', sup, rat: {}, retired: false });
  store.S.needs[id] = true;
  reindex();
  if (store.SUBIDX[id]) store.collapsedPillars.delete(store.SUBIDX[id].pkey);
  markChanged();
  if (pkeyBefore) schedulePillarSave(pkeyBefore);
  return id;
}
export function addVendor(name) {
  const nm = (name || '').trim(); if (!nm) return null;
  const id = 'v' + (++store.counters.vendor);
  const code = nm.length <= 12 ? nm : nm.slice(0, 12);
  store.PLATFORMS.push({ id, name: nm, code, custom: true });
  store.RUBRIC.forEach(p => p.caps.forEach(c => c.subs.forEach(s => { if (!s.sup) s.sup = {}; s.sup[id] = false; })));
  reindex(); markChanged(); scheduleVendorsSave();
  return id;
}

// ---- rename ----
export function renamePillar(key, name) { const p = findPillar(key); if (p) { p.name = name || p.name; markChanged(); schedulePillarSave(key); } }
export function renameCap(id, title) { const c = findCap(id); if (c) { c.title = title || c.title; markChanged(); const pk = capPillar(c)?.key; if (pk) schedulePillarSave(pk); } }
export function renameCapDef(id, def) { const c = findCap(id); if (c) { c.def = def || ''; markChanged(); const pk = capPillar(c)?.key; if (pk) schedulePillarSave(pk); } }
export function renameSub(id, q) { const info = store.SUBIDX[id]; if (info) { info.sub.q = q || info.sub.q; markChanged(); schedulePillarSave(info.pkey); } }
export function renameVendorCode(id, code) { const v = store.PLATFORMS.find(p => p.id === id); if (v) { v.code = code || v.code; markChanged(); scheduleVendorsSave(); } }

// ---- retire / restore ----
export function toggleRetirePillar(key) { const p = findPillar(key); if (p) { p.retired = !p.retired; markChanged(); schedulePillarSave(key); } }
export function toggleRetireCap(id) { const c = findCap(id); if (c) { c.retired = !c.retired; markChanged(); const pk = capPillar(c)?.key; if (pk) schedulePillarSave(pk); } }
export function toggleRetireSub(id) { const info = store.SUBIDX[id]; if (info) { info.sub.retired = !info.sub.retired; markChanged(); schedulePillarSave(info.pkey); } }
export function retireVendor(id) { const v = store.PLATFORMS.find(p => p.id === id); if (v) { v.retired = true; markChanged(); scheduleVendorsSave(); } }
export function restoreVendor(id) { const v = store.PLATFORMS.find(p => p.id === id); if (v) { v.retired = false; markChanged(); scheduleVendorsSave(); } }

// ---- support toggle ----
export function toggleSupport(subId, plId) {
  const info = store.SUBIDX[subId]; if (!info) return;
  if (!info.sub.sup) info.sub.sup = {};
  info.sub.sup[plId] = !info.sub.sup[plId];
  markChanged(); schedulePillarSave(info.pkey);
}