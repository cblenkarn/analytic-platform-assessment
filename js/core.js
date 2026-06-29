// ============ PLATFORMS (display order is reorderable; vendors can be added on the Rubric Admin tab) ============
const _DEFAULT_PLATFORMS = [
  {id:'ga4',name:'Google Analytics 4',code:'GA4'},
  {id:'aa',name:'Adobe Analytics',code:'AA'},
  {id:'cja',name:'Customer Journey Analytics',code:'CJA'},
  {id:'amp',name:'Amplitude',code:'AMP'},
  {id:'cs',name:'Contentsquare',code:'CS'},
  {id:'piano',name:'Piano Analytics',code:'PIANO'},
];
let PLATFORMS = _DEFAULT_PLATFORMS.map(p=>({...p}));
// the order the seed support arrays (s:[...]) below were authored in — keeps seeding correct no matter the display order
const SEED_ORDER = ['ga4','aa','piano','cja','amp','cs'];
const MOSCOW_W = {must:3, should:2, could:1, wont:0};

// Opinionated rubric. Each sub-capability is a specific, discriminating claim; s = our POV per
// platform in the order [ga4, aa, piano, cja, amp, cs]. Seeded from the engagement assessments.
const SEED = [
  {letter:'A', name:'Data Collection Architecture & Engineering', caps:[
    {id:'C1', title:'Cross-platform Collection & Schema Control', def:'Captures web, app and server-side under one flexible, governed schema rather than a rigid predefined taxonomy.', subs:[
      {id:'C1a', q:'Fully customizable event schema, not a fixed taxonomy (no eVar/prop-style constraints)', s:[1,0,1,1,1,0]},
      {id:'C1b', q:'Server-side / Measurement Protocol ingestion for first-party data durability', s:[1,1,1,1,1,0]},
      {id:'C1c', q:'Built-in schema governance / data dictionary to stop tag drift across teams', s:[0,1,1,1,1,0]},
    ]},
    {id:'C2', title:'Auto-capture (Codeless Collection)', def:'Captures front-end interactions with no upfront tagging, so events can be defined retroactively — trading schema discipline for speed.', subs:[
      {id:'C2a', q:'Auto-captures clicks and views with zero upfront tagging', s:[0,0,0,0,1,1]},
      {id:'C2b', q:'Define new events retroactively against historical auto-captured data', s:[0,0,0,0,1,1]},
    ]},
    {id:'C3', title:'Identity Resolution & Cross-device Stitching', def:'Unifies anonymous and known activity into one durable profile — strongest where built on a dedicated identity graph.', subs:[
      {id:'C3a', q:'Deterministic cross-device stitching on a persistent identity graph', s:[1,1,1,1,1,0]},
      {id:'C3b', q:'Retroactively binds prior anonymous sessions to the user on login', s:[0,0,0,1,1,0]},
    ]},
    {id:'C4', title:'Implementation & Migration Effort', def:'How fast it deploys via the existing TMS and how much re-modeling it forces on a team already running GA4 / GTM.', subs:[
      {id:'C4a', q:'Low migration effort from an existing GA4/GTM setup (similar data model)', s:[1,0,1,0,1,1]},
      {id:'C4b', q:'Lightweight footprint — minimal Core Web Vitals / performance impact', s:[1,0,1,0,1,1]},
    ]},
  ]},
  {letter:'B', name:'Core Analytics & Behavioral Insights', caps:[
    {id:'C5', title:'In-platform Analytical Depth', def:'Whether a senior analyst can answer the why inside the UI, or has to export to a warehouse first. The clearest GA4 pain point.', subs:[
      {id:'C5a', q:'Robust ad-hoc exploration in-UI without exporting to a warehouse', s:[0,1,1,1,1,1]},
      {id:'C5b', q:'Free-form drag-and-drop exploratory workspace (Analysis Workspace-class)', s:[0,1,0,1,1,1]},
      {id:'C5c', q:'Familiar to UA-trained analysts — low retraining curve', s:[1,0,1,0,0,0]},
    ]},
    {id:'C6', title:'Funnel, Path & Session Analysis', def:'Reconstructs journeys and drop-off, with qualitative replay where the quantitative signal needs explaining.', subs:[
      {id:'C6a', q:'Retroactive ordered/unordered funnels on historical data', s:[0,1,1,1,1,1]},
      {id:'C6b', q:'Native session replay / heatmaps tied to the quantitative drop-off', s:[0,0,0,0,0,1]},
      {id:'C6c', q:'Open-ended pathing that surfaces unexpected detours (not just predefined funnels)', s:[0,1,0,1,1,0]},
    ]},
    {id:'C7', title:'Cohort & Retention Analysis', def:'Behavioral segmentation and lifecycle value — the product-analytics core, where Amplitude-class tools lead.', subs:[
      {id:'C7a', q:'Complex behavioral cohorts — did X but not Y within N days', s:[0,1,0,1,1,0]},
      {id:'C7b', q:'N-day, unbounded and rolling retention curves out of the box', s:[0,0,0,1,1,0]},
    ]},
    {id:'C8', title:'In-platform ML / AI', def:'Native intelligence layered on the behavioral data — predictive, anomaly and assisted analysis, not nice-to-have dashboards.', subs:[
      {id:'C8a', q:'Anomaly detection / contribution analysis on key metrics', s:[1,1,0,1,1,1]},
      {id:'C8b', q:'Predictive metrics & audiences out of the box (churn / purchase propensity)', s:[1,0,0,0,1,0]},
      {id:'C8c', q:'Natural-language querying / AI assistant (e.g., Ask Amplitude, Adobe AI Assistant)', s:[0,1,0,0,1,0]},
    ]},
  ]},
  {letter:'C', name:'Ecosystem & Activation', caps:[
    {id:'C9', title:'Google Marketing Platform Integration', def:'Real two-way value with the Google stack. In practice only GA4 clears the bar for activation, not just import.', subs:[
      {id:'C9a', q:'Reliable audience export/activation to Google Ads for bidding (not just import)', s:[1,0,0,0,0,0]},
      {id:'C9b', q:'Native Google Search Console / GMP reporting integration', s:[1,0,0,0,0,0]},
    ]},
    {id:'C10', title:'Third-party Integrations & Activation', def:'Breadth and ease of connectors to CDP, CRM, email and non-Google suites — and how much developer effort each takes.', subs:[
      {id:'C10a', q:'Large library of point-and-click activation / destination connectors', s:[0,0,1,1,1,1]},
      {id:'C10b', q:'Native reverse-ETL / audience activation to CRM & CDP', s:[0,0,0,1,1,0]},
    ]},
    {id:'C11', title:'A/B Testing & Personalization', def:'Whether experimentation lives natively in the platform, or requires buying and wiring a separate tool (Optimizely, VWO, AB Tasty).', subs:[
      {id:'C11a', q:'Native experimentation / personalization engine — no separate purchase', s:[0,1,0,0,1,0]},
      {id:'C11b', q:'Target live variants directly by behavioral cohort from the analytics', s:[0,1,0,0,1,0]},
    ]},
    {id:'C12', title:'Warehousing & BI Reporting', def:'Getting raw, unsampled event data into the warehouse and trusted BI dashboards without row caps.', subs:[
      {id:'C12a', q:'Raw, unsampled, event-level export (no row or calculation caps)', s:[1,1,1,1,1,0]},
      {id:'C12b', q:'Native connectors to BigQuery / Snowflake / Databricks', s:[1,0,1,1,1,0]},
      {id:'C12c', q:'Direct reporting integration with BI tools (Tableau, Power BI)', s:[1,1,1,1,1,0]},
    ]},
  ]},
  {letter:'D', name:'Operations, Governance & Commercials', caps:[
    {id:'C13', title:'Data Privacy, Consent & Governance', def:'Fitness for a consent-driven, privacy-sensitive, potentially PHI-adjacent environment.', subs:[
      {id:'C13a', q:'Will sign a BAA / supports PHI under HIPAA', s:[0,0,1,0,1,0]},
      {id:'C13b', q:'Guaranteed regional data residency (e.g., EU storage)', s:[0,1,1,1,1,0]},
      {id:'C13c', q:'Native OneTrust consent integration + Consent Mode v2 / server-side enforcement', s:[1,1,1,1,1,0]},
      {id:'C13d', q:'Granular, country/region-level governance controls', s:[1,1,1,1,1,0]},
    ]},
    {id:'C14', title:'Reliability, Stability & Maintenance', def:'Whether it stays accurate and low-touch, or taxes engineering with breaking changes and re-tagging.', subs:[
      {id:'C14a', q:'Strong uptime track record / contractual SLA', s:[0,1,1,1,1,1]},
      {id:'C14b', q:'Low frequency of schema-breaking platform changes / forced re-tagging', s:[0,1,1,1,1,1]},
    ]},
    {id:'C15', title:'Pricing & Commercial Model', def:'Predictability and exposure to volume-driven cost spikes — the live concern with usage-based models.', subs:[
      {id:'C15a', q:'Predictable pricing not driven by fluctuating event / MTU volume', s:[0,0,1,0,0,1]},
      {id:'C15b', q:'Full-featured free / sandbox tier for development', s:[1,0,0,0,1,0]},
    ]},
  ]},
];

