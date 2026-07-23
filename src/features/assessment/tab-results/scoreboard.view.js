// ── Results › weighted-fit ranking + recommended stack (verbatim port) ────
import { el, esc } from '../../../ui/dom.js';
import { compute } from '../../../scoring/fit.js';
import { anyScope } from '../../../scoring/coverage.js';
import { recommendStack } from '../../../scoring/stack.js';

export function renderScoreboard(){const rows=compute(),has=anyScope();
  const list=document.getElementById('rankList'); if(!list)return; list.innerHTML='';
  rows.forEach((r,i)=>{ const top=i===0&&has&&!r.dq;
    const sub = has?`covers ${r.metCaps} of ${r.capCount} capabilities`:r.code;
    const dq = has&&r.dq?`<div class="dq-badge">Disqualified — fails Must: ${esc(r.mustGaps.join(', '))}</div>`:'';
    list.appendChild(el(`<div class="rank ${top?'top':''} ${has&&r.dq?'dq':''}">
      <div class="pos">${String(i+1).padStart(2,'0')}</div>
      <div><div class="pname">${r.name}</div><div class="psub">${sub}</div></div>
      <div class="pct ${has&&r.dq?'dqp':''}">${has?r.fit:'—'}<span>%</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${has?r.fit:0}%"></div></div>${dq}</div>`)); });
  renderStack(rows,has); }

export function renderStack(rows,has){const card=document.getElementById('stackCard'); if(!card)return;
  if(!has){card.innerHTML=`<h3>Recommended stack</h3><div class="lead-sub">No capabilities in scope</div>
    <div class="stack-empty">Set at least one capability to Must, Should or Could on the Prioritization tab — sub-capabilities are on by default — to generate a fit score and a best-of-breed recommendation.</div>`;return;}
  const {primary,augments}=recommendStack(rows);
  let html=`<h3>Recommended stack</h3><div class="lead-sub">Best-of-breed, not binary</div>`;
  html+=`<div class="stack-row"><div class="stack-role">Lead platform</div><div class="stack-name">${primary.name}</div>
    <div class="stack-reason">Highest weighted fit (${primary.fit}%), covering ${primary.metCaps} of ${primary.capCount} in-scope capabilities. Anchor the stack here.</div></div>`;
  if(augments.length)augments.forEach(a=>html+=`<div class="stack-row"><div class="stack-role">Augment for</div><div class="stack-name">${a.name}</div>
    <div class="stack-reason">Stronger on priority capabilities the lead doesn't fully cover: ${esc(a.caps.join(', '))}.</div></div>`);
  else html+=`<div class="stack-row"><div class="stack-reason">The lead fully covers every Must and Should capability in scope — a single-platform stack is defensible.</div></div>`;
  card.innerHTML=html; }
