// ===================================================================
// db.js — Supabase data layer (single master rubric + assessments)
// Page-routed by <body data-page="dashboard|assessment|admin">.
//   rubrics     : one row id='master', data jsonb = {platforms, rubric, _rev}
//   assessments : id, name, client, data jsonb = {moscow, needs, useCases}
// Rubric edits autosave (last-write-wins) and live-sync across editors.
// ===================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cfg  = window.APP_CONFIG || {};
const page = document.body.dataset.page;
const $    = id => document.getElementById(id);
const esc  = s => (s || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const RUBRIC_ID = 'master';

// per-tab identity so we can ignore the realtime echo of our own writes
const clientId = Math.random().toString(36).slice(2);
let myRev = null;

let sb = null;
if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) {
  try { sb = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY); }
  catch (e) { console.error('Supabase init failed', e); }
}

function setAuto(state, text) {
  const a = $('autosave'); if (!a) return;
  a.className = 'autosave ' + state;
  const t = $('autosaveText'); if (t) t.textContent = text;
}
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
function ready() {
  return new Promise(res => {
    if (window.PET) return res(true);
    let n = 0; const i = setInterval(() => {
      if (window.PET || ++n > 60) { clearInterval(i); res(!!window.PET); }
    }, 50);
  });
}

// ---------------- data access ----------------
async function getRubric() {
  const { data, error } = await sb.from('rubrics').select('data').eq('id', RUBRIC_ID).maybeSingle();
  // maybeSingle should return {data:null, error:null} when no row matches, but some
  // client versions surface PGRST116 ("no rows") as an error — treat that as "not seeded yet".
  if (error && error.code !== 'PGRST116') throw error;
  return data ? data.data : null;
}
async function putRubric(d) {
  const rev = clientId + ':' + Date.now(); myRev = rev;
  const { error } = await sb.from('rubrics')
    .upsert({ id: RUBRIC_ID, data: { ...d, _rev: rev }, updated_at: new Date().toISOString() });
  if (error) throw error;
}
async function listAssessments() {
  const { data, error } = await sb.from('assessments')
    .select('id,name,client,updated_at').order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
async function createAssessment(name, client) {
  const { data, error } = await sb.from('assessments')
    .insert({ name, client, data: { moscow: {}, needs: {}, useCases: [] } }).select('id').single();
  if (error) throw error;
  return data.id;
}
async function getAssessment(id) {
  const { data, error } = await sb.from('assessments').select('name,client,data').eq('id', id).single();
  if (error) throw error;
  return data;
}
async function putSelections(id, sel) {
  const { error } = await sb.from('assessments')
    .update({ data: sel, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}
async function delAssessment(id) {
  const { error } = await sb.from('assessments').delete().eq('id', id);
  if (error) throw error;
}

// ---------------- route ----------------
if (!sb) {
  if (page === 'dashboard') {
    const m = $('dashMsg');
    if (m) { m.hidden = false; m.classList.add('err');
      m.textContent = 'Supabase is not configured. Add your project URL and publishable key in config.js to load and save assessments.'; }
  } else { setAuto('err', 'offline - set Supabase keys in config.js'); }
} else if (page === 'dashboard') {
  initDashboard();
} else if (page === 'assessment') {
  initAssessment();
} else if (page === 'admin') {
  initAdmin();
} else if (page === 'usecases') {
  initUsecasesAdmin();
}

// ================= DASHBOARD =================
async function initDashboard() {
  await renderDash();
  $('btnNew')?.addEventListener('click', async () => {
    const name = (prompt('Name this assessment (e.g., "Hobby Lobby - Analytics RFP"):') || '').trim();
    if (!name) return;
    const client = (prompt('Client / brand (optional):') || '').trim() || null;
    try { const id = await createAssessment(name, client); location.href = '/assessment?id=' + id; }
    catch (e) { alert('Could not create assessment: ' + e.message); }
  });
}
async function renderDash() {
  const grid = $('assessGrid'), empty = $('dashEmpty'), msg = $('dashMsg');
  if (!grid) return;

  // Fetch each independently — a rubric fetch failure must not blank the assessments list,
  // and vice versa. Log any errors so they show in DevTools console for diagnosis.
  let list = [], rubric = null;
  let listErr = null, rubricErr = null;
  try { list = await listAssessments(); }
  catch (e) { listErr = e; console.error('[dashboard] listAssessments failed:', e); }
  try { rubric = await getRubric(); }
  catch (e) { rubricErr = e; console.error('[dashboard] getRubric failed:', e); }

  // ---- Metrics ----
  let nPillars = 0, nCaps = 0, nSubs = 0, nUseCases = 0, nVendors = 0;
  if (rubric && typeof rubric === 'object') {
    const r = Array.isArray(rubric.rubric) ? rubric.rubric : [];
    nPillars = r.length;
    r.forEach(p => (p.caps || []).forEach(c => { nCaps++; nSubs += (c.subs || []).length; }));
    nUseCases = Array.isArray(rubric.useCases) ? rubric.useCases.length : 0;
    // "Active" vendors = not retired (retired ones are kept for history)
    nVendors = Array.isArray(rubric.platforms) ? rubric.platforms.filter(p => !p.retired).length : 0;
  }
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  // Top row
  set('mUseCases', nUseCases);
  set('mAssessments', list.length);
  set('mPillars', nPillars);
  set('mSubs', nSubs);
  // Admin tile metadata rows
  set('mtPillars', nPillars);
  set('mtCaps', nCaps);
  set('mtSubs', nSubs);
  set('mtVendors', nVendors);
  set('mtUC', nUseCases);

  // Banner — errors first, then first-run hint if applicable
  if (msg) {
    if (listErr || rubricErr) {
      const parts = [];
      if (listErr) parts.push('assessments (' + listErr.message + ')');
      if (rubricErr) parts.push('rubric (' + rubricErr.message + ')');
      msg.hidden = false;
      msg.classList.add('err');
      msg.textContent = 'Could not load ' + parts.join(' and ') + '. See browser console for details.';
    } else if (!rubric && !list.length) {
      msg.hidden = false;
      msg.classList.remove('err');
      msg.textContent = 'The master rubric hasn\u2019t been initialized yet. Open Manage rubric or Manage use cases once to seed it, then come back to see the metrics populate.';
    } else {
      msg.hidden = true;
    }
  }

  // ---- Assessments grid ----
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

// ================= ASSESSMENT =================
async function initAssessment() {
  if (!await ready()) return;
  const id = new URLSearchParams(location.search).get('id');
  if (!id) { location.replace('/dashboard'); return; }
  setAuto('saving', 'loading...');
  try {
    const r = await getRubric();
    if (r) window.PET.loadRubricData(r);
    const a = await getAssessment(id);
    const t = $('snTitle'); if (t) t.textContent = a.name + (a.client ? ' \u00b7 ' + a.client : '');
    window.PET.applySelections(a.data || {});
    setAuto('saved', 'saved');
  } catch (e) {
    setAuto('err', 'load failed'); console.error(e);
    const t = $('snTitle'); if (t) t.textContent = 'Assessment not found';
    return;
  }
  const save = debounce(async () => {
    setAuto('saving', 'saving...');
    try { await putSelections(id, window.PET.getSelections()); setAuto('saved', 'saved ' + new Date().toLocaleTimeString()); }
    catch (e) { setAuto('err', 'save failed'); }
  }, 700);
  // Primary trigger: any state mutation in core.js dispatches this custom event
  // (covers MoSCoW, sub-capability needs, use case add/edit/delete/capability-mapping).
  document.addEventListener('pet-selections-changed', save);
  // Belt-and-braces: keep the original click/change listener in case any code path forgets to dispatch.
  ['click', 'change'].forEach(ev => document.addEventListener(ev, e => {
    if (e.target.closest('.moscow') || e.target.matches('[data-need]')) save();
  }, true));
  sb.channel('rub-view').on('postgres_changes',
    { event: '*', schema: 'public', table: 'rubrics', filter: 'id=eq.' + RUBRIC_ID },
    payload => {
      const d = payload.new && payload.new.data;
      if (!d || d._rev === myRev) return;
      const sel = window.PET.getSelections();
      window.PET.loadRubricData(d);
      window.PET.applySelections(sel);
    }).subscribe();
}

// ================= ADMIN =================
async function initAdmin() {
  if (!await ready()) return;
  window.PET.setEditMode(true);
  setAuto('saving', 'loading...');
  let lastSaved = null;
  try {
    let r = await getRubric();
    if (!r) { r = window.PET.exportRubric(); await putRubric(r); }
    else { window.PET.loadRubricData(r); }
    lastSaved = JSON.stringify(window.PET.exportRubric());
    setAuto('saved', 'all changes saved');
  } catch (e) { setAuto('err', 'load failed'); console.error(e); }

  const doSave = debounce(async () => {
    const cur = JSON.stringify(window.PET.exportRubric());
    if (cur === lastSaved) return;
    setAuto('saving', 'saving...');
    try { await putRubric(window.PET.exportRubric()); lastSaved = cur; setAuto('saved', 'all changes saved \u00b7 ' + new Date().toLocaleTimeString()); }
    catch (e) { setAuto('err', 'save failed - retry an edit'); }
  }, 800);
  ['click', 'input', 'change', 'blur', 'drop'].forEach(ev => document.addEventListener(ev, () => doSave(), true));

  let pendingRemote = null;
  sb.channel('rub-admin').on('postgres_changes',
    { event: '*', schema: 'public', table: 'rubrics', filter: 'id=eq.' + RUBRIC_ID },
    payload => {
      const d = payload.new && payload.new.data;
      if (!d || d._rev === myRev) return;
      const cur = JSON.stringify(window.PET.exportRubric());
      if (cur === lastSaved) {
        window.PET.loadRubricData(d);
        lastSaved = JSON.stringify(window.PET.exportRubric());
        setAuto('saved', 'updated by another editor');
      } else {
        pendingRemote = d;
        $('syncBanner')?.classList.add('show');
      }
    }).subscribe();
  $('btnSyncReload')?.addEventListener('click', () => {
    if (!pendingRemote) return;
    window.PET.loadRubricData(pendingRemote);
    lastSaved = JSON.stringify(window.PET.exportRubric());
    pendingRemote = null;
    $('syncBanner')?.classList.remove('show');
    setAuto('saved', 'reloaded');
  });
}

// ================= USE CASE LIBRARY ADMIN =================
// Edits USE_CASE_LIBRARY, persisted alongside the rubric in rubrics.master.
async function initUsecasesAdmin() {
  if (!await ready()) return;
  setAuto('saving', 'loading...');
  let lastSaved = null;
  try {
    let r = await getRubric();
    if (!r) { r = window.PET.exportRubric(); await putRubric(r); }
    else { window.PET.loadRubricData(r); }
    // Render into #libEditor now that the rubric (capabilities) is loaded
    window.PET.renderLibraryEditor();
    lastSaved = JSON.stringify(window.PET.exportRubric());
    setAuto('saved', 'all changes saved');
  } catch (e) { setAuto('err', 'load failed'); console.error(e); }

  const doSave = debounce(async () => {
    const cur = JSON.stringify(window.PET.exportRubric());
    if (cur === lastSaved) return;
    setAuto('saving', 'saving...');
    try { await putRubric(window.PET.exportRubric()); lastSaved = cur; setAuto('saved', 'all changes saved \u00b7 ' + new Date().toLocaleTimeString()); }
    catch (e) { setAuto('err', 'save failed - retry an edit'); }
  }, 800);
  // Any interaction on the page triggers a save-check; doSave no-ops when nothing changed.
  ['click', 'input', 'change', 'blur'].forEach(ev => document.addEventListener(ev, () => doSave(), true));
  // Belt-and-braces: also react to our explicit library-changed event.
  document.addEventListener('pet-library-changed', doSave);

  let pendingRemote = null;
  sb.channel('rub-uc').on('postgres_changes',
    { event: '*', schema: 'public', table: 'rubrics', filter: 'id=eq.' + RUBRIC_ID },
    payload => {
      const d = payload.new && payload.new.data;
      if (!d || d._rev === myRev) return;
      const cur = JSON.stringify(window.PET.exportRubric());
      if (cur === lastSaved) {
        window.PET.loadRubricData(d);
        window.PET.renderLibraryEditor();
        lastSaved = JSON.stringify(window.PET.exportRubric());
        setAuto('saved', 'updated by another editor');
      } else {
        pendingRemote = d;
        $('syncBanner')?.classList.add('show');
      }
    }).subscribe();
  $('btnSyncReload')?.addEventListener('click', () => {
    if (!pendingRemote) return;
    window.PET.loadRubricData(pendingRemote);
    window.PET.renderLibraryEditor();
    lastSaved = JSON.stringify(window.PET.exportRubric());
    pendingRemote = null;
    $('syncBanner')?.classList.remove('show');
    setAuto('saved', 'reloaded');
  });
}