const PROS = {
  ga4:['Free tier + native BigQuery export — strongest cost-to-value','Only platform with reliable audience activation to Google Ads','Ubiquitous skills base; GTM-native, lowest implementation lift'],
  aa:['Analysis Workspace is best-in-class for ad-hoc analysis','Native Adobe Target for experimentation & personalization','Mature Attribution IQ and enterprise governance'],
  piano:['UA-like UI — minimal retraining for existing teams','Privacy-first: EU residency, HIPAA, will sign a BAA','Solid in-platform analysis without a warehouse'],
  cja:['Cross-channel identity stitching on AEP','Workspace-grade analysis over a full data lake','Ingests any online/offline schema'],
  amp:['Best-in-class cohort, retention, funnel and pathing','Native experimentation — rare among analytics tools','Broad activation ecosystem; BAA + EU data centers'],
  cs:['Best-in-class session replay, heatmaps and zoning','Auto-capture removes the tagging backlog','Auto-generated experience / frustration insights'],
};
const CONS = {
  ga4:['In-platform analysis is limiting — real analysis needs BigQuery','Will not sign a BAA — unfit for PHI / regulated data','Usage-based pricing and frequent platform churn'],
  aa:['Rigid eVar/prop model — higher migration effort from GA4','No native autocapture; steeper analyst learning curve','Expensive, variable commercial model'],
  piano:['Lighter on experimentation (Composer is paywall-focused)','Smaller activation ecosystem than Google / Adobe','Weaker predictive / ML tooling'],
  cja:['Premium AEP-based total cost of ownership','No native autocapture or experimentation','Implementation depends on AEP data engineering'],
  amp:['Event-volume pricing can spike at scale','Google-stack integration not comparable to GA4','Not a session-replay or compliance-first platform'],
  cs:['Weak cross-device identity and attribution','No raw warehouse export pipeline','Screen recording raises privacy questions'],
};

// ============ MUTABLE RUBRIC + STATE ============
let RUBRIC, S, SUBIDX={}, subCounter=0, capCounter=15, pillarCounter=0, vendorCounter=0, dragId=null;
let editMode=true, viewNeededOnly=false, pendingFocus=null;
const collapsedPillars=new Set();

