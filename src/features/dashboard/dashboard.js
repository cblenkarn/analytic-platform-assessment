// ── Dashboard feature ─────────────────────────────────────────────────────
// Metrics + assessment grid + create/delete. Reads the flat tables directly
// for headline counts — each is now its own small table (no more reaching
// into a nested `.data.caps` blob to count things).
import { byId, esc } from '../../ui/dom.js';
import { isConfigured, listAssessments, listPillars, listCapabilities, listSubCapabilities, listVendors, listLibrary, createAssessment, delAssessment } from '../../persistence/supabase.js';

export async function initDashboard() {
  if (!isConfigured()) {
    const m = byId('dashMsg');
    if (m) { m.hidden = false; m.classList.add('err');
      m.textContent = 'Supabase is not configured. Add your project URL and publishable key in config.js to load and save assessments.'; }
    return;
  }
  await renderDash();
  byId('btnNew')?.addEventListener('click', async () => {
    const name = (prompt('Name this assessment (e.g., "Hobby Lobby - Analytics RFP"):') || '').trim();
    if (!name) return;
    const client = (prompt('Client / brand (optional):') || '').trim() || null;
    try { const id = await createAssessment(name, client); location.href = '/assessment?id=' + id; }
    catch (e) { alert('Could not create assessment: ' + e.message); }
  });
}

async function renderDash() {
  const grid = byId('assessGrid'), empty = byId('dashEmpty'), msg = byId('dashMsg');
  if (!grid) return;

  // Fetch independently so one failure doesn't blank the others.
  let list = [], pillarRows = [], capRows = [], subRows = [], vendorRows = [], libraryRows = [];
  let listErr = null, rubricErr = null;
  try { list = await listAssessments(); } catch (e) { listErr = e; console.error('[dashboard] listAssessments failed:', e); }
  try {
    [pillarRows, capRows, subRows, vendorRows, libraryRows] = await Promise.all([
      listPillars(), listCapabilities(), listSubCapabilities(), listVendors(), listLibrary(),
    ]);
  } catch (e) { rubricErr = e; console.error('[dashboard] rubric tables failed:', e); }

  const nPillars = pillarRows.length;
  const nCaps = capRows.length;
  const nSubs = subRows.length;
  const nUseCases = libraryRows.length;
  const nVendors = vendorRows.filter(r => !r.retired).length;

  const set = (id, v) => { const e = byId(id); if (e) e.textContent = v; };
  set('mUseCases', nUseCases); set('mAssessments', list.length); set('mPillars', nPillars); set('mSubs', nSubs);
  set('mtPillars', nPillars); set('mtCaps', nCaps); set('mtSubs', nSubs); set('mtVendors', nVendors); set('mtUC', nUseCases);

  if (msg) {
    if (listErr || rubricErr) {
      const parts = [];
      if (listErr) parts.push('assessments (' + listErr.message + ')');
      if (rubricErr) parts.push('rubric (' + rubricErr.message + ')');
      msg.hidden = false; msg.classList.add('err');
      msg.textContent = 'Could not load ' + parts.join(' and ') + '. See browser console for details.';
    } else if (!pillarRows.length && !list.length) {
      msg.hidden = false; msg.classList.remove('err');
      msg.textContent = 'The master rubric hasn\u2019t been initialized yet. Open Manage rubric or Manage use cases once to seed it, then come back to see the metrics populate.';
    } else { msg.hidden = true; }
  }

  grid.innerHTML = '';
  if (!list.length) { if (empty) empty.hidden = false; return; }
  if (empty) empty.hidden = true;
  list.forEach(a => {
    const card = document.createElement('a');
    card.className = 'assess-card'; card.href = '/assessment?id=' + a.id;
    const when = new Date(a.updated_at).toLocaleString();
    card.innerHTML =
      '<button class="ac-del" title="Delete" data-del="' + a.id + '">\u2715</button>' +
      '<h3>' + esc(a.name) + '</h3>' +
      (a.client ? '<div class="ac-client">' + esc(a.client) + '</div>' : '') +
      '<div class="ac-meta">Updated ' + esc(when) + '</div>';
    grid.appendChild(card);
  });
  grid.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async e => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm('Delete this assessment? This cannot be undone.')) return;
    try { await delAssessment(b.dataset.del); await renderDash(); }
    catch (err) { alert('Delete failed: ' + err.message); }
  }));
}
