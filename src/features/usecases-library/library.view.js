// ── Master use-case library admin page › view (verbatim port) ─────────────
import { el, esc } from '../../ui/dom.js';
import { store } from '../../model/state.js';
import { pLetter, capMeta } from '../../model/rubric.js';

export function renderLibraryEditor(){
  const wrap=document.getElementById('libEditor'); if(!wrap)return;
  const count=document.getElementById('libCount');
  if(count) count.textContent = store.USE_CASE_LIBRARY.length===1?'1 use case':(store.USE_CASE_LIBRARY.length+' use cases');
  wrap.innerHTML='';
  store.USE_CASE_LIBRARY.forEach(item=>{
    const capChips=(item.caps||[]).map(cid=>{
      const meta=capMeta(cid); if(!meta)return '';
      return `<span class="uc-cap-chip" title="Pillar ${meta.letter} · ${esc(meta.c.title)}"><span class="uc-cap-code">${meta.letter} · ${meta.c.id}</span><span class="uc-cap-title">${esc(meta.c.title)}</span><button class="uc-cap-x" data-libeditremcap data-lib="${item.id}" data-cap="${cid}" title="Remove capability">×</button></span>`;
    }).join('');
    const capsBody=capChips||'<span class="uc-cap-none">No capabilities mapped yet — click <b>+ Capability</b>.</span>';
    const card=el(`<div class="uc-card" data-lib="${item.id}">
      <div class="uc-head">
        <div class="uc-title" contenteditable="true" data-libedittitle="${item.id}">${esc(item.title||'')}</div>
        <button class="uc-del" data-libeditdel="${item.id}" title="Remove from library">×</button>
      </div>
      <div class="uc-desc" contenteditable="true" data-libeditdesc="${item.id}">${esc(item.desc||'')}</div>
      <div class="uc-caps-wrap">
        <div class="uc-caps-label">Maps to capabilities <span class="uc-caps-count">${(item.caps||[]).length}</span></div>
        <div class="uc-caps">${capsBody}<span class="uc-add-cap"><button class="uc-add-cap-btn" data-libeditaddcap="${item.id}">+ Capability</button></span></div>
      </div>
    </div>`);
    wrap.appendChild(card);
  });
}
export function toggleLibCapPicker(btn){
  const already=btn.parentElement.querySelector('.uc-cap-pop');
  document.querySelectorAll('.uc-cap-pop').forEach(p=>p.remove());
  if(already)return;
  const libId=btn.dataset.libeditaddcap;
  const item=store.USE_CASE_LIBRARY.find(i=>i.id===libId); if(!item)return;
  const holder=btn.parentElement;
  const pop=document.createElement('div');
  pop.className='uc-cap-pop show'; pop.dataset.lib=libId;
  let html='';
  store.RUBRIC.forEach(p=>{ if(!p.caps.length)return;
    html+=`<div class="ucp-pillar"><div class="ucp-plname">Pillar ${pLetter(p.key)} — ${esc(p.name)}</div>`;
    p.caps.forEach(c=>{ const checked=(item.caps||[]).includes(c.id);
      html+=`<label class="ucp-opt ${checked?'checked':''}"><input type="checkbox" data-libeditpick data-lib="${libId}" data-cap="${c.id}" ${checked?'checked':''}><span class="ucp-code">${c.id}</span><span>${esc(c.title)}</span></label>`;});
    html+='</div>';});
  html+='<div class="ucp-close"><button data-libeditpickclose>Done</button></div>';
  pop.innerHTML=html; holder.appendChild(pop);
}
export function closeLibCapPickers(){ document.querySelectorAll('.uc-cap-pop').forEach(p=>p.remove()); }
