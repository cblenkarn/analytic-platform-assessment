// Persistence layer — Supabase (Postgres). Loaded as a module after the app.
// If config.js has no keys, the app runs fully offline (Export/Import JSON still works).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cfg = (window.APP_CONFIG || {});
const RUBRIC_ID = 'master';
let sb = null;
let currentAssessment = null;

if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) {
  try { sb = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY); }
  catch (e) { console.error('Supabase init failed', e); }
}

const $ = (id) => document.getElementById(id);
const esc = (s) => (s || '').replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
function status(id, msg, ok = true) { const e = $(id); if (e) { e.textContent = msg; e.className = 'cloud-status ' + (ok ? 'ok' : 'err'); } }

// ---- data access ----
async function loadRubric() {
  const { data, error } = await sb.from('rubrics').select('data').eq('id', RUBRIC_ID).maybeSingle();
  if (error) throw error; return data ? data.data : null;
}
async function saveRubric(d) {
  const { error } = await sb.from('rubrics').upsert({ id: RUBRIC_ID, data: d, updated_at: new Date().toISOString() });
  if (error) throw error;
}
async function listAssessments() {
  const { data, error } = await sb.from('assessments').select('id,name,client,updated_at').order('updated_at', { ascending: false });
  if (error) throw error; return data || [];
}
async function insertAssessment(name, client, d) {
  const { data, error } = await sb.from('assessments').insert({ name, client, data: d }).select('id').single();
  if (error) throw error; return data.id;
}
async function updateAssessment(id, name, client, d) {
  const { error } = await sb.from('assessments').update({ name, client, data: d, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}
async function getAssessment(id) {
  const { data, error } = await sb.from('assessments').select('data,name,client').eq('id', id).single();
  if (error) throw error; return data;
}
async function removeAssessment(id) {
  const { error } = await sb.from('assessments').delete().eq('id', id);
  if (error) throw error;
}

// ---- wiring ----
async function refreshAssessments() {
  try {
    const list = await listAssessments();
    const sel = $('assessSelect'); if (!sel) return;
    sel.innerHTML = '<option value="">— New / unsaved —</option>' +
      list.map(a => `<option value="${a.id}">${esc(a.name)}${a.client ? ' · ' + esc(a.client) : ''}</option>`).join('');
    if (currentAssessment) sel.value = currentAssessment;
  } catch (e) { status('assessStatus', 'List failed: ' + e.message, false); }
}

function wire() {
  $('btnCloudSaveRubric')?.addEventListener('click', async () => {
    try { await saveRubric(window.PET.exportRubric()); status('cloudStatus', 'Rubric saved to cloud ' + new Date().toLocaleTimeString()); }
    catch (e) { status('cloudStatus', 'Save failed: ' + e.message, false); }
  });
  $('btnCloudLoadRubric')?.addEventListener('click', async () => {
    try { const r = await loadRubric(); if (r) { window.PET.loadRubricData(r); status('cloudStatus', 'Rubric reloaded from cloud'); } else status('cloudStatus', 'No saved rubric yet', false); }
    catch (e) { status('cloudStatus', 'Load failed: ' + e.message, false); }
  });

  $('btnSaveAssess')?.addEventListener('click', async () => {
    const name = ($('assessName').value || '').trim();
    const client = ($('assessClient').value || '').trim() || null;
    try {
      if (currentAssessment) {
        await updateAssessment(currentAssessment, name || 'Untitled', client, window.PET.exportData());
        status('assessStatus', 'Assessment updated');
      } else {
        if (!name) { status('assessStatus', 'Enter a name first', false); return; }
        currentAssessment = await insertAssessment(name, client, window.PET.exportData());
        status('assessStatus', 'Assessment saved');
        $('btnDeleteAssess').hidden = false;
      }
      await refreshAssessments();
    } catch (e) { status('assessStatus', 'Save failed: ' + e.message, false); }
  });

  $('assessSelect')?.addEventListener('change', async (e) => {
    const id = e.target.value, del = $('btnDeleteAssess');
    if (!id) { currentAssessment = null; if (del) del.hidden = true; $('assessName').value = ''; $('assessClient').value = ''; return; }
    try {
      const a = await getAssessment(id);
      window.PET.importData(a.data);
      currentAssessment = id;
      $('assessName').value = a.name || ''; $('assessClient').value = a.client || '';
      if (del) del.hidden = false;
      status('assessStatus', 'Loaded "' + (a.name || '') + '"');
    } catch (err) { status('assessStatus', 'Load failed: ' + err.message, false); }
  });

  $('btnDeleteAssess')?.addEventListener('click', async () => {
    if (!currentAssessment) return;
    if (!confirm('Delete this saved assessment? The master rubric is not affected.')) return;
    try {
      await removeAssessment(currentAssessment);
      currentAssessment = null; $('assessName').value = ''; $('assessClient').value = '';
      $('btnDeleteAssess').hidden = true; await refreshAssessments();
      status('assessStatus', 'Deleted');
    } catch (e) { status('assessStatus', 'Delete failed: ' + e.message, false); }
  });
}

async function init() {
  // wait for the app to expose its integration API
  let tries = 0; while (!window.PET && tries < 60) { await new Promise(r => setTimeout(r, 50)); tries++; }
  if (!window.PET) return;

  if (!sb) {
    status('cloudStatus', 'Offline — add Supabase keys in config.js to enable cloud save', false);
    return;
  }
  document.querySelectorAll('.cloud-only').forEach(e => (e.hidden = false));
  const bar = $('assessBar'); if (bar) bar.hidden = false;

  try {
    let r = await loadRubric();
    if (!r) { r = window.PET.exportRubric(); await saveRubric(r); status('cloudStatus', 'Seeded master rubric to Supabase'); }
    else { window.PET.loadRubricData(r); status('cloudStatus', 'Rubric loaded from cloud'); }
  } catch (e) { status('cloudStatus', 'Rubric load failed: ' + e.message, false); }

  await refreshAssessments();
  wire();
}
init();
