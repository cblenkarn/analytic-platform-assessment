// ── Prioritization › MoSCoW framework (verbatim port) ─────────────────────
import { el, esc } from '../../../ui/dom.js';
import { store } from '../../../model/state.js';
import { pLetter, capPillar } from '../../../model/rubric.js';
import { useCasesForCap } from '../../../model/usecases.js';
import { capInScope } from '../../../scoring/coverage.js';

export function renderFramework(){const f=document.getElementById('framework'); if(!f)return; f.innerHTML='';
  store.RUBRIC.forEach(p=>{const collapsed=store.collapsedPillars.has(p.key);
    const pil=el(`<div class="pillar ${collapsed?'collapsed':''} ${p.retired?'pillar-retired':''}"><div class="pillar-head" data-pillar="${p.key}">
      <span class="pl-letter">${pLetter(p.key)}</span><h3>Pillar ${pLetter(p.key)} — ${esc(p.name)}${p.retired?' <span class="retired-tag">retired</span>':''}</h3>
      <span class="pl-count" data-plcount="${p.key}"></span><span class="caret">▼</span></div><div class="pillar-body"></div></div>`);
    const body=pil.querySelector('.pillar-body');
    p.caps.forEach(c=>{
      const cap=el(`<div class="cap ${c.retired?'cap-retired':''}"><div class="cap-top"><span class="cap-id">${c.id}</span>
        <div class="cap-title-wrap"><div class="cap-title">${esc(c.title)}${c.retired?' <span class="retired-tag">retired</span>':''}<span class="selcount" data-selcount="${c.id}"></span></div>
          <div class="cap-def">${esc(c.def)}</div></div>
        <div class="moscow big" data-cap="${c.id}"><button data-on="must">Must</button><button data-on="should">Should</button>
          <button data-on="could">Could</button><button data-on="wont">Won't</button></div></div>`);

      const ucs=useCasesForCap(c.id);
      const anyUC=(store.S.useCases||[]).length>0;
      if(ucs.length){
        const chips=ucs.map(u=>`<span class="cu-uc">${esc((u.title||'Untitled use case'))}</span>`).join('');
        cap.appendChild(el(`<div class="cap-usecases"><span class="cu-label">Use cases · ${ucs.length}</span><span class="cu-list">${chips}</span></div>`));
      } else if(anyUC){
        cap.appendChild(el(`<div class="cap-nouse"><span class="cu-label">No use case</span><span class="cu-hint">Nothing on the client's list rides on this capability — consider Should, Could, or Won't.</span></div>`));
      }

      if(c.subs.length){
        cap.appendChild(el(`<button class="refine-toggle" data-refine="${c.id}">Refine sub-capabilities (${c.subs.length}) <span class="rc">▾</span></button>`));
        const subWrap=el(`<div class="sub-table"><div class="sub-caption">Sub-capabilities are on by default — uncheck any you don't need</div></div>`);
        c.subs.forEach(s=>{subWrap.appendChild(el(`<div class="sub-row ${s.retired?'sub-retired':''}" data-subrow="${s.id}">
          <label class="sub-q"><input type="checkbox" data-need="${s.id}"> <span>${esc(s.q)}${s.retired?' <span class="retired-tag">retired</span>':''}</span></label></div>`));});
        cap.appendChild(subWrap);
      } else { cap.appendChild(el(`<div class="cap-empty">No sub-capabilities yet — add them on the Rubric Admin tab.</div>`)); }
      body.appendChild(cap);
    });
    f.appendChild(pil);
  });
  syncFrameworkState(); }

export function syncFrameworkState(){
  document.querySelectorAll('.moscow').forEach(m=>{const cap=m.dataset.cap;
    m.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.on===store.S.moscow[cap]));
    const cc=m.closest('.cap'); if(cc)cc.classList.toggle('oos-cap',store.S.moscow[cap]==='wont');});
  document.querySelectorAll('[data-need]').forEach(cb=>{const sid=cb.dataset.need;cb.checked=store.S.needs[sid];
    const info=store.SUBIDX[sid];
    const capOOS = info && store.S.moscow[info.cap.id]==='wont';
    const subRet = info && info.sub.retired;
    const capRet = info && info.cap.retired;
    const pilRet = info && (capPillar(info.cap)||{}).retired;
    const disabled = capOOS || subRet || capRet || pilRet;
    cb.closest('.sub-row').classList.toggle('disabled',disabled);cb.disabled=disabled;});
  store.RUBRIC.forEach(p=>{let pc=0;
    p.caps.forEach(c=>{const n=c.subs.filter(s=>!s.retired && store.S.needs[s.id]).length;if(capInScope(c))pc+=n;
      const tag=document.querySelector(`[data-selcount="${c.id}"]`);
      if(tag){ if(!capInScope(c)){tag.textContent=c.retired?'retired':'out of scope';tag.classList.remove('has');}
        else{tag.textContent=`${n}/${c.subs.length} in scope`;tag.classList.toggle('has',n>0);} }});
    const plc=document.querySelector(`[data-plcount="${p.key}"]`);if(plc)plc.textContent=pc?`${pc} in scope`:'';});}