// --- seeded SME rationale: subId -> { platformId: {note, tone(pro|con|note), conf(low|med|high)} } ---
const RAT = {
  C1a:{aa:{note:'Historically rigid eVar/prop model constrains free-form schema design.',tone:'con',conf:'med'}},
  C2a:{cs:{note:'Auto-capture removes the tagging backlog entirely.',tone:'pro',conf:'high'},amp:{note:'Autocapture plus the ability to define events retroactively.',tone:'pro'}},
  C5a:{ga4:{note:'Reports and Explore are limited; real analysis means exporting to BigQuery first.',tone:'con',conf:'high'}},
  C5b:{aa:{note:'Analysis Workspace is best-in-class for free-form, drag-and-drop analysis.',tone:'pro',conf:'high'},amp:{note:'Comparable exploratory depth for product analytics.',tone:'pro'}},
  C5c:{piano:{note:'If you liked the Universal Analytics UI, you will like Piano — minimal retraining.',tone:'pro',conf:'high'}},
  C6b:{cs:{note:'Best-in-class session replay, heatmaps and zoning tied to the quantitative drop-off.',tone:'pro',conf:'high'}},
  C8b:{amp:{note:'Predictive churn / conversion propensity available out of the box.',tone:'pro'},ga4:{note:'Native predictive metrics and predictive audiences.',tone:'pro'}},
  C9a:{ga4:{note:'Only GA4 reliably activates audiences to Google Ads for bidding.',tone:'pro',conf:'high'},aa:{note:'Can push to GMP but subject to match-rate limits — not reliable for bidding.',tone:'con'},amp:{note:'GMP push exists but is match-rate limited.',tone:'con'}},
  C11a:{aa:{note:'Adobe Target integrates natively and is considered best-in-class.',tone:'pro',conf:'high'},amp:{note:'Native experimentation — rare among analytics platforms.',tone:'pro',conf:'high'},ga4:{note:'Requires buying and wiring a separate tool (Optimizely, VWO, AB Tasty).',tone:'con'}},
  C12a:{cs:{note:'No raw, unsampled warehouse export pipeline.',tone:'con'}},
  C13a:{ga4:{note:'Will not sign a BAA; cannot receive PHI — disqualifying for regulated health data.',tone:'con',conf:'high'},piano:{note:'HIPAA compliant and will sign a BAA.',tone:'pro',conf:'high'},amp:{note:'Will sign BAAs as needed; EU data centers in Frankfurt.',tone:'pro'}},
  C15a:{aa:{note:'Variable, usage-based pricing tends to run expensive.',tone:'con'},ga4:{note:'Usage-based, but exposure is mitigable with an upfront commitment.',tone:'note'}},
};
function cloneRat(sid){const src=RAT[sid];const out={};if(src)Object.keys(src).forEach(pl=>{out[pl]={note:src[pl].note||'',tone:src[pl].tone||'note',conf:src[pl].conf||''};});return out;}
function buildRubric(){
  return SEED.map((p,i)=>({key:String.fromCharCode(65+i), name:p.name, caps:p.caps.map(c=>({
    id:c.id, title:c.title, def:c.def, subs:c.subs.map(s=>{
      const sup={}; SEED_ORDER.forEach((pid,j)=>sup[pid]=!!(s.s&&s.s[j])); return {id:s.id, q:s.q, sup, rat:cloneRat(s.id)};
    })
  }))}));
}
function normalizeRubric(){
  RUBRIC.forEach((p)=>{ if(!p.key)p.key='P'+(++pillarCounter); if(!p.caps)p.caps=[];
    p.caps.forEach(c=>{ if(!c.subs)c.subs=[]; c.subs.forEach(s=>{ if(!s.sup)s.sup={}; PLATFORMS.forEach(pl=>{if(typeof s.sup[pl.id]!=='boolean')s.sup[pl.id]=false;}); if(!s.rat)s.rat={}; }); });
  });
}
function reindex(){ SUBIDX={};
  RUBRIC.forEach(p=>p.caps.forEach(c=>c.subs.forEach(s=>{SUBIDX[s.id]={sub:s,cap:c,pkey:p.key};}))); }
function defaultState(){ const moscow={}, needs={};
  RUBRIC.forEach(p=>p.caps.forEach(c=>{moscow[c.id]='should';c.subs.forEach(s=>needs[s.id]=true);})); return {moscow,needs}; }
function findCap(id){let r=null;RUBRIC.forEach(p=>p.caps.forEach(c=>{if(c.id===id)r=c;}));return r;}
function findPillar(key){return RUBRIC.find(p=>p.key===key);}
function pIndex(key){return RUBRIC.findIndex(p=>p.key===key);}
function pLetter(key){const i=pIndex(key);return i>=0?String.fromCharCode(65+i):'?';}

// ============ COMPUTE (coverage model) ============
function active(){return PLATFORMS.filter(p=>!p.retired);}
function sup(subId,plId){return !!(SUBIDX[subId] && SUBIDX[subId].sub.sup[plId]);}
function supportCount(subId){return active().filter(pl=>sup(subId,pl.id)).length;}
function capInScope(c){return S.moscow[c.id]!=='wont';}
function onSubs(c){return c.subs.filter(s=>S.needs[s.id]);}
function scopedCaps(){const out=[];RUBRIC.forEach(p=>p.caps.forEach(c=>{if(capInScope(c)){const on=onSubs(c);if(on.length)out.push({c,p,on,w:MOSCOW_W[S.moscow[c.id]]});}}));return out;}
function anyScope(){return scopedCaps().length>0;}
function coverage(plId,c,on){on=on||onSubs(c);if(!on.length)return {sup:0,on:0,cov:0};const s=on.filter(x=>!!x.sup[plId]).length;return {sup:s,on:on.length,cov:s/on.length};}
function compute(){
  const caps=scopedCaps(); const wsum=caps.reduce((a,x)=>a+x.w,0);
  return active().map(pl=>{ let acc=0,metCaps=0; const mustGaps=[];
    caps.forEach(({c,on,w})=>{ const cv=coverage(pl.id,c,on); acc+=w*cv.cov; if(cv.sup>0)metCaps++;
      if(S.moscow[c.id]==='must'&&cv.sup===0)mustGaps.push(c.title); });
    return {...pl, fit: wsum?Math.round(100*acc/wsum):0, capCount:caps.length, metCaps, mustGaps, dq:mustGaps.length>0}; })
    .sort((a,b)=> (a.dq?1:0)-(b.dq?1:0) || b.fit-a.fit || b.metCaps-a.metCaps );
}
function pillarAgg(){const out={};
  RUBRIC.forEach(p=>{const caps=p.caps.filter(c=>capInScope(c)&&onSubs(c).length);const wsum=caps.reduce((a,c)=>a+MOSCOW_W[S.moscow[c.id]],0);
    out[p.key]={inScope:caps.length>0};
    active().forEach(pl=>{ if(!caps.length){out[p.key][pl.id]=null;return;}
      let acc=0;caps.forEach(c=>{acc+=MOSCOW_W[S.moscow[c.id]]*coverage(pl.id,c).cov;});
      out[p.key][pl.id]=wsum?Math.round(100*acc/wsum):0; }); });
  return out; }
