// ── Results › platform profiles (verbatim port, incl. capProfile/pickNote) ─
import { el, esc } from '../../../ui/dom.js';
import { store } from '../../../model/state.js';
import { PROS, CONS } from '../../../data/profiles.js';
import { active, capInScope, onSubs, coverage, anyScope } from '../../../scoring/coverage.js';
import { compute } from '../../../scoring/fit.js';

function capProfile(plId){
  const strengths=[],gaps=[]; const order={must:0,should:1};
  store.RUBRIC.forEach(p=>p.caps.forEach(c=>{ if(!capInScope(c))return; const pr=store.S.moscow[c.id];
    if(pr!=='must'&&pr!=='should')return; const on=onSubs(c); if(!on.length)return;
    const cv=coverage(plId,c,on);
    const notes=on.map(s=>s.rat&&s.rat[plId]).filter(r=>r&&r.note&&r.note.trim());
    const item={title:c.title,pr,cov:cv.cov,sup:cv.sup,on:cv.on,notes};
    if(cv.cov>=0.999)strengths.push(item); else gaps.push(item); }));
  strengths.sort((a,b)=>order[a.pr]-order[b.pr]||b.cov-a.cov);
  gaps.sort((a,b)=>order[a.pr]-order[b.pr]||a.cov-b.cov);
  return {strengths,gaps};
}
function pickNote(notes,pref){ if(!notes.length)return null; return notes.find(n=>n.tone===pref)||notes[0]; }

export function renderProfiles(){const wrap=document.getElementById('profiles'); if(!wrap)return; wrap.innerHTML='';
  const has=anyScope(); const rows=compute();
  rows.forEach((r,i)=>{
    const card=el(`<div class="pcard ${has&&r.dq?'dq':''}"></div>`);
    const rank=has?`<span class="prank">${String(i+1).padStart(2,'0')}</span>`:'';
    const fit=has?`<span class="pfit">${r.fit}%</span>`:'';
    card.appendChild(el(`<h3>${rank}<span>${esc(r.name)}</span>${fit}</h3>`));
    if(has&&r.dq)card.appendChild(el(`<div class="pdq">Disqualified — fails Must: ${esc(r.mustGaps.join(', '))}</div>`));
    if(has){
      const {strengths,gaps}=capProfile(r.id);
      const sb=el(`<div class="pc-block"><div class="pc-label pro">Strengths · priorities it meets</div></div>`);
      if(strengths.length){ strengths.slice(0,6).forEach(it=>{
          sb.appendChild(el(`<div class="pc-cap"><span class="pc-tick s">✓</span><span>${esc(it.title)} <span class="chip ${it.pr}">${it.pr}</span></span></div>`));
          const nt=pickNote(it.notes,'pro'); if(nt)sb.appendChild(el(`<div class="pc-note">“${esc(nt.note)}”</div>`)); });
        if(strengths.length>6)sb.appendChild(el(`<div class="pc-more">+ ${strengths.length-6} more priority capabilities fully covered</div>`));
      } else sb.appendChild(el(`<div class="pc-empty">No Must or Should priorities fully covered.</div>`));
      card.appendChild(sb);
      const gb=el(`<div class="pc-block"><div class="pc-label con">Gaps &amp; watch-outs</div></div>`);
      if(gaps.length){ gaps.slice(0,6).forEach(it=>{
          const zero=it.sup===0; const tick=zero?'✕':'◑'; const cls=zero?'gap':'partial';
          const tag=zero?(it.pr==='must'?' — not covered (disqualifies)':' — not covered'):` — covers ${it.sup} of ${it.on}`;
          gb.appendChild(el(`<div class="pc-cap"><span class="pc-tick ${cls}">${tick}</span><span>${esc(it.title)} <span class="chip ${it.pr}">${it.pr}</span><span class="pc-sub">${tag}</span></span></div>`));
          const nt=pickNote(it.notes,'con'); if(nt)gb.appendChild(el(`<div class="pc-note">“${esc(nt.note)}”</div>`)); });
        if(gaps.length>6)gb.appendChild(el(`<div class="pc-more">+ ${gaps.length-6} more</div>`));
      } else gb.appendChild(el(`<div class="pc-empty">Meets every Must and Should priority in scope.</div>`));
      card.appendChild(gb);
    }
    const ref=el(`<details class="pc-ref"${has?'':' open'}><summary>General profile</summary></details>`);
    (PROS[r.id]||[]).forEach(tx=>ref.appendChild(el(`<div class="pc-text"><span class="b">+</span><span>${tx}</span></div>`)));
    (CONS[r.id]||[]).forEach(tx=>ref.appendChild(el(`<div class="pc-text con"><span class="b">–</span><span>${tx}</span></div>`)));
    card.appendChild(ref);
    wrap.appendChild(card);
  });
}
