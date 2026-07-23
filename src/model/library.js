// ── Use-case library model (edited on /usecases) ──────────────────────────
// CRUD for the master library. use_case_library holds one row per item;
// use_case_library_capabilities holds one row per (use case × capability)
// mapping — checking or unchecking one capability writes/deletes exactly
// that one link row, never touching the item's title/description row or any
// other use case's mappings.
import { store } from './state.js';
import { saveNow, scheduleLibraryItemSave } from '../persistence/granular-save.js';
import { upsertLibraryItem, deleteLibraryItem as deleteLibraryItemRow, addLibraryCapLink, removeLibraryCapLink } from '../persistence/supabase.js';

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
  const sortOrder = store.USE_CASE_LIBRARY.length;
  store.USE_CASE_LIBRARY.push({ id, title: '', desc: '', caps: [] });
  markLibChanged();
  saveNow(() => upsertLibraryItem(id, { title: '', description: '' }, sortOrder));
  return id;
}
export function libDeleteItem(id) {
  store.USE_CASE_LIBRARY = store.USE_CASE_LIBRARY.filter(x => x.id !== id);
  markLibChanged();
  saveNow(() => deleteLibraryItemRow(id)); // cascades to use_case_library_capabilities in the DB
}
export function libToggleCap(libId, capId) {
  const it = store.USE_CASE_LIBRARY.find(x => x.id === libId); if (!it) return;
  if (!it.caps) it.caps = [];
  const i = it.caps.indexOf(capId);
  if (i >= 0) { it.caps.splice(i, 1); saveNow(() => removeLibraryCapLink(libId, capId)); }
  else { it.caps.push(capId); saveNow(() => addLibraryCapLink(libId, capId)); }
  markLibChanged();
}
export function libSaveField(id, fields) { scheduleLibraryItemSave(id, fields); }