function recommendStack(rows){
  const qual=rows.filter(r=>!r.dq); const pool=qual.length?qual:rows; const primary=pool[0];
  if(!primary)return{primary:null,augments:[]};
  const gaps=[]; RUBRIC.forEach(p=>p.caps.forEach(c=>{ if(!capInScope(c))return; const on=onSubs(c); if(!on.length)return;
    const pr=S.moscow[c.id]; if(pr!=='must'&&pr!=='should')return; const cv=coverage(primary.id,c,on);
    if(cv.cov<1)gaps.push({c,on,leadCov:cv.cov}); }));
  const aug={};
  gaps.forEach(g=>{ let best=null; rows.forEach(r=>{ if(r.id===primary.id)return; const cv=coverage(r.id,g.c,g.on);
      if(cv.cov>g.leadCov+1e-9 && (!best||cv.cov>best.cov)) best={id:r.id,cov:cv.cov}; });
    if(best){ aug[best.id]=aug[best.id]||{caps:[],gain:0}; aug[best.id].caps.push(g.c.title); aug[best.id].gain+=(best.cov-g.leadCov); } });
  const augments=Object.entries(aug).map(([id,v])=>({...PLATFORMS.find(p=>p.id===id),caps:v.caps,gain:v.gain}))
    .sort((a,b)=>b.caps.length-a.caps.length||b.gain-a.gain).slice(0,2);
  return {primary,augments};
}

// ============ RENDER ============
function el(html){const t=document.createElement('template');t.innerHTML=html.trim();return t.content.firstChild;}
function esc(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function renderScoreboard(){const rows=compute(),has=anyScope();
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
function renderStack(rows,has){const card=document.getElementById('stackCard'); if(!card)return;
  if(!has){card.innerHTML=`<h3>Recommended stack</h3><div class="lead-sub">No capabilities in scope</div>
    <div class="stack-empty">Set at least one capability to Must, Should or Could in section 04 — sub-capabilities are on by default — to generate a fit score and a best-of-breed recommendation.</div>`;return;}
  const {primary,augments}=recommendStack(rows);
  let html=`<h3>Recommended stack</h3><div class="lead-sub">Best-of-breed, not binary</div>`;
  html+=`<div class="stack-row"><div class="stack-role">Lead platform</div><div class="stack-name">${primary.name}</div>
    <div class="stack-reason">Highest weighted fit (${primary.fit}%), covering ${primary.metCaps} of ${primary.capCount} in-scope capabilities. Anchor the stack here.</div></div>`;
  if(augments.length)augments.forEach(a=>html+=`<div class="stack-row"><div class="stack-role">Augment for</div><div class="stack-name">${a.name}</div>
    <div class="stack-reason">Stronger on priority capabilities the lead doesn't fully cover: ${esc(a.caps.join(', '))}.</div></div>`);
  else html+=`<div class="stack-row"><div class="stack-reason">The lead fully covers every Must and Should capability in scope — a single-platform stack is defensible.</div></div>`;
  card.innerHTML=html; }
function renderAgg(){const agg=pillarAgg(),rows=compute(),has=anyScope();
  const t=document.getElementById('aggTable'); if(!t)return;
  let head='<thead><tr><th class="lbl">Pillar</th>';active().forEach(p=>head+=`<th>${p.code}</th>`);head+='</tr></thead>';
  let body='<tbody>';
  RUBRIC.forEach(p=>{const row=agg[p.key];let lead=-1;
    if(row.inScope)active().forEach(pl=>{if(row[pl.id]>lead)lead=row[pl.id];});
    body+=`<tr><td class="lbl"><span class="pl-letter">${pLetter(p.key)}</span><b>${esc(p.name)}</b></td>`;
    active().forEach(pl=>{ if(!row.inScope){body+=`<td class="cov"><span class="cell-na">— out of scope</span></td>`;}
      else{const v=row[pl.id];const isLead=v===lead&&lead>0;
        body+=`<td class="cov ${isLead?'leader':''}"><div class="cell-cov"><span class="n">${v}%</span><span class="mini"><i style="width:${v}%"></i></span></div></td>`;}});
    body+='</tr>';});
  body+='</tbody>';
  let foot='<tbody><tr class="total"><td class="lbl">Weighted fit</td>';
  active().forEach(pl=>{const r=rows.find(x=>x.id===pl.id);
    foot+= has?`<td class="cov"><div class="cell-cov"><span class="n">${r.dq?'✕ ':''}${r.fit}%</span><span class="mini"><i style="width:${r.fit}%"></i></span></div></td>`:`<td class="cov"><span class="cell-na">—</span></td>`;});
  foot+='</tr></tbody>'; t.innerHTML=head+body+foot; }
function renderFramework(){const f=document.getElementById('framework'); if(!f)return; f.innerHTML='';
  RUBRIC.forEach(p=>{const collapsed=collapsedPillars.has(p.key);
    const pil=el(`<div class="pillar ${collapsed?'collapsed':''}"><div class="pillar-head" data-pillar="${p.key}">
      <span class="pl-letter">${pLetter(p.key)}</span><h3>Pillar ${pLetter(p.key)} — ${esc(p.name)}</h3>
      <span class="pl-count" data-plcount="${p.key}"></span><span class="caret">▼</span></div><div class="pillar-body"></div></div>`);
    const body=pil.querySelector('.pillar-body');
    p.caps.forEach(c=>{
      const cap=el(`<div class="cap"><div class="cap-top"><span class="cap-id">${c.id}</span>
        <div class="cap-title-wrap"><div class="cap-title">${esc(c.title)}<span class="selcount" data-selcount="${c.id}"></span></div>
          <div class="cap-def">${esc(c.def)}</div></div>
        <div class="moscow big" data-cap="${c.id}"><button data-on="must">Must</button><button data-on="should">Should</button>
          <button data-on="could">Could</button><button data-on="wont">Won't</button></div></div>`);
      if(c.subs.length){
        cap.appendChild(el(`<button class="refine-toggle" data-refine="${c.id}">Refine sub-capabilities (${c.subs.length}) <span class="rc">▾</span></button>`));
        const subWrap=el(`<div class="sub-table"><div class="sub-caption">Sub-capabilities are on by default — uncheck any you don't need</div></div>`);
        c.subs.forEach(s=>{subWrap.appendChild(el(`<div class="sub-row" data-subrow="${s.id}">
          <label class="sub-q"><input type="checkbox" data-need="${s.id}"> <span>${esc(s.q)}</span></label></div>`));});
        cap.appendChild(subWrap);
      } else { cap.appendChild(el(`<div class="cap-empty">No sub-capabilities yet — add them on the Rubric Admin tab.</div>`)); }
      body.appendChild(cap);
    });
    f.appendChild(pil);
  });
  syncFrameworkState(); }
function syncFrameworkState(){
  document.querySelectorAll('.moscow').forEach(m=>{const cap=m.dataset.cap;
    m.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.on===S.moscow[cap]));
    const cc=m.closest('.cap'); if(cc)cc.classList.toggle('oos-cap',S.moscow[cap]==='wont');});
  document.querySelectorAll('[data-need]').forEach(cb=>{const sid=cb.dataset.need;cb.checked=S.needs[sid];
    const info=SUBIDX[sid];const disabled=info&&S.moscow[info.cap.id]==='wont';
    cb.closest('.sub-row').classList.toggle('disabled',disabled);cb.disabled=disabled;});
  RUBRIC.forEach(p=>{let pc=0;
    p.caps.forEach(c=>{const n=c.subs.filter(s=>S.needs[s.id]).length;if(capInScope(c))pc+=n;
      const tag=document.querySelector(`[data-selcount="${c.id}"]`);
      if(tag){ if(!capInScope(c)){tag.textContent='out of scope';tag.classList.remove('has');}
        else{tag.textContent=`${n}/${c.subs.length} in scope`;tag.classList.toggle('has',n>0);} }});
    const plc=document.querySelector(`[data-plcount="${p.key}"]`);if(plc)plc.textContent=pc?`${pc} in scope`:'';});}
