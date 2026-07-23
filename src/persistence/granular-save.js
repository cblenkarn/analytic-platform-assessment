// ── Row-scoped autosave ────────────────────────────────────────────────────
// Each edit saves only the ONE row it touched (one pillar, the vendor list,
// or one library item) — never the whole rubric. Two editors touching
// different rows can never overwrite each other.
//
// `dirty` tracks rows with an edit pending save. tables-sync.js checks this
// before applying an incoming realtime change for that row: if you're still
// mid-edit on it, the remote change is queued (sync banner) instead of
// silently overwriting what you're typing; a remote change to any OTHER row
// always applies immediately, since it can't conflict with your edit.
import { store } from '../model/state.js';
import { findPillar } from '../model/rubric.js';
import { upsertPillar, upsertVendor, upsertLibraryItem } from './supabase.js';
import { setAuto } from './autosave.js';

const DEBOUNCE_MS = 600;

export const dirty = { pillars: new Set(), vendors: false, library: new Set() };

const pillarTimers = new Map();
export function schedulePillarSave(key) {
  dirty.pillars.add(key);
  clearTimeout(pillarTimers.get(key));
  pillarTimers.set(key, setTimeout(async () => {
    const p = findPillar(key);
    const index = store.RUBRIC.findIndex(x => x.key === key);
    setAuto('saving', 'saving...');
    try {
      if (p && index >= 0) { const { key: k, ...rest } = p; await upsertPillar(k, rest, index); }
      setAuto('saved', 'all changes saved \u00b7 ' + new Date().toLocaleTimeString());
    } catch (e) { setAuto('err', 'save failed - retry an edit'); console.error(e); }
    dirty.pillars.delete(key);
  }, DEBOUNCE_MS));
}
// Used after a repair/reassembly that touched every pillar's ids at once.
export function scheduleAllPillarsSave() { store.RUBRIC.forEach(p => schedulePillarSave(p.key)); }

let vendorsTimer = null;
export function scheduleVendorsSave() {
  dirty.vendors = true;
  clearTimeout(vendorsTimer);
  vendorsTimer = setTimeout(async () => {
    setAuto('saving', 'saving...');
    try {
      await Promise.all(store.PLATFORMS.map((v, i) => { const { id, ...rest } = v; return upsertVendor(id, rest, i); }));
      setAuto('saved', 'all changes saved \u00b7 ' + new Date().toLocaleTimeString());
    } catch (e) { setAuto('err', 'save failed - retry an edit'); console.error(e); }
    dirty.vendors = false;
  }, DEBOUNCE_MS);
}

const libTimers = new Map();
export function scheduleLibrarySave(id) {
  dirty.library.add(id);
  clearTimeout(libTimers.get(id));
  libTimers.set(id, setTimeout(async () => {
    const item = store.USE_CASE_LIBRARY.find(x => x.id === id);
    const index = store.USE_CASE_LIBRARY.findIndex(x => x.id === id);
    setAuto('saving', 'saving...');
    try {
      if (item && index >= 0) { const { id: i, ...rest } = item; await upsertLibraryItem(i, rest, index); }
      setAuto('saved', 'all changes saved \u00b7 ' + new Date().toLocaleTimeString());
    } catch (e) { setAuto('err', 'save failed - retry an edit'); console.error(e); }
    dirty.library.delete(id);
  }, DEBOUNCE_MS));
}
