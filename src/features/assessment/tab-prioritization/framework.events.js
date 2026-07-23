// ── Prioritization › event handlers (verbatim branches) ───────────────────
// A MoSCoW click or a "needed" checkbox now writes exactly one row —
// assessment_priorities / assessment_sub_needs, keyed by (assessment,
// capability) or (assessment, sub-capability) — instead of debouncing a
// save of the assessment's entire selections blob.
import { store } from '../../../model/state.js';
import { markChanged } from '../../../model/rubric.js';
import { renderAssessmentLive } from '../render.js';
import { setPriority, setSubNeed } from '../../../persistence/supabase.js';
import { saveNow } from '../../../persistence/granular-save.js';
import { assessmentIdFromUrl } from '../../../persistence/context.js';

export function initFrameworkEvents() {
  document.addEventListener('click', e => {
    const rf=e.target.closest('[data-refine]'); if(rf){rf.closest('.cap').classList.toggle('open');return;}
    const ph=e.target.closest('[data-pillar]'); if(ph){const k=ph.dataset.pillar;
      if(store.collapsedPillars.has(k))store.collapsedPillars.delete(k);else store.collapsedPillars.add(k);
      ph.parentElement.classList.toggle('collapsed');return;}
    const mb=e.target.closest('.moscow button'); if(mb){
      const capId = mb.parentElement.dataset.cap;
      store.S.moscow[capId] = mb.dataset.on; renderAssessmentLive(); markChanged();
      const aid = assessmentIdFromUrl(); if (aid) saveNow(() => setPriority(aid, capId, mb.dataset.on));
      return;
    }
  });
  document.addEventListener('change', e => {
    if(e.target.matches('[data-need]')){
      const subId = e.target.dataset.need;
      store.S.needs[subId] = e.target.checked; renderAssessmentLive(); markChanged();
      const aid = assessmentIdFromUrl(); if (aid) saveNow(() => setSubNeed(aid, subId, e.target.checked));
    }
  });
}
