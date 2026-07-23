// ── Prioritization › event handlers (verbatim branches) ───────────────────
import { store } from '../../../model/state.js';
import { markChanged } from '../../../model/rubric.js';
import { renderAssessmentLive } from '../render.js';

export function initFrameworkEvents() {
  document.addEventListener('click', e => {
    const rf=e.target.closest('[data-refine]'); if(rf){rf.closest('.cap').classList.toggle('open');return;}
    const ph=e.target.closest('[data-pillar]'); if(ph){const k=ph.dataset.pillar;
      if(store.collapsedPillars.has(k))store.collapsedPillars.delete(k);else store.collapsedPillars.add(k);
      ph.parentElement.classList.toggle('collapsed');return;}
    const mb=e.target.closest('.moscow button'); if(mb){store.S.moscow[mb.parentElement.dataset.cap]=mb.dataset.on;renderAssessmentLive();markChanged();return;}
  });
  document.addEventListener('change', e => {
    if(e.target.matches('[data-need]')){store.S.needs[e.target.dataset.need]=e.target.checked;renderAssessmentLive();markChanged();}
  });
}