function updateSupportLabels(){document.querySelectorAll('[data-suplbl]').forEach(e=>{e.textContent=`${supportCount(e.dataset.suplbl)}/${active().length} support`;});}
function hasNote(s,pl){return !!(s.rat&&s.rat[pl]&&s.rat[pl].note&&s.rat[pl].note.trim());}
function renderMatrix(){const t=document.getElementById('mtxTable'); if(!t)return;
  const effNeededOnly=viewNeededOnly&&!editMode;
  const nCols=1+active().length+(editMode?1:0);
  // shared vendor header row, repeated (and pinned) per pillar section
  let headRow='<tr><th class="subhead">Platform Evaluation</th>';
  active().forEach((p)=>{ if(editMode){
      headRow+=`<th class="plhead" data-plid="${p.id}"><div class="plh">`+
        `<span class="drag-handle" draggable="true" data-drag="${p.id}" title="Drag to reorder">⠿</span>`+
        `<span contenteditable="true" data-plcode="${p.id}">${esc(p.code)}</span>`+
        `<button class="plretire" data-plretire="${p.id}" title="Retire — keeps all data, removes from scoring">retire</button></div></th>`;
    } else headRow+=`<th>${esc(p.code)}</th>`; });
  if(editMode)headRow+='<th class="actcol"></th>'; headRow+='</tr>';

  let html='';
  RUBRIC.forEach(p=>{
    const pillarHasRows=p.caps.some(c=>c.subs.some(s=>!effNeededOnly||S.needs[s.id]));
    if(!pillarHasRows&&!editMode)return;
    const pedit=editMode?`<span class="pname" contenteditable="true" data-pname="${p.key}">${esc(p.name)}</span>
      <button class="ed-btn" data-addcap="${p.key}">+ Capability</button><button class="ed-btn danger" data-delpillar="${p.key}">× Pillar</button>`:esc(p.name);
    let body=`<tr class="pillar-band"><td colspan="${nCols}">Pillar ${pLetter(p.key)} — ${pedit}</td></tr>`;
    p.caps.forEach(c=>{
      const subsShown=c.subs.filter(s=>!effNeededOnly||S.needs[s.id]);
      if(!subsShown.length&&!editMode)return;
      const pr=S.moscow[c.id]; const inScope=capInScope(c);
      const cedit=`<span contenteditable="true" data-ctitle="${c.id}">${esc(c.title)}</span>
        <button class="ed-btn" data-addrow="${c.id}">+ Add</button><button class="ed-btn danger" data-delcap="${c.id}">× Cap</button>`;
      body+=`<tr class="cap-band"><td colspan="${nCols}"><span class="cc">${c.id}</span>${cedit}</td></tr>`;
      subsShown.forEach(s=>{
        const needed=inScope&&S.needs[s.id];
        body+=`<tr class="${needed?'needed':''} ${!inScope?'flat':''}">`;
        body+=`<td class="sub-lbl ${!inScope?'oos':''}"><span class="qtext" data-sublbl="${s.id}" ${editMode?'contenteditable="true"':''}>${esc(s.q)}</span></td>`;
        active().forEach(pl=>{const yes=sup(s.id,pl.id);const note=hasNote(s,pl.id);
          const tone=note?((s.rat[pl.id].tone)||'note'):'';
          if(editMode){const mark=yes?`<span class="ck tog-on">✓</span>`:`<span class="ck tog-off">–</span>`;
            body+=`<td class="mk editable" data-tog="${s.id}" data-pl="${pl.id}">${mark}<button class="noteglyph ${note?'has tone-'+tone:''}" data-note="${s.id}" data-pl="${pl.id}" title="SME rationale">✎</button></td>`;}
          else{let mark; if(yes)mark=needed?`<span class="ck point">✓</span>`:`<span class="ck on">✓</span>`;
            else if(needed)mark=pr==='must'?`<span class="ck gap must">✕</span>`:`<span class="ck gap">✕</span>`;
            else mark=`<span class="ck off">–</span>`;
            body+=`<td class="mk ${note?'hasnote':''}" ${note?`data-rat="${s.id}" data-pl="${pl.id}"`:''}>${mark}</td>`;}});
        if(editMode)body+=`<td class="act"><button class="row-del" data-delrow="${s.id}" title="Delete row">×</button></td>`;
        body+='</tr>';
      });
    });
    html+=`<section class="pillar-card"><table class="mtx"><thead>${headRow}</thead><tbody>${body}</tbody></table></section>`;
  });
  if(!html)html=`<section class="pillar-card"><table class="mtx"><thead>${headRow}</thead><tbody><tr><td class="sub-lbl" colspan="${nCols}" style="padding:20px 16px;text-align:center;">No rows yet — add a pillar, capability or row.</td></tr></tbody></table></section>`;
  t.innerHTML=html;
  if(pendingFocus){const c=t.querySelector(pendingFocus);
    if(c){c.focus();const r=document.createRange();r.selectNodeContents(c);const sel=getSelection();sel.removeAllRanges();sel.addRange(r);}
    pendingFocus=null;}}
