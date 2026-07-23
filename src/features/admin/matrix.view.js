// ── Rubric Admin › support matrix (verbatim port) ─────────────────────────
import { store } from '../../model/state.js';
import { esc } from '../../ui/dom.js';
import { pLetter } from '../../model/rubric.js';
import { active, sup, supportCount, capInScope } from '../../scoring/coverage.js';

export function updateSupportLabels(){document.querySelectorAll('[data-suplbl]').forEach(e=>{e.textContent=`${supportCount(e.dataset.suplbl)}/${active().length} support`;});}
export function hasNote(s,pl){return !!(s.rat&&s.rat[pl]&&s.rat[pl].note&&s.rat[pl].note.trim());}

export function renderMatrix(){const t=document.getElementById('mtxTable'); if(!t)return;
  const effNeededOnly=store.viewNeededOnly&&!store.editMode;
  const nCols=1+active().length+(store.editMode?1:0);
  let headRow='<tr><th class="subhead">Platform Evaluation</th>';
  active().forEach((p)=>{ if(store.editMode){
      headRow+=`<th class="plhead" data-plid="${p.id}"><div class="plh">`+
        `<span class="drag-handle" draggable="true" data-drag="${p.id}" title="Drag to reorder">⠿</span>`+
        `<span contenteditable="true" data-plcode="${p.id}">${esc(p.code)}</span>`+
        `<button class="plretire" data-plretire="${p.id}" title="Retire — keeps all data, removes from scoring">retire</button>`+
        (store.adminDelete?`<button class="plretire pldelete" data-pldelete="${p.id}" title="Delete vendor permanently">delete</button>`:'')+
        `</div></th>`;
    } else headRow+=`<th>${esc(p.code)}</th>`; });
  if(store.editMode)headRow+='<th class="actcol"></th>'; headRow+='</tr>';

  let html='';
  store.RUBRIC.forEach(p=>{
    const pillarHasRows=p.caps.some(c=>c.subs.some(s=>!effNeededOnly||store.S.needs[s.id]));
    if(!pillarHasRows&&!store.editMode)return;
    const pRetireLabel=p.retired?'Unretire pillar':'Retire pillar';
    const pDragHandle=store.editMode?`<span class="drag-handle pillar-drag" draggable="true" data-pdrag="${p.key}" title="Drag to reorder this pillar">⠿</span> `:'';
    const pedit=store.editMode?`<span class="pname" contenteditable="true" data-pname="${p.key}">${esc(p.name)}</span>
      <button class="ed-btn" data-addcap="${p.key}">+ Capability</button><button class="ed-btn" data-retirepillar="${p.key}">${pRetireLabel}</button>${store.adminDelete?`<button class="ed-btn danger" data-delpillar="${p.key}">Delete</button>`:''}${p.retired?'<span class="retired-tag on-dark">retired</span>':''}`
      :esc(p.name)+(p.retired?' <span class="retired-tag on-dark">retired</span>':'');
    let body=`<tr class="pillar-band ${p.retired?'retired':''}"><td colspan="${nCols}">${pDragHandle}Pillar ${pLetter(p.key)} — ${pedit}</td></tr>`;
    p.caps.forEach(c=>{
      const subsShown=c.subs.filter(s=>!effNeededOnly||store.S.needs[s.id]);
      if(!subsShown.length&&!store.editMode)return;
      const pr=store.S.moscow[c.id]; const inScope=capInScope(c);
      const cRetireLabel=c.retired?'Unretire capability':'Retire capability';
      const cedit=`<span contenteditable="true" data-ctitle="${c.id}">${esc(c.title)}</span>
        <button class="ed-btn" data-addrow="${c.id}">+ Add</button><button class="ed-btn" data-retirecap="${c.id}">${cRetireLabel}</button>${store.adminDelete?`<button class="ed-btn danger" data-delcap="${c.id}">Delete</button>`:''}${c.retired?'<span class="retired-tag">retired</span>':''}
        <div class="cap-def-edit"><span class="cdef-lbl">Definition</span><span class="cdef-text" contenteditable="true" data-cdef="${c.id}" data-placeholder="Shown to consultants on the Prioritization tab — describe what this capability covers">${esc(c.def||'')}</span></div>`;
      body+=`<tr class="cap-band ${c.retired?'retired':''}"><td colspan="${nCols}"><span class="cc">${c.id}</span>${cedit}</td></tr>`;
      subsShown.forEach(s=>{
        const needed=inScope&&store.S.needs[s.id]&&!s.retired;
        // Only show the scope-highlight colour in the read-only view. In edit mode it makes
        // newly-added rows (which always start needs=true) look distinctly coloured next to
        // older rows a consultant has since unchecked — same colour for every row while editing.
        const showNeeded=needed&&!store.editMode;
        body+=`<tr class="${showNeeded?'needed':''} ${!inScope?'flat':''} ${s.retired?'sub-retired':''}" data-subrow-id="${s.id}" data-subrow-cap="${c.id}">`;
        const subHandle = store.editMode
          ? `<span class="sub-drag-handle" draggable="true" data-subdrag="${s.id}" title="Drag to move this sub-capability">⠿</span>`
          : '';
        body+=`<td class="sub-lbl ${!inScope?'oos':''}">` + subHandle + `<span class="qtext" data-sublbl="${s.id}" ${store.editMode?'contenteditable="true"':''}>${esc(s.q)}</span>${s.retired?' <span class="retired-tag">retired</span>':''}</td>`;
        active().forEach(pl=>{const yes=sup(s.id,pl.id);const note=hasNote(s,pl.id);
          const tone=note?((s.rat[pl.id].tone)||'note'):'';
          if(store.editMode){const mark=yes?`<span class="ck tog-on">✓</span>`:`<span class="ck tog-off">–</span>`;
            body+=`<td class="mk editable" data-tog="${s.id}" data-pl="${pl.id}">${mark}<button class="noteglyph ${note?'has tone-'+tone:''}" data-note="${s.id}" data-pl="${pl.id}" title="SME rationale">✎</button></td>`;}
          else{let mark; if(yes)mark=needed?`<span class="ck point">✓</span>`:`<span class="ck on">✓</span>`;
            else if(needed)mark=pr==='must'?`<span class="ck gap must">✕</span>`:`<span class="ck gap">✕</span>`;
            else mark=`<span class="ck off">–</span>`;
            body+=`<td class="mk ${note?'hasnote':''}" ${note?`data-rat="${s.id}" data-pl="${pl.id}"`:''}>${mark}</td>`;}});
        if(store.editMode){const sRetireLabel=s.retired?'Unretire':'Retire';
          body+=`<td class="act"><div class="act-btns"><button class="row-retire" data-retirerow="${s.id}" title="${sRetireLabel} sub-capability">${sRetireLabel}</button>${store.adminDelete?`<button class="row-retire danger" data-delrow="${s.id}" title="Delete sub-capability permanently">Delete</button>`:''}</div></td>`;}
        body+='</tr>';
      });
    });
    html+=`<section class="pillar-card ${p.retired?'pillar-retired':''}" data-pcard="${p.key}"><table class="mtx"><thead>${headRow}</thead><tbody>${body}</tbody></table></section>`;
  });
  if(!html)html=`<section class="pillar-card"><table class="mtx"><thead>${headRow}</thead><tbody><tr><td class="sub-lbl" colspan="${nCols}" style="padding:20px 16px;text-align:center;">No rows yet — add a pillar, capability or row.</td></tr></tbody></table></section>`;
  t.innerHTML=html;
  if(store.pendingFocus){const c=t.querySelector(store.pendingFocus);
    if(c){c.focus();const r=document.createRange();r.selectNodeContents(c);const sel=getSelection();sel.removeAllRanges();sel.addRange(r);}
    store.pendingFocus=null;}}

export function renderRetired(){const bar=document.getElementById('retiredBar'); if(!bar) return;
  const r=store.PLATFORMS.filter(p=>p.retired);
  if(!r.length){bar.innerHTML='';bar.style.display='none';return;}
  bar.style.display='flex';
  bar.innerHTML='<span class="rb-label">Retired \u00b7 data kept, not scored</span>'+
    r.map(p=>`<span class="retired-chip"><b>${esc(p.name)}</b><button data-plrestore="${p.id}">Restore</button></span>`).join('');}