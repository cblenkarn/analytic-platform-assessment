// Entry: assessment page (Use Cases / Prioritization / Results tabs).
import { byId } from '../ui/dom.js';
import { setRenderer } from '../ui/render-bus.js';
import { loadTables, subscribeTables, loadAssessmentSelections, subscribeAssessment } from '../persistence/tables-sync.js';
import { isConfigured, getAssessmentMeta } from '../persistence/supabase.js';
import { setAuto } from '../persistence/autosave.js';
import { assessmentIdFromUrl } from '../persistence/context.js';
import { renderAssessmentAll } from '../features/assessment/render.js';
import { initFrameworkEvents } from '../features/assessment/tab-prioritization/framework.events.js';
import { initUseCasesEvents } from '../features/assessment/tab-usecases/usecases.events.js';
import { closeUCCapPickers } from '../features/assessment/tab-usecases/usecases.view.js';

// Matches the original: tabs/panels are all rendered up-front by renderAssessmentAll();
// switching tabs only toggles which .panel has .active (CSS shows/hides), it doesn't re-render.
function initTabs() {
  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === t));
    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.dataset.panel === t.dataset.tab));
    closeUCCapPickers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }));
}

document.addEventListener('DOMContentLoaded', async () => {
  setRenderer(renderAssessmentAll);
  initFrameworkEvents();
  initUseCasesEvents();
  initTabs();

  const id = assessmentIdFromUrl();

  if (!isConfigured()) { setAuto('err', 'offline - configure Supabase to load & save'); renderAssessmentAll(); return; }
  if (!id) { setAuto('err', 'no assessment id - open one from the dashboard'); renderAssessmentAll(); return; }

  // ---- load the shared rubric/vendor/library tables (read-mostly here) ----
  await loadTables();

  // ---- load THIS assessment's own priorities / sub-needs / captured use
  // cases — each lives in its own table now, so no whole-blob save/reload
  // round-trip is needed for a single priority click or use-case edit. ----
  try {
    const meta = await getAssessmentMeta(id);
    await loadAssessmentSelections(id);
    const name = byId('snTitle'); if (name && meta) name.textContent = meta.name + (meta.client ? ' \u00b7 ' + meta.client : '');
    setAuto('saved', 'all changes saved');
  } catch (e) { setAuto('err', 'load failed'); console.error(e); }

  // ---- realtime: rubric edited elsewhere reloads the shared structure;
  // this assessment's own selections are synced independently. ----
  subscribeTables();
  subscribeAssessment(id, { onLoaded: renderAssessmentAll });
});
