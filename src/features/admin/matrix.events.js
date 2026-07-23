// ── Rubric Admin › events (verbatim branches + drag) ──────────────────────
import { store } from '../../model/state.js';
import { reindex, markChanged, findCap, findPillar, exportRubric,
         deletePillar, deleteCap, deleteSub, deleteVendor } from '../../model/rubric.js';
import { addPillar, addCap, addSub, addVendor,
         renamePillar, renameCap, renameCapDef, renameSub, renameVendorCode,
         toggleRetirePillar, toggleRetireCap, toggleRetireSub, retireVendor, restoreVendor,
         toggleSupport } from '../../model/rubric-edit.js';
import { active } from '../../scoring/coverage.js';
import { renderMatrix, updateSupportLabels } from './matrix.view.js';
import { renderAdminAll } from './render.js';
import { scheduleAllVendorsSave, scheduleAllPillarsSave, scheduleAllSubsInCap } from '../../persistence/granular-save.js';

let dragId=null;                      // vendor column drag
let subDragId=null, subDropRow=null, subDropAfter=false;  // sub-capability drag
let pillarDragKey=null;               // pillar drag

export function initMatrixEvents(){
  // ---------- clicks ----------
  document.addEventListener('click', e => {
    const tog=e.target.closest('[data-tog]'); if(tog){ toggleSupport(tog.dataset.tog, tog.dataset.pl); renderAdminAll(); updateSupportLabels(); return; }

    const addrow=e.target.closest('[data-addrow]'); if(addrow){ const id=addSub(addrow.dataset.addrow); store.pendingFocus=`[data-sublbl="${id}"]`; renderAdminAll(); return; }
    const addcap=e.target.closest('[data-addcap]'); if(addcap){ const id=addCap(addcap.dataset.addcap); store.pendingFocus=`[data-ctitle="${id}"]`; renderAdminAll(); return; }

    const retirerow=e.target.closest('[data-retirerow]'); if(retirerow){ toggleRetireSub(retirerow.dataset.retirerow); renderAdminAll(); return; }
    const retirecap=e.target.closest('[data-retirecap]'); if(retirecap){ toggleRetireCap(retirecap.dataset.retirecap); renderAdminAll(); return; }
    const retirepil=e.target.closest('[data-retirepillar]'); if(retirepil){ toggleRetirePillar(retirepil.dataset.retirepillar); renderAdminAll(); return; }

    const prt=e.target.closest('[data-plretire]'); if(prt){
      if(active().length<=2){ alert('Keep at least two active vendors to compare.'); return; }
      retireVendor(prt.dataset.plretire); renderAdminAll(); return; }
    const prs=e.target.closest('[data-plrestore]'); if(prs){ restoreVendor(prs.dataset.plrestore); renderAdminAll(); return; }

    if(store.adminDelete){
      const dpil=e.target.closest('[data-delpillar]'); if(dpil){const p=findPillar(dpil.dataset.delpillar);
        if(p&&confirm(`Permanently delete pillar “${p.name}” and all its capabilities and sub-capabilities?\n\nThis removes them from scoring in every assessment and cannot be undone. Use Retire instead to keep the data.`)){ deletePillar(dpil.dataset.delpillar); renderAdminAll(); } return;}
      const dcap=e.target.closest('[data-delcap]'); if(dcap){const cap=findCap(dcap.dataset.delcap);
        if(cap&&confirm(`Permanently delete capability “${cap.title}” and its sub-capabilities?\n\nIt will also be unmapped from any use cases. This cannot be undone. Use Retire instead to keep the data.`)){ deleteCap(dcap.dataset.delcap); renderAdminAll(); } return;}
      const drow=e.target.closest('[data-delrow]'); if(drow){const info=store.SUBIDX[drow.dataset.delrow];
        if(info&&confirm(`Permanently delete this sub-capability?\n\n“${info.sub.q}”\n\nThis cannot be undone. Use Retire instead to keep the data.`)){ deleteSub(drow.dataset.delrow); renderAdminAll(); } return;}
      const dven=e.target.closest('[data-pldelete]'); if(dven){const p=store.PLATFORMS.find(x=>x.id===dven.dataset.pldelete);
        if(store.PLATFORMS.length<=2){alert('Keep at least two vendors to compare.');return;}
        if(p&&confirm(`Permanently delete vendor “${p.name}” and all of its support ratings and SME notes?\n\nThis cannot be undone. Use Retire instead to keep the data.`)){ deleteVendor(dven.dataset.pldelete); renderAdminAll(); } return;}
    }

    if(e.target.id==='addVendorBtn'){ const name=(prompt('New vendor name (e.g., Heap):')||'').trim(); if(!name)return;
      addVendor(name); renderAdminAll(); return; }
    if(e.target.id==='addPillarBtn'){ const key=addPillar(); store.pendingFocus=`[data-pname="${key}"]`; renderAdminAll(); return; }
    if(e.target.id==='btnExport'){ doExport(); return; }
  });

  // ---------- contenteditable renames (commit on blur) ----------
  document.addEventListener('blur', e => {
    if(e.target.matches && e.target.matches('[data-sublbl]')){ renameSub(e.target.dataset.sublbl, e.target.textContent.trim()); renderMatrix(); return; }
    if(e.target.matches && e.target.matches('[data-ctitle]')){ renameCap(e.target.dataset.ctitle, e.target.textContent.trim()); return; }
    if(e.target.matches && e.target.matches('[data-cdef]')){ renameCapDef(e.target.dataset.cdef, e.target.textContent.trim()); return; }
    if(e.target.matches && e.target.matches('[data-pname]')){ renamePillar(e.target.dataset.pname, e.target.textContent.trim()); return; }
    if(e.target.matches && e.target.matches('[data-plcode]')){ renameVendorCode(e.target.dataset.plcode, e.target.textContent.trim()); renderAdminAll(); return; }
  }, true);

  // ---------- vendor column drag ----------
  document.addEventListener('dragstart',e=>{const hd=e.target.closest('[data-drag]'); if(!hd||!store.editMode)return;
    dragId=hd.dataset.drag; e.dataTransfer.effectAllowed='move'; const th=hd.closest('.plhead'); if(th)th.classList.add('dragging');});
  document.addEventListener('dragover',e=>{ if(!dragId)return; const th=e.target.closest('.plhead'); if(!th)return; e.preventDefault();
    document.querySelectorAll('.plhead.drop-target').forEach(x=>{if(x!==th)x.classList.remove('drop-target');});
    if(th.dataset.plid!==dragId)th.classList.add('drop-target');});
  document.addEventListener('drop',e=>{ if(!dragId)return; const th=e.target.closest('.plhead'); e.preventDefault();
    if(th&&th.dataset.plid&&th.dataset.plid!==dragId){const arr=[...store.PLATFORMS];const from=arr.findIndex(p=>p.id===dragId);
      const [m]=arr.splice(from,1); const to=arr.findIndex(p=>p.id===th.dataset.plid); arr.splice(to,0,m); store.PLATFORMS=arr; markChanged(); scheduleAllVendorsSave();}
    dragId=null; renderAdminAll();});
  document.addEventListener('dragend',()=>{dragId=null; document.querySelectorAll('.dragging,.drop-target').forEach(x=>x.classList.remove('dragging','drop-target'));});

  // ---------- sub-capability drag (Excel-row style, cross-capability) ----------
  document.addEventListener('dragstart', e => {
    const h = e.target.closest('[data-subdrag]'); if (!h || !store.editMode) return;
    subDragId = h.dataset.subdrag; e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', subDragId); } catch (_) {}
    const tr = h.closest('tr'); if (tr) tr.classList.add('sub-dragging');
  });
  document.addEventListener('dragover', e => {
    if (!subDragId) return;
    const tr = e.target.closest('tr[data-subrow-id]'); if (!tr) return;
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
    const rect = tr.getBoundingClientRect();
    const after = (e.clientY - rect.top) > rect.height / 2;
    if (subDropRow !== tr || subDropAfter !== after) {
      clearSubDropMarkers(); subDropRow = tr; subDropAfter = after;
      tr.classList.add(after ? 'sub-drop-after' : 'sub-drop-before');
    }
  });
  document.addEventListener('drop', e => {
    if (!subDragId) return;
    const tr = e.target.closest('tr[data-subrow-id]'); e.preventDefault();
    if (tr && tr.dataset.subrowId !== subDragId) moveSub(subDragId, tr.dataset.subrowCap, tr.dataset.subrowId, subDropAfter);
    subDragId = null; subDropRow = null; subDropAfter = false; clearSubDropMarkers();
  });
  document.addEventListener('dragend', () => {
    subDragId = null; subDropRow = null; subDropAfter = false; clearSubDropMarkers();
    document.querySelectorAll('tr.sub-dragging').forEach(r => r.classList.remove('sub-dragging'));
  });

  // ---------- pillar drag ----------
  document.addEventListener('dragstart',e=>{const ph=e.target.closest('[data-pdrag]'); if(!ph||!store.editMode)return;
    pillarDragKey=ph.dataset.pdrag; e.dataTransfer.effectAllowed='move'; const card=ph.closest('.pillar-card'); if(card)card.classList.add('pillar-dragging');});
  document.addEventListener('dragover',e=>{ if(!pillarDragKey)return; const card=e.target.closest('.pillar-card'); if(!card)return; e.preventDefault();
    document.querySelectorAll('.pillar-card.pillar-drop').forEach(x=>{if(x!==card)x.classList.remove('pillar-drop');});
    if(card.dataset.pcard!==pillarDragKey)card.classList.add('pillar-drop');});
  document.addEventListener('drop',e=>{ if(!pillarDragKey)return; const card=e.target.closest('.pillar-card'); e.preventDefault();
    if(card&&card.dataset.pcard&&card.dataset.pcard!==pillarDragKey){
      const from=store.RUBRIC.findIndex(p=>p.key===pillarDragKey);
      if(from>=0){const [m]=store.RUBRIC.splice(from,1); const to=store.RUBRIC.findIndex(p=>p.key===card.dataset.pcard); store.RUBRIC.splice(to,0,m); reindex(); markChanged(); scheduleAllPillarsSave();}}
    pillarDragKey=null; renderAdminAll();});
  document.addEventListener('dragend',()=>{pillarDragKey=null; document.querySelectorAll('.pillar-dragging,.pillar-drop').forEach(x=>x.classList.remove('pillar-dragging','pillar-drop'));});
}