function capProfile(plId){
  const strengths=[],gaps=[]; const order={must:0,should:1};
  RUBRIC.forEach(p=>p.caps.forEach(c=>{ if(!capInScope(c))return; const pr=S.moscow[c.id];
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
function renderProfiles(){const wrap=document.getElementById('profiles'); if(!wrap)return; wrap.innerHTML='';
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
function renderRetired(){const bar=document.getElementById('retiredBar'); if(!bar)return;
  const r=PLATFORMS.filter(p=>p.retired);
  if(!r.length){bar.innerHTML='';bar.style.display='none';return;}
  bar.style.display='flex';
  bar.innerHTML='<span class="rb-label">Retired \u00b7 data kept, not scored</span>'+
    r.map(p=>`<span class="retired-chip"><b>${esc(p.name)}</b><button data-plrestore="${p.id}">Restore</button></span>`).join('');}
function renderAll(){renderFramework();renderAgg();renderMatrix();renderScoreboard();renderProfiles();renderRetired();}
function renderLive(){syncFrameworkState();renderAgg();renderMatrix();renderScoreboard();renderProfiles();}

// ============ RATIONALE POPOVER ============
let ratPinned=null, currentRatCell=null, ratHideTimer=null;
function ratPop(){return document.getElementById('ratPop');}
function hideRat(){const p=ratPop();if(p)p.classList.remove('show');ratPinned=null;currentRatCell=null;}
function positionPop(cell){const p=ratPop();p.classList.add('show');
  const rect=cell.getBoundingClientRect();const pw=p.offsetWidth,ph=p.offsetHeight;
  let left=rect.left+rect.width/2-pw/2; left=Math.max(8,Math.min(left,innerWidth-pw-8));
  let top=rect.bottom+8; if(top+ph>innerHeight-8 && rect.top-ph-8>8) top=rect.top-ph-8;
  p.style.left=left+'px'; p.style.top=Math.max(8,top)+'px'; }
function toneLabel(t){return t==='pro'?'In favour':t==='con'?'Caveat':'Note';}
function showRatView(cell){const sid=cell.dataset.rat,pl=cell.dataset.pl,info=SUBIDX[sid];if(!info)return;
  const r=info.sub.rat&&info.sub.rat[pl];if(!r||!(r.note&&r.note.trim()))return;
  const plName=PLATFORMS.find(x=>x.id===pl).name; const yes=!!info.sub.sup[pl]; const tone=r.tone||'note';
  ratPop().innerHTML=`<div class="rp-head">${esc(plName)} · ${yes?'Supported':'Not supported'}${r.conf?' · confidence '+r.conf:''}</div>
    <div class="rp-sub">${esc(info.sub.q)}</div><span class="rp-tone ${tone}">${toneLabel(tone)}</span>
    <div class="rp-note">${esc(r.note)}</div>`;
  positionPop(cell); }
function showRatEdit(btn){const sid=btn.dataset.note,pl=btn.dataset.pl,info=SUBIDX[sid];if(!info)return;
  if(!info.sub.rat)info.sub.rat={}; if(!info.sub.rat[pl])info.sub.rat[pl]={note:'',tone:'note',conf:''};
  const r=info.sub.rat[pl]; const plName=PLATFORMS.find(x=>x.id===pl).name;
  ratPop().innerHTML=`<div class="rp-head">${esc(plName)} — SME rationale</div><div class="rp-sub">${esc(info.sub.q)}</div>
    <textarea id="rpNote" placeholder="Your point of view — where it excels or fails in practice…">${esc(r.note||'')}</textarea>
    <div class="rp-controls"><select id="rpTone"><option value="note">Note</option><option value="pro">In favour</option><option value="con">Caveat</option></select>
    <select id="rpConf"><option value="">Confidence —</option><option value="low">Low</option><option value="med">Med</option><option value="high">High</option></select></div>
    <button class="rp-close" id="rpClose">Done</button>`;
  const p=ratPop(); const ta=p.querySelector('#rpNote'),tn=p.querySelector('#rpTone'),cf=p.querySelector('#rpConf');
  tn.value=r.tone||'note'; cf.value=r.conf||'';
  ta.oninput=()=>{r.note=ta.value;}; tn.onchange=()=>{r.tone=tn.value;}; cf.onchange=()=>{r.conf=cf.value;};
  p.querySelector('#rpClose').onclick=()=>{ if(!r.note||!r.note.trim()){ if(info.sub.rat[pl])delete info.sub.rat[pl]; } hideRat(); renderMatrix(); renderProfiles(); };
  ratPinned='edit'; positionPop(btn.closest('td')); ta.focus(); }

// ============ EVENTS ============
document.addEventListener('click',e=>{
  const scl=e.target.closest('[data-seccollapse]'); if(scl){scl.closest('.collapsible').classList.toggle('collapsed');return;}
  const rf=e.target.closest('[data-refine]'); if(rf){rf.closest('.cap').classList.toggle('open');return;}
  const noteBtn=e.target.closest('[data-note]'); if(noteBtn&&editMode){showRatEdit(noteBtn);return;}
  const ratCell=e.target.closest('[data-rat]'); if(ratCell&&!editMode){
    if(ratPinned==='cell'&&currentRatCell===ratCell){hideRat();} else {showRatView(ratCell);ratPinned='cell';currentRatCell=ratCell;} return;}
  const ph=e.target.closest('[data-pillar]'); if(ph){const k=ph.dataset.pillar;
    if(collapsedPillars.has(k))collapsedPillars.delete(k);else collapsedPillars.add(k);
    ph.parentElement.classList.toggle('collapsed');return;}
  const mb=e.target.closest('.moscow button'); if(mb){S.moscow[mb.parentElement.dataset.cap]=mb.dataset.on;renderLive();return;}
  const tog=e.target.closest('[data-tog]'); if(tog){const sid=tog.dataset.tog,pl=tog.dataset.pl;
    SUBIDX[sid].sub.sup[pl]=!SUBIDX[sid].sub.sup[pl]; renderMatrix();renderAgg();renderScoreboard();renderProfiles();updateSupportLabels();return;}
  const addrow=e.target.closest('[data-addrow]'); if(addrow){const cap=findCap(addrow.dataset.addrow);
    const id='sx'+(++subCounter); const supObj={};PLATFORMS.forEach(pl=>supObj[pl.id]=false);
    cap.subs.push({id,q:'New sub-capability — describe a distinguishing requirement',sup:supObj,rat:{}});
    S.needs[id]=true; reindex(); collapsedPillars.delete(SUBIDX[id].pkey);
    pendingFocus=`[data-sublbl="${id}"]`; renderAll(); return;}
  const delrow=e.target.closest('[data-delrow]'); if(delrow){const sid=delrow.dataset.delrow;
    RUBRIC.forEach(p=>p.caps.forEach(c=>{c.subs=c.subs.filter(s=>s.id!==sid);})); delete S.needs[sid]; reindex(); renderAll(); return;}
  const addcap=e.target.closest('[data-addcap]'); if(addcap){const p=findPillar(addcap.dataset.addcap);
    const id='C'+(++capCounter); p.caps.push({id,title:'New capability',def:'',subs:[]});
    S.moscow[id]='should'; reindex(); collapsedPillars.delete(p.key);
    pendingFocus=`[data-ctitle="${id}"]`; renderAll(); return;}
  const delcap=e.target.closest('[data-delcap]'); if(delcap){const capId=delcap.dataset.delcap;const cap=findCap(capId);
    if(confirm(`Delete capability "${cap.title}" and its ${cap.subs.length} sub-capabilities?`)){
      cap.subs.forEach(s=>delete S.needs[s.id]); delete S.moscow[capId];
      RUBRIC.forEach(p=>{p.caps=p.caps.filter(c=>c.id!==capId);}); reindex(); renderAll();} return;}
  const delp=e.target.closest('[data-delpillar]'); if(delp){const p=findPillar(delp.dataset.delpillar);
    const subN=p.caps.reduce((a,c)=>a+c.subs.length,0);
    if(confirm(`Delete pillar "${p.name}" with ${p.caps.length} capabilities and ${subN} sub-capabilities?`)){
      p.caps.forEach(c=>{c.subs.forEach(s=>delete S.needs[s.id]);delete S.moscow[c.id];});
      RUBRIC=RUBRIC.filter(x=>x.key!==p.key); reindex(); renderAll();} return;}
  const prt=e.target.closest('[data-plretire]'); if(prt){const p=PLATFORMS.find(x=>x.id===prt.dataset.plretire);
    if(active().length<=2){alert('Keep at least two active vendors to compare.');return;}
    if(p)p.retired=true; renderAll(); return;}
  const prs=e.target.closest('[data-plrestore]'); if(prs){const p=PLATFORMS.find(x=>x.id===prs.dataset.plrestore); if(p)p.retired=false; renderAll(); return;}
  if(e.target.id==='addVendorBtn'){const name=(prompt('New vendor name (e.g., Heap):')||'').trim(); if(!name)return;
    const id='v'+(++vendorCounter); const code=name.length<=12?name:name.slice(0,12);
    PLATFORMS.push({id,name,code,custom:true});
    RUBRIC.forEach(p=>p.caps.forEach(c=>c.subs.forEach(s=>{s.sup[id]=false;})));
    reindex();renderAll();return;}
  if(e.target.id==='addPillarBtn'){const key='P'+(++pillarCounter);
    RUBRIC.push({key,name:'New pillar',caps:[]}); reindex();
    pendingFocus=`[data-pname="${key}"]`; renderAll(); return;}
});
// dismiss pinned popover on outside click
document.addEventListener('click',e=>{ if(e.target.closest('#ratPop')||e.target.closest('[data-rat]')||e.target.closest('[data-note]'))return; if(ratPinned)hideRat(); });
// hover preview (view mode only, when not pinned)
document.addEventListener('mouseover',e=>{ if(editMode||ratPinned)return; const c=e.target.closest('[data-rat]'); if(c){clearTimeout(ratHideTimer);showRatView(c);} });
document.addEventListener('mouseout',e=>{ if(editMode||ratPinned)return; const c=e.target.closest('[data-rat]'); if(c){ratHideTimer=setTimeout(hideRat,140);} });

document.addEventListener('change',e=>{
  if(e.target.matches('[data-need]')){S.needs[e.target.dataset.need]=e.target.checked;renderLive();}
});
// ===== tab switching =====
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===t));
  document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===t.dataset.tab));
  hideRat(); window.scrollTo({top:0,behavior:'smooth'});
}));
document.addEventListener('blur',e=>{
  if(e.target.matches('[data-sublbl]')){const sid=e.target.dataset.sublbl,info=SUBIDX[sid];
    if(info){const txt=e.target.textContent.trim();info.sub.q=txt||info.sub.q;}
    renderMatrix(); const span=document.querySelector(`[data-subrow="${sid}"] .sub-q span`); if(span&&info)span.textContent=info.sub.q; return;}
  if(e.target.matches('[data-ctitle]')){const id=e.target.dataset.ctitle,cap=findCap(id);
    if(cap){const txt=e.target.textContent.trim();cap.title=txt||cap.title;} renderFramework(); return;}
  if(e.target.matches('[data-pname]')){const key=e.target.dataset.pname,p=findPillar(key);
    if(p){const txt=e.target.textContent.trim();p.name=txt||p.name;} renderFramework();renderAgg(); return;}
  if(e.target.matches('[data-plcode]')){const id=e.target.dataset.plcode,p=PLATFORMS.find(x=>x.id===id);
    if(p){const txt=e.target.textContent.trim();p.code=txt||p.code;} renderAll(); return;}
},true);

