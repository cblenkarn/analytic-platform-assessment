// Entry: assessment page (Use Cases / Prioritization / Results tabs).
import { byId, debounce } from '../ui/dom.js';
import { setRenderer } from '../ui/render-bus.js';
import { applySelections, getSelections } from '../model/rubric.js';
import { loadTables, subscribeTables } from '../persistence/tables-sync.js';
import { isConfigured, getAssessment, putSelections } from '../persistence/supabase.js';
import { setAuto } from '../persistence/autosave.js';
import { renderAssessmentAll } from '../features/assessment/render.js';
import { initFrameworkEvents } from '../features/assessment/tab-prioritization/framework.events.js';
import { initUseCasesEvents } from '../features/assessment/tab-usecases/usecases.events.js';
import { closeUCCapPickers } from '../features/assessment/tab-usecases/usecases.view.js';

function assessmentId() { try { return new URLSearchParams(location.search).get('id'); } catch (e) { return null; } }

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

  const id = assessmentId();

  if (!isConfigured()) { setAuto('err', 'offline - configure Supabase to load & save'); renderAssessmentAll(); return; }
  if (!id) { setAuto('err', 'no assessment id - open one from the dashboard'); renderAssessmentAll(); return; }

  // ---- load the rubric (read-mostly here) + this assessment's own selections ----
  await loadTables();
  try {
    const a = await getAssessment(id);
    applySelections((a && a.data) || {});
    const name = byId('snTitle'); if (name && a) name.textContent = a.name + (a.client ? ' \u00b7 ' + a.client : '');
    setAuto('saved', 'all changes saved');
  } catch (e) { setAuto('err', 'load failed'); console.error(e); }

  // ---- autosave THIS assessment's selections (unchanged: one row per
  // assessment was never the collision risk — it's already scoped to one
  // client engagement, not shared across every assessment like the rubric was) ----
  const save = debounce(async () => {
    setAuto('saving', 'saving...');
    try { await putSelections(id, getSelections()); setAuto('saved', 'all changes saved \u00b7 ' + new Date().toLocaleTimeString()); }
    catch (e) { setAuto('err', 'save failed'); console.error(e); }
  }, 700);
  document.addEventListener('pet-selections-changed', save);

  // ---- realtime: rubric edited elsewhere → reload structure, keep this
  // assessment's selections layered on top ----
  subscribeTables({ preserveSelections: true });
});
