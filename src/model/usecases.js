// ── Assessment use-case model ─────────────────────────────────────────────
// CRUD for the use cases captured inside a single assessment. Each use case
// is its own row in assessment_use_cases (not an element in a jsonb array on
// the assessment), and each capability mapping is its own row in
// assessment_use_case_capabilities — adding, renaming or removing one use
// case, or mapping/unmapping one capability, never touches any other use
// case belonging to the same assessment.
import { store } from './state.js';
import { markChanged, capMeta } from './rubric.js';
import { saveNow, scheduleUseCaseSave } from '../persistence/granular-save.js';
import { insertAssessmentUseCase, deleteAssessmentUseCase, addUseCaseCapLink, removeUseCaseCapLink } from '../persistence/supabase.js';

function uuid() {
  return (crypto.randomUUID ? crypto.randomUUID() : 'uc-' + Date.now() + '-' + Math.random().toString(16).slice(2));
}

export function useCasesForCap(capId) { return (store.S.useCases || []).filter(u => u.capIds && u.capIds.includes(capId)); }
export function libraryUsedIds() { const set = new Set(); (store.S.useCases || []).forEach(u => { if (u.sourceLibId) set.add(u.sourceLibId); }); return set; }

export function addUseCaseFromLibrary(assessmentId, libId) {
  const lib = store.USE_CASE_LIBRARY.find(l => l.id === libId); if (!lib) return;
  if (libraryUsedIds().has(libId)) return;
  const id = uuid();
  const capIds = [...(lib.caps || [])];
  const sortOrder = store.S.useCases.length;
  store.S.useCases.push({ id, title: lib.title, desc: lib.desc, capIds, sourceLibId: libId });
  markChanged();
  saveNow(async () => {
    await insertAssessmentUseCase({ id, assessment_id: assessmentId, title: lib.title, description: lib.desc, source_lib_id: libId, sort_order: sortOrder });
    await Promise.all(capIds.map(cid => addUseCaseCapLink(assessmentId, id, cid)));
  });
}
export function addCustomUseCase(assessmentId) {
  const id = uuid();
  const sortOrder = store.S.useCases.length;
  store.S.useCases.push({ id, title: '', desc: '', capIds: [], sourceLibId: null });
  markChanged();
  saveNow(() => insertAssessmentUseCase({ id, assessment_id: assessmentId, title: '', description: '', source_lib_id: null, sort_order: sortOrder }));
  return id;
}
export function deleteUseCase(id) {
  store.S.useCases = store.S.useCases.filter(u => u.id !== id);
  markChanged();
  saveNow(() => deleteAssessmentUseCase(id)); // cascades to assessment_use_case_capabilities in the DB
}
export function toggleUCCap(assessmentId, ucId, capId) {
  const uc = store.S.useCases.find(u => u.id === ucId); if (!uc) return;
  if (!uc.capIds) uc.capIds = [];
  const i = uc.capIds.indexOf(capId);
  if (i >= 0) { uc.capIds.splice(i, 1); saveNow(() => removeUseCaseCapLink(ucId, capId)); }
  else { uc.capIds.push(capId); saveNow(() => addUseCaseCapLink(assessmentId, ucId, capId)); }
  markChanged();
}
export function saveUseCaseField(id, fields) { scheduleUseCaseSave(id, fields); }

// "C1 · C9" style breadcrumb of the (still-existing) capability ids a use case maps to.
export function capIdStrip(uc) {
  return (uc.capIds || []).map(cid => { const m = capMeta(cid); return m ? m.c.id : null; }).filter(Boolean).join(' · ');
}