function clearSubDropMarkers() {
  document.querySelectorAll('tr.sub-drop-before, tr.sub-drop-after').forEach(r => r.classList.remove('sub-drop-before', 'sub-drop-after'));
}
function findSubOwner(subId) {
  for (const p of store.RUBRIC) for (const c of p.caps) { const idx = c.subs.findIndex(s => s.id === subId); if (idx >= 0) return { pillar: p, cap: c, idx, sub: c.subs[idx] }; }
  return null;
}
function moveSub(subId, targetCapId, targetSubId, after) {
  const src = findSubOwner(subId); if (!src) return;
  const targetCap = findCap(targetCapId); if (!targetCap) return;
  const srcCapId = src.cap.id;
  const [moved] = src.cap.subs.splice(src.idx, 1);
  let insertAt;
  if (targetSubId) { let ti = targetCap.subs.findIndex(s => s.id === targetSubId); if (ti < 0) ti = targetCap.subs.length - 1; insertAt = after ? ti + 1 : ti; }
  else insertAt = targetCap.subs.length;
  targetCap.subs.splice(Math.max(0, Math.min(insertAt, targetCap.subs.length)), 0, moved);
  reindex(); renderAdminAll(); markChanged();
  // Resave sort_order (and, for the moved row, its new capability_id) for
  // every sub-capability in the source and destination capability only —
  // never the whole pillar these capabilities happen to live in.
  scheduleAllSubsInCap(srcCapId);
  if (targetCapId !== srcCapId) scheduleAllSubsInCap(targetCapId);
}

function doExport() {
  const data = exportRubric();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'merkle-rubric-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
}