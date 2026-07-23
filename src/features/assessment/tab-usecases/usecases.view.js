// ── Use Cases tab › view (verbatim port) ──────────────────────────────────
import { el, esc } from '../../../ui/dom.js';
import { store } from '../../../model/state.js';
import { pLetter, capMeta } from '../../../model/rubric.js';
import { libraryUsedIds } from '../../../model/usecases.js';

export function renderUseCases(){
  renderUCLibrary();
  renderUCSelected();
}
function renderUCLibrary(){
  const lib=document.getElementById('ucLibrary'); if(!lib)return;
  const used=libraryUsedIds();
  lib.innerHTML='';
  store.USE_CASE_LIBRARY.forEach(item=>{
    const isUsed=used.has(item.id);
    const chip=el(`<button class="uc-lib-chip ${isUsed?'used':''}" data-libadd="${item.id}" title="${esc(item.desc)}">${esc(item.title)}</button>`);
    lib.appendChild(chip);
  });
}
export function renderUCSelected(){
  const wrap=document.getElementById('ucSelected'); if(!wrap)return;
  const empty=document.getElementById('ucEmpty');
  const count=document.getElementById('ucCount');
  const list=store.S.useCases||[];
  if(count) count.textContent = list.length===1 ? '1 use case' : (list.length+' use cases');
  if(!list.length){ wrap.innerHTML=''; if(empty)empty.hidden=false; return; }
  if(empty) empty.hidden=true;
  wrap.innerHTML='';
  list.forEach(uc=>{
    const capChips = (uc.capIds||[]).map(cid=>{
      const meta=capMeta(cid);
      if(!meta) return '';
      return `<span class="uc-cap-chip" title="Pillar ${meta.letter} · ${esc(meta.c.title)}"><span class="uc-cap-code">${meta.letter} · ${meta.c.id}</span><span class="uc-cap-title">${esc(meta.c.title)}</span><button class="uc-cap-x" data-uccap-remove data-uc="${uc.id}" data-cap="${cid}" title="Remove capability">×</button></span>`;
    }).join('');
    const capsBody = capChips || '<span class="uc-cap-none">No capabilities mapped yet — click <b>+ Capability</b> to map one.</span>';
    const card=el(`<div class="uc-card" data-uc="${uc.id}">
      <div class="uc-head">
        <div class="uc-title" contenteditable="true" data-uctitle="${uc.id}">${esc(uc.title||'')}</div>
        <button class="uc-del" data-ucdel="${uc.id}" title="Remove use case">×</button>
      </div>
      <div class="uc-desc" contenteditable="true" data-ucdesc="${uc.id}">${esc(uc.desc||'')}</div>
      <div class="uc-caps-wrap">
        <div class="uc-caps-label">Maps to capabilities <span class="uc-caps-count">${(uc.capIds||[]).length}</span></div>
        <div class="uc-caps">${capsBody}<span class="uc-add-cap"><button class="uc-add-cap-btn" data-ucaddcap="${uc.id}">+ Capability</button></span></div>
      </div>
    </div>`);
    wrap.appendChild(card);
  });
}
export function toggleUCCapPicker(btn){
  const already=btn.parentElement.querySelector('.uc-cap-pop');
  document.querySelectorAll('.uc-cap-pop').forEach(p=>p.remove());
  if(already) return; // second click on same button closes
  const ucId=btn.dataset.ucaddcap;
  const uc=store.S.useCases.find(u=>u.id===ucId); if(!uc) return;
  const holder=btn.parentElement;
  const pop=document.createElement('div');
  pop.className='uc-cap-pop show';
  pop.dataset.uc=ucId;
  let html='';
  store.RUBRIC.forEach(p=>{
    if(!p.caps.length) return;
    html+=`<div class="ucp-pillar"><div class="ucp-plname">Pillar ${pLetter(p.key)} — ${esc(p.name)}</div>`;
    p.caps.forEach(c=>{
      const checked=(uc.capIds||[]).includes(c.id);
      html+=`<label class="ucp-opt ${checked?'checked':''}"><input type="checkbox" data-ucpick data-uc="${ucId}" data-cap="${c.id}" ${checked?'checked':''}><span class="ucp-code">${c.id}</span><span>${esc(c.title)}</span></label>`;
    });
    html+='</div>';
  });
  html+='<div class="ucp-close"><button data-ucpickclose>Done</button></div>';
  pop.innerHTML=html;
  holder.appendChild(pop);
}
export function closeUCCapPickers(){ document.querySelectorAll('.uc-cap-pop').forEach(p=>p.remove()); }
