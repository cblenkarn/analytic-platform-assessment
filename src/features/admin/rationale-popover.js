// ── Rubric Admin › SME rationale popover (verbatim port) ──────────────────
import { el, esc } from '../../ui/dom.js';
import { store } from '../../model/state.js';
import { markChanged } from '../../model/rubric.js';
import { schedulePillarSave } from '../../persistence/granular-save.js';
import { requestRender } from '../../ui/render-bus.js';

let ratPinned=null, currentRatCell=null, ratHideTimer=null;
function ratPop(){return document.getElementById('ratPop');}
function hideRat(){const p=ratPop();if(p)p.classList.remove('show');ratPinned=null;currentRatCell=null;}
function positionPop(cell){const p=ratPop();p.classList.add('show');
  const rect=cell.getBoundingClientRect();const pw=p.offsetWidth,ph=p.offsetHeight;
  let left=rect.left+rect.width/2-pw/2; left=Math.max(8,Math.min(left,innerWidth-pw-8));
  let top=rect.bottom+8; if(top+ph>innerHeight-8 && rect.top-ph-8>8) top=rect.top-ph-8;
  p.style.left=left+'px'; p.style.top=Math.max(8,top)+'px'; }
function toneLabel(t){return t==='pro'?'In favour':t==='con'?'Caveat':'Note';}

function showRatView(cell){const sid=cell.dataset.rat,pl=cell.dataset.pl,info=store.SUBIDX[sid];if(!info)return;
  const r=info.sub.rat&&info.sub.rat[pl];if(!r||!(r.note&&r.note.trim()))return;
  const plName=store.PLATFORMS.find(x=>x.id===pl).name; const yes=!!info.sub.sup[pl]; const tone=r.tone||'note';
  ratPop().innerHTML=`<div class="rp-head">${esc(plName)} · ${yes?'Supported':'Not supported'}${r.conf?' · confidence '+r.conf:''}</div>
    <div class="rp-sub">${esc(info.sub.q)}</div><span class="rp-tone ${tone}">${toneLabel(tone)}</span>
    <div class="rp-note">${esc(r.note)}</div>`;
  positionPop(cell); }

function showRatEdit(btn){const sid=btn.dataset.note,pl=btn.dataset.pl,info=store.SUBIDX[sid];if(!info)return;
  if(!info.sub.rat)info.sub.rat={}; if(!info.sub.rat[pl])info.sub.rat[pl]={note:'',tone:'note',conf:''};
  const r=info.sub.rat[pl]; const plName=store.PLATFORMS.find(x=>x.id===pl).name;
  ratPop().innerHTML=`<div class="rp-head">${esc(plName)} — SME rationale</div><div class="rp-sub">${esc(info.sub.q)}</div>
    <textarea id="rpNote" placeholder="Your point of view — where it excels or fails in practice…">${esc(r.note||'')}</textarea>
    <div class="rp-controls"><select id="rpTone"><option value="note">Note</option><option value="pro">In favour</option><option value="con">Caveat</option></select>
    <select id="rpConf"><option value="">Confidence —</option><option value="low">Low</option><option value="med">Med</option><option value="high">High</option></select></div>
    <button class="rp-close" id="rpClose">Done</button>`;
  const p=ratPop(); const ta=p.querySelector('#rpNote'),tn=p.querySelector('#rpTone'),cf=p.querySelector('#rpConf');
  tn.value=r.tone||'note'; cf.value=r.conf||'';
  ta.oninput=()=>{r.note=ta.value; markChanged(); schedulePillarSave(info.pkey);}; tn.onchange=()=>{r.tone=tn.value; markChanged(); schedulePillarSave(info.pkey);}; cf.onchange=()=>{r.conf=cf.value; markChanged(); schedulePillarSave(info.pkey);};
  p.querySelector('#rpClose').onclick=()=>{ if(!r.note||!r.note.trim()){ if(info.sub.rat[pl])delete info.sub.rat[pl]; markChanged(); schedulePillarSave(info.pkey); } hideRat(); requestRender(); };
  ratPinned='edit'; positionPop(btn.closest('td')); ta.focus(); }

export function initRationalePopover(){
  const _rp=el('<div class="rat-pop" id="ratPop"></div>'); document.body.appendChild(_rp);
  _rp.addEventListener('mouseenter',()=>clearTimeout(ratHideTimer));
  _rp.addEventListener('mouseleave',()=>{ if(ratPinned!=='edit')hideRat(); });
  window.addEventListener('scroll',()=>{ if(ratPinned!=='edit')hideRat(); },true);

  document.addEventListener('click',e=>{
    const noteBtn=e.target.closest('[data-note]'); if(noteBtn&&store.editMode){showRatEdit(noteBtn);return;}
    const ratCell=e.target.closest('[data-rat]'); if(ratCell&&!store.editMode){
      if(ratPinned==='cell'&&currentRatCell===ratCell){hideRat();} else {showRatView(ratCell);ratPinned='cell';currentRatCell=ratCell;} return;}
    if(e.target.closest('#ratPop')||e.target.closest('[data-rat]')||e.target.closest('[data-note]'))return; if(ratPinned)hideRat();
  });
  document.addEventListener('mouseover',e=>{ if(store.editMode||ratPinned)return; const c=e.target.closest('[data-rat]'); if(c){clearTimeout(ratHideTimer);showRatView(c);} });
  document.addEventListener('mouseout',e=>{ if(store.editMode||ratPinned)return; const c=e.target.closest('[data-rat]'); if(c){ratHideTimer=setTimeout(hideRat,140);} });
}