// ===== drag-to-reorder vendor columns =====
document.addEventListener('dragstart',e=>{const hd=e.target.closest('[data-drag]'); if(!hd||!editMode)return;
  dragId=hd.dataset.drag; e.dataTransfer.effectAllowed='move'; const th=hd.closest('.plhead'); if(th)th.classList.add('dragging');});
document.addEventListener('dragover',e=>{ if(!dragId)return; const th=e.target.closest('.plhead'); if(!th)return; e.preventDefault();
  document.querySelectorAll('.plhead.drop-target').forEach(x=>{if(x!==th)x.classList.remove('drop-target');});
  if(th.dataset.plid!==dragId)th.classList.add('drop-target');});
document.addEventListener('drop',e=>{ if(!dragId)return; const th=e.target.closest('.plhead'); e.preventDefault();
  if(th&&th.dataset.plid&&th.dataset.plid!==dragId){const arr=[...PLATFORMS];const from=arr.findIndex(p=>p.id===dragId);
    const [m]=arr.splice(from,1); const to=arr.findIndex(p=>p.id===th.dataset.plid); arr.splice(to,0,m); PLATFORMS=arr;}
  dragId=null; renderAll();});
document.addEventListener('dragend',()=>{dragId=null; document.querySelectorAll('.dragging,.drop-target').forEach(x=>x.classList.remove('dragging','drop-target'));});
document.getElementById('btnPrint')?.addEventListener('click',()=>window.print());
document.getElementById('btnExport')?.addEventListener('click',()=>{const payload={platforms:PLATFORMS,rubric:RUBRIC};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='merkle-rubric-'+new Date().toISOString().slice(0,10)+'.json';a.click();});

