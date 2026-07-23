// ── Assessment use-case model ─────────────────────────────────────────────
// CRUD for the use cases captured inside a single assessment (store.S.useCases)
// and their capability mappings. Library CRUD lives in model/library.js.

import { store } from './state.js';
import { markChanged, capMeta } from './rubric.js';

export function useCasesForCap(capId) { return (store.S.useCases || []).filter(u => u.capIds && u.capIds.includes(capId)); }
export function libraryUsedIds() { const set = new Set(); (store.S.useCases || []).forEach(u => { if (u.sourceLibId) set.add(u.sourceLibId); }); return set; }
function nextUCId() { return 'uc' + (++store.counters.useCase); }

export function addUseCaseFromLibrary(libId) {
  const lib = store.USE_CASE_LIBRARY.find(l => l.id === libId); if (!lib) return;
  if (libraryUsedIds().has(libId)) return;
  store.S.useCases.push({ id: nextUCId(), title: lib.title, desc: lib.desc, capIds: [...(lib.caps || [])], sourceLibId: libId });
  markChanged();
}
export function addCustomUseCase() {
  store.S.useCases.push({ id: nextUCId(), title: '', desc: '', capIds: [], sourceLibId: null });
  markChanged();
}
export function deleteUseCase(id) { store.S.useCases = store.S.useCases.filter(u => u.id !== id); markChanged(); }
export function toggleUCCap(ucId, capId) {
  const uc = store.S.useCases.find(u => u.id === ucId); if (!uc) return;
  if (!uc.capIds) uc.capIds = [];
  const i = uc.capIds.indexOf(capId);
  if (i >= 0) uc.capIds.splice(i, 1); else uc.capIds.push(capId);
  markChanged();
}

// "C1 · C9" style breadcrumb of the (still-existing) capability ids a use case maps to.
export function capIdStrip(uc) {
  return (uc.capIds || []).map(cid => { const m = capMeta(cid); return m ? m.c.id : null; }).filter(Boolean).join(' · ');
}
