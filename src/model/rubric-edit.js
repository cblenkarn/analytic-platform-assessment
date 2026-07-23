// ── Structural rubric edits (admin) — behaviour matches the original inline
// handlers (new sub in-scope, new cap defaults to "should", pillar expands).
// Every mutator now schedules a save of ONLY the row it touched, at the
// finest grain the schema supports: pillar/capability/sub-capability
// metadata each go to their own table row; a support-checkbox toggle writes
// a single (sub-capability × vendor) cell — no more resaving the whole
// pillar (and every other capability/sub/cell inside it) for one click. ────
import { store } from './state.js';
import { reindex, markChanged, findPillar, findCap } from './rubric.js';
import {
  schedulePillarSave, scheduleCapabilitySave, scheduleSubSave, scheduleVendorSave, scheduleSupportSave,
} from '../persistence/granular-save.js';

// ---- add (return the id/key; caller sets pendingFocus selector) ----
export function addPillar() {
  const key = 'P' + (++store.counters.pillar);
  store.RUBRIC.push({ key, name: 'New pillar', retired: false, caps: [] });
  reindex(); markChanged();
  schedulePillarSave(key, { sortOrder: store.RUBRIC.length - 1 });
  return key;
}
export function addCap(pillarKey) {
  const p = findPillar(pillarKey); if (!p) return null;
  const id = 'C' + (++store.counters.cap);
  p.caps.push({ id, title: 'New capability', def: '', retired: false, subs: [] });
  store.S.moscow[id] = 'should';
  reindex(); store.collapsedPillars.delete(p.key); markChanged();
  scheduleCapabilitySave(id, { sortOrder: p.caps.length - 1 });
  return id;
}
export function addSub(capId) {
  const c = findCap(capId); if (!c) return null;
  const id = 'sx' + (++store.counters.sub);
  const sup = {}; store.PLATFORMS.forEach(p => sup[p.id] = false);
  c.subs.push({ id, q: 'New sub-capability — describe a distinguishing requirement', sup, rat: {}, retired: false });
  store.S.needs[id] = true;
  reindex();
  if (store.SUBIDX[id]) store.collapsedPillars.delete(store.SUBIDX[id].pkey);
  markChanged();
  scheduleSubSave(id, { sortOrder: c.subs.length - 1 });
  return id;
}
export function addVendor(name) {
  const nm = (name || '').trim(); if (!nm) return null;
  const id = 'v' + (++store.counters.vendor);
  const code = nm.length <= 12 ? nm : nm.slice(0, 12);
  store.PLATFORMS.push({ id, name: nm, code, custom: true });
  store.RUBRIC.forEach(p => p.caps.forEach(c => c.subs.forEach(s => { if (!s.sup) s.sup = {}; s.sup[id] = false; })));
  reindex(); markChanged();
  scheduleVendorSave(id, { sortOrder: store.PLATFORMS.length - 1 });
  return id;
}

// ---- rename ----
export function renamePillar(key, name) { const p = findPillar(key); if (p) { p.name = name || p.name; markChanged(); schedulePillarSave(key); } }
export function renameCap(id, title) { const c = findCap(id); if (c) { c.title = title || c.title; markChanged(); scheduleCapabilitySave(id); } }
export function renameSub(id, q) { const info = store.SUBIDX[id]; if (info) { info.sub.q = q || info.sub.q; markChanged(); scheduleSubSave(id); } }
export function renameVendorCode(id, code) { const v = store.PLATFORMS.find(p => p.id === id); if (v) { v.code = code || v.code; markChanged(); scheduleVendorSave(id); } }

// ---- retire / restore ----
export function toggleRetirePillar(key) { const p = findPillar(key); if (p) { p.retired = !p.retired; markChanged(); schedulePillarSave(key); } }
export function toggleRetireCap(id) { const c = findCap(id); if (c) { c.retired = !c.retired; markChanged(); scheduleCapabilitySave(id); } }
export function toggleRetireSub(id) { const info = store.SUBIDX[id]; if (info) { info.sub.retired = !info.sub.retired; markChanged(); scheduleSubSave(id); } }
export function retireVendor(id) { const v = store.PLATFORMS.find(p => p.id === id); if (v) { v.retired = true; markChanged(); scheduleVendorSave(id); } }
export function restoreVendor(id) { const v = store.PLATFORMS.find(p => p.id === id); if (v) { v.retired = false; markChanged(); scheduleVendorSave(id); } }

// ---- support toggle: ONE ROW, not the whole pillar ----
export function toggleSupport(subId, plId) {
  const info = store.SUBIDX[subId]; if (!info) return;
  if (!info.sub.sup) info.sub.sup = {};
  info.sub.sup[plId] = !info.sub.sup[plId];
  markChanged();
  scheduleSupportSave(subId, plId, info.sub.sup[plId]);
}