// ============ INIT ============
const _rp=el('<div class="rat-pop" id="ratPop"></div>'); document.body.appendChild(_rp);
_rp.addEventListener('mouseenter',()=>clearTimeout(ratHideTimer));
_rp.addEventListener('mouseleave',()=>{ if(ratPinned!=='edit')hideRat(); });
window.addEventListener('scroll',()=>{ if(ratPinned!=='edit')hideRat(); },true);
RUBRIC=buildRubric(); reindex(); S=defaultState();
renderAll();

// ===== integration API for the persistence layer (js/db.js) =====
function _setVendorCounter(){vendorCounter=PLATFORMS.reduce((m,p)=>{const n=/^v(\d+)$/.exec(p.id);return n?Math.max(m,+n[1]):m;},0);}
window.PET={
  exportData:()=>({platforms:PLATFORMS,rubric:RUBRIC,selections:{moscow:S.moscow,needs:S.needs}}),
  exportRubric:()=>({platforms:PLATFORMS,rubric:RUBRIC}),
  importData:(d)=>{ if(!d)return; if(Array.isArray(d.platforms)&&d.platforms.length)PLATFORMS=d.platforms; _setVendorCounter();
    RUBRIC=d.rubric?d.rubric:buildRubric(); normalizeRubric(); reindex();
    const base=defaultState(); const sel=d.selections||{};
    S={moscow:{...base.moscow,...(sel.moscow||{})},needs:{...base.needs,...(sel.needs||{})}}; collapsedPillars.clear(); renderAll(); },
  loadRubricData:(d)=>{ if(!d)return; if(Array.isArray(d.platforms)&&d.platforms.length)PLATFORMS=d.platforms; _setVendorCounter();
    RUBRIC=d.rubric?d.rubric:buildRubric(); normalizeRubric(); reindex(); S=defaultState(); collapsedPillars.clear(); renderAll(); }
};
window.PET.applySelections=(sel)=>{const base=defaultState();S={moscow:{...base.moscow,...((sel&&sel.moscow)||{})},needs:{...base.needs,...((sel&&sel.needs)||{})}};collapsedPillars.clear();renderAll();};
window.PET.getSelections=()=>({moscow:S.moscow,needs:S.needs});
window.PET.setEditMode=(b)=>{editMode=!!b;renderMatrix();};
document.dispatchEvent(new Event('pet-ready'));