// ── Use-case library model (edited on /usecases) ──────────────────────────
// CRUD for the master library — now its own table (use_case_library), one
// row per use case, instead of a nested array inside the rubric blob. Each
// edit schedules a save of just that one row (see persistence/granular-save.js).
import { store } from './state.js';
import { scheduleLibrarySave } from '../persistence/granular-save.js';

export function markLibChanged() { document.dispatchEvent(new Event('pet-library-changed')); }

function nextLibId() {
  const taken = new Set(store.USE_CASE_LIBRARY.map(x => x.id));
  let n = store.counters.lib;
  do { n++; } while (taken.has('lib-custom-' + n));
  store.counters.lib = n;
  return 'lib-custom-' + n;
}

export function libAddItem() {
  const id = nextLibId();
  store.USE_CASE_LIBRARY.push({ id, title: '', desc: '', caps: [] });
  markLibChanged(); scheduleLibrarySave(id);
  return id;
}
export function libDeleteItem(id) {
  store.USE_CASE_LIBRARY = store.USE_CASE_LIBRARY.filter(x => x.id !== id);
  markLibChanged();
  // fire-and-forget row delete; dynamic import avoids a static persistence
  // dependency for a page that mostly just edits in-memory state
  import('../persistence/supabase.js').then(({ deleteLibraryItem }) => deleteLibraryItem(id).catch(e => console.error(e)));
}
export function libToggleCap(libId, capId) {
  const it = store.USE_CASE_LIBRARY.find(x => x.id === libId); if (!it) return;
  if (!it.caps) it.caps = [];
  const i = it.caps.indexOf(capId);
  if (i >= 0) it.caps.splice(i, 1); else it.caps.push(capId);
  markLibChanged(); scheduleLibrarySave(libId);
}
