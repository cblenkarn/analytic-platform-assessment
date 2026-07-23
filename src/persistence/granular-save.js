// ── Row-scoped autosave (v3 — fully normalized tables) ────────────────────
// Every edit saves exactly the row(s) it touched. The important change from
// v2: a support-checkbox toggle or a rationale note now writes a SINGLE
// (sub-capability × vendor) row, instead of resaving the whole pillar blob
// those used to live inside. Two people editing two different cells — even
// in the same pillar, even in the same sub-capability's row (one toggling
// support, the other writing a note) — write to two different rows (or two
// different tables entirely) and can never collide.
//
// `dirty` tracks "<kind>:<id>" keys with an edit pending save. tables-sync.js
// checks this before applying an incoming realtime change for that exact
// row: if you're still mid-edit on it, the remote change is queued (sync
// banner) instead of silently discarding what you're typing. A remote
// change to any OTHER row always applies immediately.
import { store } from '../model/state.js';
import { findPillar, findCap } from '../model/rubric.js';
import {
  upsertPillar, upsertCapability, upsertSubCapability, upsertVendor,
  setVendorSupport, deleteRationale, upsertRationale, upsertLibraryItem,
} from './supabase.js';
import { setAuto } from './autosave.js';

const FIELD_DEBOUNCE_MS = 500; // name/title/def/question edits — typing
const CELL_DEBOUNCE_MS = 250;  // support checkbox / rationale cell — clicks

export const dirty = new Set();

async function run(key, fn) {
  dirty.add(key);
  setAuto('saving', 'saving...');
  try { await fn(); setAuto('saved', 'all changes saved \u00b7 ' + new Date().toLocaleTimeString()); }
  catch (e) { setAuto('err', 'save failed - retry an edit'); console.error(e); }
  finally { dirty.delete(key); }
}

// Fire-and-await a one-off action (discrete clicks: retire toggles, MoSCoW
// button clicks, need checkboxes, use-case capability links) with the same
// autosave-indicator behaviour as a debounced field save, but no delay.
export async function saveNow(fn) {
  setAuto('saving', 'saving...');
  try { await fn(); setAuto('saved', 'all changes saved \u00b7 ' + new Date().toLocaleTimeString()); }
  catch (e) { setAuto('err', 'save failed - retry an edit'); console.error(e); }
}

function debounced(timerMap, key, ms, fn) {
  dirty.add(key);
  clearTimeout(timerMap.get(key));
  timerMap.set(key, setTimeout(() => run(key, fn), ms));
}

// ---- pillars ----
const pillarTimers = new Map();
export function schedulePillarSave(key, opts = {}) {
  debounced(pillarTimers, 'pillar:' + key, FIELD_DEBOUNCE_MS, async () => {
    const p = findPillar(key); if (!p) return;
    const sortOrder = opts.sortOrder != null ? opts.sortOrder : store.RUBRIC.findIndex(x => x.key === key);
    await upsertPillar(key, { name: p.name, retired: !!p.retired }, sortOrder);
  });
}
export function scheduleAllPillarsSave() { store.RUBRIC.forEach((p, i) => schedulePillarSave(p.key, { sortOrder: i })); }

// ---- capabilities ----
const capTimers = new Map();
export function scheduleCapabilitySave(id, opts = {}) {
  debounced(capTimers, 'capability:' + id, FIELD_DEBOUNCE_MS, async () => {
    const c = findCap(id); if (!c) return;
    const owner = store.RUBRIC.find(p => p.caps.some(x => x.id === id));
    const sortOrder = opts.sortOrder != null ? opts.sortOrder : (owner ? owner.caps.findIndex(x => x.id === id) : 0);
    await upsertCapability(id, { pillar_id: owner ? owner.key : undefined, title: c.title, definition: c.def, retired: !!c.retired }, sortOrder);
  });
}

// ---- sub-capabilities ----
const subTimers = new Map();
export function scheduleSubSave(id, opts = {}) {
  debounced(subTimers, 'sub:' + id, FIELD_DEBOUNCE_MS, async () => {
    const info = store.SUBIDX[id]; if (!info) return;
    const sortOrder = opts.sortOrder != null ? opts.sortOrder : info.cap.subs.findIndex(x => x.id === id);
    const capabilityId = opts.capabilityId || info.cap.id;
    await upsertSubCapability(id, { capability_id: capabilityId, question: info.sub.q, retired: !!info.sub.retired }, sortOrder);
  });
}
// Used after a cross-capability drag-move: resave sort_order (and, for the
// moved row, its new capability_id) for every sub-capability in one capability.
export function scheduleAllSubsInCap(capId) {
  const c = findCap(capId); if (!c) return;
  c.subs.forEach((s, i) => scheduleSubSave(s.id, { sortOrder: i, capabilityId: capId }));
}

// ---- vendors ----
const vendorTimers = new Map();
export function scheduleVendorSave(id, opts = {}) {
  debounced(vendorTimers, 'vendor:' + id, FIELD_DEBOUNCE_MS, async () => {
    const v = store.PLATFORMS.find(p => p.id === id); if (!v) return;
    const sortOrder = opts.sortOrder != null ? opts.sortOrder : store.PLATFORMS.findIndex(x => x.id === id);
    await upsertVendor(id, { name: v.name, code: v.code, retired: !!v.retired, is_custom: !!v.custom }, sortOrder);
  });
}
export function scheduleAllVendorsSave() { store.PLATFORMS.forEach((v, i) => scheduleVendorSave(v.id, { sortOrder: i })); }

// ---- vendor_support (single checkbox cell) ----
const supportTimers = new Map();
export function scheduleSupportSave(subId, vendorId, value) {
  debounced(supportTimers, 'support:' + subId + ':' + vendorId, CELL_DEBOUNCE_MS, () => setVendorSupport(subId, vendorId, value));
}

// ---- rationale (single note cell) ----
const rationaleTimers = new Map();
export function scheduleRationaleSave(subId, vendorId, fields) {
  debounced(rationaleTimers, 'rationale:' + subId + ':' + vendorId, CELL_DEBOUNCE_MS, async () => {
    if (!fields.note || !fields.note.trim()) { await deleteRationale(subId, vendorId); return; }
    await upsertRationale(subId, vendorId, fields);
  });
}

// ---- use-case library items ----
const libTimers = new Map();
export function scheduleLibraryItemSave(id, fields, sortOrder) {
  debounced(libTimers, 'lib:' + id, FIELD_DEBOUNCE_MS, () => {
    const so = sortOrder != null ? sortOrder : store.USE_CASE_LIBRARY.findIndex(x => x.id === id);
    return upsertLibraryItem(id, fields, so);
  });
}

// ---- assessment use cases (title/description edits) ----
const ucTimers = new Map();
export function scheduleUseCaseSave(id, fields) {
  debounced(ucTimers, 'uc:' + id, FIELD_DEBOUNCE_MS, async () => {
    const { updateAssessmentUseCase } = await import('./supabase.js');
    await updateAssessmentUseCase(id, fields);
  });
}
