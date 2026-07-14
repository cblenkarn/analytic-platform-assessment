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
const SEED_ORDER = ['ga4','aa','piano','cja','amp','cs'];
const MOSCOW_W = {must:3, should:2, could:1, wont:0};

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

// ============ USE CASE LIBRARY ============
// Common analytical use cases a consultant can drop in and refine per client.
// Each is pre-mapped to the capabilities that typically deliver it.
// This is the default seed — it can be edited on /usecases and is persisted
// alongside the rubric in the master 'rubrics' row (data.useCases).
let USE_CASE_LIBRARY = [
  { id:'lib-attribution', title:'Cross-channel marketing attribution',
    desc:'Understand how paid, owned and earned channels contribute to conversion so spend can be reallocated to real incremental value.',
    caps:['C1','C9','C10','C12'] },
  { id:'lib-journey', title:'Cross-device customer journey',
    desc:'Follow prospects from anonymous to known across devices and sessions to see the real path to conversion, not one-session snapshots.',
    caps:['C1','C3','C6'] },
  { id:'lib-funnel', title:'Funnel drop-off diagnosis',
    desc:'Locate where users abandon a critical flow (checkout, signup, application) and understand qualitatively what they do instead.',
    caps:['C6','C2'] },
  { id:'lib-adoption', title:'Product feature adoption',
    desc:'Measure how quickly and deeply new features are adopted, and how usage changes core outcomes (activation, revenue, retention).',
    caps:['C2','C5','C7'] },
  { id:'lib-retention', title:'Retention & churn analysis',
    desc:'Track how well cohorts stick, identify leading indicators of churn and quantify the impact of interventions.',
    caps:['C7','C8'] },
  { id:'lib-predictive', title:'Predictive audiences (churn / propensity / LTV)',
    desc:'Score users on likelihood to churn, convert or spend so marketing can act upstream of the outcome, not after it.',
    caps:['C8','C10','C12'] },
  { id:'lib-experimentation', title:'A/B testing & personalization',
    desc:'Run controlled experiments and target variants to the behavioural cohorts most likely to respond.',
    caps:['C11','C7'] },
  { id:'lib-activation', title:'Audience activation to paid media',
    desc:'Push behavioural segments to Google, Meta, CRM and CDP for suppression, retargeting and lookalike modelling.',
    caps:['C9','C10','C3'] },
  { id:'lib-friction', title:'UX friction & rage-click diagnosis',
    desc:'Identify pages and interactions where users struggle, and understand qualitatively what breaks the experience.',
    caps:['C6','C2'] },
  { id:'lib-selfserve', title:'Ad-hoc analyst self-serve',
    desc:'Enable senior analysts to answer new questions directly in the platform without engineering or warehouse export.',
    caps:['C5'] },
  { id:'lib-bi', title:'Executive KPI dashboards in BI',
    desc:'Deliver a single, trusted view of business KPIs to leadership in the enterprise BI tool (Tableau, Power BI, Looker).',
    caps:['C12'] },
  { id:'lib-privacy', title:'Consent-compliant measurement',
    desc:'Maintain durable measurement under GDPR / CCPA consent flows and Consent Mode v2 without losing signal to opt-outs.',
    caps:['C13','C1'] },
  { id:'lib-phi', title:'HIPAA / PHI-safe measurement',
    desc:'Collect and analyse behavioural data on regulated properties where the vendor must sign a BAA and PHI is possible.',
    caps:['C13'] },
  { id:'lib-firstparty', title:'First-party data foundation',
    desc:'Establish a governed first-party event schema and identity spine that feeds CDP, activation and warehouse downstream.',
    caps:['C1','C3','C12','C10'] },
  { id:'lib-content', title:'Content & landing page performance',
    desc:'Measure engagement and conversion contribution of content and campaign landing pages by cohort.',
    caps:['C5','C6'] },
  { id:'lib-onboarding', title:'Onboarding funnel optimization',
    desc:'Measure and improve first-time user activation from signup through the "aha moment" and habit-forming actions.',
    caps:['C6','C7','C11'] },
];

// ============ MUTABLE RUBRIC + STATE ============
let RUBRIC, S, SUBIDX={}, subCounter=0, capCounter=15, pillarCounter=0, vendorCounter=0, dragId=null;
let useCaseCounter=0;
let editMode=true, viewNeededOnly=false, pendingFocus=null;
const collapsedPillars=new Set();
let pillarDragKey=null; // drag-to-reorder pillars (admin matrix only)

// ── UI-level admin unlock ────────────────────────────────────────────────
// NOT a security boundary — the token is visible in client code and RLS is
// open. It only reveals irreversible Delete controls alongside Retire for
// whoever holds the URL. Append ?admin=<ADMIN_DELETE_TOKEN> to the page URL.
// Change this token to your own private value.
const ADMIN_DELETE_TOKEN = 'merkle-delete-2026';
let adminDelete = false;
try { adminDelete = new URLSearchParams(location.search).get('admin') === ADMIN_DELETE_TOKEN; } catch(e){}

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
  return SEED.map((p,i)=>({key:String.fromCharCode(65+i), name:p.name, retired:false, caps:p.caps.map(c=>({
    id:c.id, title:c.title, def:c.def, retired:false, subs:c.subs.map(s=>{
      const sup={}; SEED_ORDER.forEach((pid,j)=>sup[pid]=!!(s.s&&s.s[j])); return {id:s.id, q:s.q, sup, rat:cloneRat(s.id), retired:false};
    })
  }))}));
}
function normalizeRubric(){
  RUBRIC.forEach((p)=>{ if(!p.key)p.key='P'+(++pillarCounter); if(!p.caps)p.caps=[];
    if(typeof p.retired!=='boolean')p.retired=false;
    p.caps.forEach(c=>{ if(!c.subs)c.subs=[]; if(typeof c.retired!=='boolean')c.retired=false;
      c.subs.forEach(s=>{ if(!s.sup)s.sup={}; PLATFORMS.forEach(pl=>{if(typeof s.sup[pl.id]!=='boolean')s.sup[pl.id]=false;}); if(!s.rat)s.rat={}; if(typeof s.retired!=='boolean')s.retired=false; }); });
  });
}
function reindex(){ SUBIDX={};
  RUBRIC.forEach(p=>p.caps.forEach(c=>c.subs.forEach(s=>{SUBIDX[s.id]={sub:s,cap:c,pkey:p.key};}))); }
function defaultState(){ const moscow={}, needs={};
  RUBRIC.forEach(p=>p.caps.forEach(c=>{moscow[c.id]='should';c.subs.forEach(s=>needs[s.id]=true);})); return {moscow,needs,useCases:[]}; }
function findCap(id){let r=null;RUBRIC.forEach(p=>p.caps.forEach(c=>{if(c.id===id)r=c;}));return r;}
function findPillar(key){return RUBRIC.find(p=>p.key===key);}
function pIndex(key){return RUBRIC.findIndex(p=>p.key===key);}
function pLetter(key){const i=pIndex(key);return i>=0?String.fromCharCode(65+i):'?';}
function capMeta(capId){ for(const p of RUBRIC){ for(const c of p.caps){ if(c.id===capId) return {c,p,letter:pLetter(p.key)}; } } return null; }
function _markChanged(){ document.dispatchEvent(new Event('pet-selections-changed')); }

// ============ COMPUTE ============
function active(){return PLATFORMS.filter(p=>!p.retired);}
function sup(subId,plId){return !!(SUBIDX[subId] && SUBIDX[subId].sub.sup[plId]);}
function supportCount(subId){return active().filter(pl=>sup(subId,pl.id)).length;}
function capPillar(c){return RUBRIC.find(p=>p.caps.some(x=>x.id===c.id));}
function capInScope(c){
  if(c.retired) return false;
  const p=capPillar(c); if(p&&p.retired) return false;
  return S.moscow[c.id]!=='wont';
}
function onSubs(c){return c.subs.filter(s=>!s.retired && S.needs[s.id]);}
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
    out[p.key]={inScope:caps.length>0,retired:!!p.retired};
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

// ============ USE CASE HELPERS ============
function useCasesForCap(capId){ return (S.useCases||[]).filter(u=>u.capIds&&u.capIds.includes(capId)); }
function libraryUsedIds(){ const set=new Set(); (S.useCases||[]).forEach(u=>{ if(u.sourceLibId) set.add(u.sourceLibId); }); return set; }
function _nextUCId(){ return 'uc'+(++useCaseCounter); }
function addUseCaseFromLibrary(libId){
  const lib=USE_CASE_LIBRARY.find(l=>l.id===libId); if(!lib) return;
  if(libraryUsedIds().has(libId)) return;
  S.useCases.push({ id:_nextUCId(), title:lib.title, desc:lib.desc, capIds:[...(lib.caps||[])], sourceLibId:libId });
  _markChanged();
}
function addCustomUseCase(){
  S.useCases.push({ id:_nextUCId(), title:'', desc:'', capIds:[], sourceLibId:null });
  _markChanged();
}
function deleteUseCase(id){
  S.useCases = S.useCases.filter(u=>u.id!==id);
  _markChanged();
}
function toggleUCCap(ucId, capId){
  const uc=S.useCases.find(u=>u.id===ucId); if(!uc) return;
  if(!uc.capIds) uc.capIds=[];
  const i=uc.capIds.indexOf(capId);
  if(i>=0) uc.capIds.splice(i,1); else uc.capIds.push(capId);
  _markChanged();
}

// ============ USE CASE COVERAGE (Results tab) ============
// For a single use case × platform: coverage = supported sub-caps / in-scope sub-caps,
// aggregated across the use case's mapped capabilities. Capabilities set to Won't are
// excluded from the calc (they're not in the client's scope for anything, not just this UC).
function useCaseCoverage(uc, plId){
  const capIds = uc.capIds || [];
  let sup=0, total=0, capsScoped=0, capsFullyMet=0;
  capIds.forEach(cid=>{
    const c = findCap(cid);
    if(!c) return;              // capability was deleted from rubric
    if(!capInScope(c)) return;  // MoSCoW = Won't
    const on = onSubs(c);
    if(!on.length) return;      // all sub-caps deselected
    capsScoped++;
    total += on.length;
    const s = on.filter(x=>!!x.sup[plId]).length;
    sup += s;
    if(s === on.length) capsFullyMet++;
  });
  return { sup, total, capsScoped, capsFullyMet, cov: total?sup/total:0, scoped: capsScoped>0 };
}

// Rank platforms by their ability to deliver the captured use cases.
// Sort: most fully delivered → highest average coverage → weighted fit tie-break.
function useCaseRanking(){
  const useCases = S.useCases || [];
  const fitRows = compute();
  const fitMap = {}; fitRows.forEach(r=>fitMap[r.id]=r.fit);
  return active().map(pl=>{
    let full=0, part=0, none=0, sumCov=0, ucInScope=0;
    useCases.forEach(uc=>{
      const cv = useCaseCoverage(uc, pl.id);
      if(!cv.scoped) return;
      ucInScope++;
      sumCov += cv.cov;
      if(cv.cov >= 0.999) full++;
      else if(cv.cov > 0) part++;
      else none++;
    });
    return { ...pl, full, part, none, ucInScope,
      avgCov: ucInScope ? sumCov/ucInScope : 0,
      fit: fitMap[pl.id] || 0 };
  }).sort((a,b)=> b.full - a.full || b.avgCov - a.avgCov || b.fit - a.fit );
}

function _capIdStrip(uc){
  return (uc.capIds||[]).map(cid=>{const m=capMeta(cid); return m?m.c.id:null;}).filter(Boolean).join(' · ');
}

// ============ LIBRARY ADMIN (edits USE_CASE_LIBRARY on the /usecases page) ============
let libCounter = 0;
function _nextLibId(){
  // never reuse an existing id (including built-in lib-* seed ids)
  let n = libCounter;
  const taken = new Set(USE_CASE_LIBRARY.map(x=>x.id));
  do { n++; } while(taken.has('lib-custom-'+n));
  libCounter = n;
  return 'lib-custom-'+n;
}
function _markLibChanged(){ document.dispatchEvent(new Event('pet-library-changed')); }
function libAddItem(){
  USE_CASE_LIBRARY.push({ id:_nextLibId(), title:'', desc:'', caps:[] });
  _markLibChanged();
}
function libDeleteItem(id){
  USE_CASE_LIBRARY = USE_CASE_LIBRARY.filter(x=>x.id!==id);
  _markLibChanged();
}
function libToggleCap(libId, capId){
  const it = USE_CASE_LIBRARY.find(x=>x.id===libId); if(!it) return;
  if(!it.caps) it.caps = [];
  const i = it.caps.indexOf(capId);
  if(i>=0) it.caps.splice(i,1); else it.caps.push(capId);
  _markLibChanged();
}
function renderLibraryEditor(){
  const wrap = document.getElementById('libEditor'); if(!wrap) return;
  const count = document.getElementById('libCount');
  if(count) count.textContent = USE_CASE_LIBRARY.length === 1 ? '1 use case' : (USE_CASE_LIBRARY.length + ' use cases');
  wrap.innerHTML = '';
  if(!USE_CASE_LIBRARY.length){
    wrap.appendChild(el(`<div class="uc-empty">No use cases in the library yet. Click <b>+ Add use case</b> above to create one.</div>`));
    return;
  }
  USE_CASE_LIBRARY.forEach(item=>{
    const capChips = (item.caps||[]).map(cid=>{
      const meta = capMeta(cid);
      if(!meta) return `<span class="uc-cap-chip missing" title="This capability no longer exists in the rubric"><span class="uc-cap-code">?? · ${esc(cid)}</span><span class="uc-cap-title">Missing capability</span><button class="uc-cap-x" data-libeditremcap data-lib="${item.id}" data-cap="${cid}" title="Remove">×</button></span>`;
      return `<span class="uc-cap-chip" title="Pillar ${meta.letter} · ${esc(meta.c.title)}"><span class="uc-cap-code">${meta.letter} · ${meta.c.id}</span><span class="uc-cap-title">${esc(meta.c.title)}</span><button class="uc-cap-x" data-libeditremcap data-lib="${item.id}" data-cap="${cid}" title="Remove capability">×</button></span>`;
    }).join('');
    const capsBody = capChips || '<span class="uc-cap-none">No capabilities mapped yet — click <b>+ Capability</b> to map one.</span>';
    const seedTag = !/^lib-custom-/.test(item.id) ? '<span class="lib-seed-tag" title="Part of the seed library — safe to edit or delete">seed</span>' : '';
    const card = el(`<div class="uc-card" data-lib="${item.id}">
      <div class="uc-head">
        <div class="uc-title" contenteditable="true" data-libedittitle="${item.id}">${esc(item.title||'')}</div>
        ${seedTag}
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
function toggleLibCapPicker(btn){
  const already = btn.parentElement.querySelector('.uc-cap-pop');
  document.querySelectorAll('.uc-cap-pop').forEach(p=>p.remove());
  if(already) return; // second click closes
  const libId = btn.dataset.libeditaddcap;
  const item = USE_CASE_LIBRARY.find(x=>x.id===libId); if(!item) return;
  const holder = btn.parentElement;
  const pop = document.createElement('div');
  pop.className = 'uc-cap-pop show';
  pop.dataset.lib = libId;
  let html = '';
  RUBRIC.forEach(p=>{
    if(!p.caps.length) return;
    html += `<div class="ucp-pillar"><div class="ucp-plname">Pillar ${pLetter(p.key)} — ${esc(p.name)}</div>`;
    p.caps.forEach(c=>{
      const checked = (item.caps||[]).includes(c.id);
      html += `<label class="ucp-opt ${checked?'checked':''}"><input type="checkbox" data-libeditpick data-lib="${libId}" data-cap="${c.id}" ${checked?'checked':''}><span class="ucp-code">${c.id}</span><span>${esc(c.title)}</span></label>`;
    });
    html += '</div>';
  });
  html += '<div class="ucp-close"><button data-libeditpickclose>Done</button></div>';
  pop.innerHTML = html;
  holder.appendChild(pop);
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
    <div class="stack-empty">Set at least one capability to Must, Should or Could on the Prioritization tab — sub-capabilities are on by default — to generate a fit score and a best-of-breed recommendation.</div>`;return;}
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
    const nameHtml=`<span class="pl-letter">${pLetter(p.key)}</span><b>${esc(p.name)}</b>${p.retired?' <span class="retired-tag">retired</span>':''}`;
    body+=`<tr class="${p.retired?'row-retired':''}"><td class="lbl">${nameHtml}</td>`;
    active().forEach(pl=>{ if(!row.inScope){body+=`<td class="cov"><span class="cell-na">${p.retired?'— retired':'— out of scope'}</span></td>`;}
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

      // Use case footnote — driven by the Use Cases tab.
      // We only surface the "no use case" hint once the consultant has actually
      // populated some use cases; otherwise every capability would nag on a fresh assessment.
      const ucs=useCasesForCap(c.id);
      const anyUC=(S.useCases||[]).length>0;
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
function syncFrameworkState(){
  document.querySelectorAll('.moscow').forEach(m=>{const cap=m.dataset.cap;
    m.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.on===S.moscow[cap]));
    const cc=m.closest('.cap'); if(cc)cc.classList.toggle('oos-cap',S.moscow[cap]==='wont');});
  document.querySelectorAll('[data-need]').forEach(cb=>{const sid=cb.dataset.need;cb.checked=S.needs[sid];
    const info=SUBIDX[sid];
    const capOOS = info && S.moscow[info.cap.id]==='wont';
    const subRet = info && info.sub.retired;
    const capRet = info && info.cap.retired;
    const pilRet = info && (capPillar(info.cap)||{}).retired;
    const disabled = capOOS || subRet || capRet || pilRet;
    cb.closest('.sub-row').classList.toggle('disabled',disabled);cb.disabled=disabled;});
  RUBRIC.forEach(p=>{let pc=0;
    p.caps.forEach(c=>{const n=c.subs.filter(s=>!s.retired && S.needs[s.id]).length;if(capInScope(c))pc+=n;
      const tag=document.querySelector(`[data-selcount="${c.id}"]`);
      if(tag){ if(!capInScope(c)){tag.textContent=c.retired?'retired':'out of scope';tag.classList.remove('has');}
        else{tag.textContent=`${n}/${c.subs.length} in scope`;tag.classList.toggle('has',n>0);} }});
    const plc=document.querySelector(`[data-plcount="${p.key}"]`);if(plc)plc.textContent=pc?`${pc} in scope`:'';});}

// ---------- USE CASES TAB ----------
function renderUseCases(){
  renderUCLibrary();
  renderUCSelected();
}
function renderUCLibrary(){
  const lib=document.getElementById('ucLibrary'); if(!lib)return;
  const used=libraryUsedIds();
  lib.innerHTML='';
  USE_CASE_LIBRARY.forEach(item=>{
    const isUsed=used.has(item.id);
    const chip=el(`<button class="uc-lib-chip ${isUsed?'used':''}" data-libadd="${item.id}" title="${esc(item.desc)}">${esc(item.title)}</button>`);
    lib.appendChild(chip);
  });
}
function renderUCSelected(){
  const wrap=document.getElementById('ucSelected'); if(!wrap)return;
  const empty=document.getElementById('ucEmpty');
  const count=document.getElementById('ucCount');
  const list=S.useCases||[];
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
function toggleUCCapPicker(btn){
  const already=btn.parentElement.querySelector('.uc-cap-pop');
  document.querySelectorAll('.uc-cap-pop').forEach(p=>p.remove());
  if(already) return; // second click on same button closes
  const ucId=btn.dataset.ucaddcap;
  const uc=S.useCases.find(u=>u.id===ucId); if(!uc) return;
  const holder=btn.parentElement;
  const pop=document.createElement('div');
  pop.className='uc-cap-pop show';
  pop.dataset.uc=ucId;
  let html='';
  RUBRIC.forEach(p=>{
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
function closeUCCapPickers(){ document.querySelectorAll('.uc-cap-pop').forEach(p=>p.remove()); }

function updateSupportLabels(){document.querySelectorAll('[data-suplbl]').forEach(e=>{e.textContent=`${supportCount(e.dataset.suplbl)}/${active().length} support`;});}
function hasNote(s,pl){return !!(s.rat&&s.rat[pl]&&s.rat[pl].note&&s.rat[pl].note.trim());}

function renderMatrix(){const t=document.getElementById('mtxTable'); if(!t)return;
  const effNeededOnly=viewNeededOnly&&!editMode;
  const nCols=1+active().length+(editMode?1:0);
  let headRow='<tr><th class="subhead">Platform Evaluation</th>';
  active().forEach((p)=>{ if(editMode){
      headRow+=`<th class="plhead" data-plid="${p.id}"><div class="plh">`+
        `<span class="drag-handle" draggable="true" data-drag="${p.id}" title="Drag to reorder">⠿</span>`+
        `<span contenteditable="true" data-plcode="${p.id}">${esc(p.code)}</span>`+
        `<button class="plretire" data-plretire="${p.id}" title="Retire — keeps all data, removes from scoring">retire</button>`+
        (adminDelete?`<button class="plretire pldelete" data-pldelete="${p.id}" title="Delete vendor permanently">delete</button>`:'')+
        `</div></th>`;
    } else headRow+=`<th>${esc(p.code)}</th>`; });
  if(editMode)headRow+='<th class="actcol"></th>'; headRow+='</tr>';

  let html='';
  RUBRIC.forEach(p=>{
    const pillarHasRows=p.caps.some(c=>c.subs.some(s=>!effNeededOnly||S.needs[s.id]));
    if(!pillarHasRows&&!editMode)return;
    const pRetireLabel=p.retired?'Unretire pillar':'Retire pillar';
    const pDragHandle=editMode?`<span class="drag-handle pillar-drag" draggable="true" data-pdrag="${p.key}" title="Drag to reorder this pillar">⠿</span> `:'';
    const pedit=editMode?`<span class="pname" contenteditable="true" data-pname="${p.key}">${esc(p.name)}</span>
      <button class="ed-btn" data-addcap="${p.key}">+ Capability</button><button class="ed-btn" data-retirepillar="${p.key}">${pRetireLabel}</button>${adminDelete?`<button class="ed-btn danger" data-delpillar="${p.key}">Delete</button>`:''}${p.retired?'<span class="retired-tag on-dark">retired</span>':''}`
      :esc(p.name)+(p.retired?' <span class="retired-tag on-dark">retired</span>':'');
    let body=`<tr class="pillar-band ${p.retired?'retired':''}"><td colspan="${nCols}">${pDragHandle}Pillar ${pLetter(p.key)} — ${pedit}</td></tr>`;
    p.caps.forEach(c=>{
      const subsShown=c.subs.filter(s=>!effNeededOnly||S.needs[s.id]);
      if(!subsShown.length&&!editMode)return;
      const pr=S.moscow[c.id]; const inScope=capInScope(c);
      const cRetireLabel=c.retired?'Unretire capability':'Retire capability';
      const cedit=`<span contenteditable="true" data-ctitle="${c.id}">${esc(c.title)}</span>
        <button class="ed-btn" data-addrow="${c.id}">+ Add</button><button class="ed-btn" data-retirecap="${c.id}">${cRetireLabel}</button>${adminDelete?`<button class="ed-btn danger" data-delcap="${c.id}">Delete</button>`:''}${c.retired?'<span class="retired-tag">retired</span>':''}`;
      body+=`<tr class="cap-band ${c.retired?'retired':''}"><td colspan="${nCols}"><span class="cc">${c.id}</span>${cedit}</td></tr>`;
      subsShown.forEach(s=>{
        const needed=inScope&&S.needs[s.id]&&!s.retired;
        body+=`<tr class="${needed?'needed':''} ${!inScope?'flat':''} ${s.retired?'sub-retired':''}">`;
        body+=`<td class="sub-lbl ${!inScope?'oos':''}"><span class="qtext" data-sublbl="${s.id}" ${editMode?'contenteditable="true"':''}>${esc(s.q)}</span>${s.retired?' <span class="retired-tag">retired</span>':''}</td>`;
        active().forEach(pl=>{const yes=sup(s.id,pl.id);const note=hasNote(s,pl.id);
          const tone=note?((s.rat[pl.id].tone)||'note'):'';
          if(editMode){const mark=yes?`<span class="ck tog-on">✓</span>`:`<span class="ck tog-off">–</span>`;
            body+=`<td class="mk editable" data-tog="${s.id}" data-pl="${pl.id}">${mark}<button class="noteglyph ${note?'has tone-'+tone:''}" data-note="${s.id}" data-pl="${pl.id}" title="SME rationale">✎</button></td>`;}
          else{let mark; if(yes)mark=needed?`<span class="ck point">✓</span>`:`<span class="ck on">✓</span>`;
            else if(needed)mark=pr==='must'?`<span class="ck gap must">✕</span>`:`<span class="ck gap">✕</span>`;
            else mark=`<span class="ck off">–</span>`;
            body+=`<td class="mk ${note?'hasnote':''}" ${note?`data-rat="${s.id}" data-pl="${pl.id}"`:''}>${mark}</td>`;}});
        if(editMode){const sRetireLabel=s.retired?'Unretire':'Retire';
          body+=`<td class="act"><div class="act-btns"><button class="row-retire" data-retirerow="${s.id}" title="${sRetireLabel} sub-capability">${sRetireLabel}</button>${adminDelete?`<button class="row-retire danger" data-delrow="${s.id}" title="Delete sub-capability permanently">Delete</button>`:''}</div></td>`;}
        body+='</tr>';
      });
    });
    html+=`<section class="pillar-card ${p.retired?'pillar-retired':''}" data-pcard="${p.key}"><table class="mtx"><thead>${headRow}</thead><tbody>${body}</tbody></table></section>`;
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

function renderUseCaseCoverage(){
  const head = document.getElementById('ucSecHead');
  const wrap = document.getElementById('ucCoverage');
  if(!wrap || !head) return;
  const useCases = S.useCases || [];
  const has = anyScope();
  // Hide the section entirely when there's nothing to say — no use cases captured
  // or no capabilities in scope means no meaningful coverage numbers.
  if(!useCases.length || !has){
    head.hidden = true; wrap.hidden = true; wrap.innerHTML = '';
    return;
  }
  head.hidden = false; wrap.hidden = false;

  const ranked = useCaseRanking();
  const winner = ranked.find(r=>r.ucInScope>0);
  let html = '';

  // ---- Verdict card ----
  if(winner){
    const parts = [];
    if(winner.full > 0) parts.push(`<b>${winner.full}</b> of ${winner.ucInScope} fully`);
    if(winner.part > 0) parts.push(`<b>${winner.part}</b> partially`);
    if(winner.none > 0) parts.push(`<b>${winner.none}</b> not covered`);
    const covPct = Math.round(winner.avgCov*100);
    const ucStr = winner.ucInScope === 1 ? '1 in-scope use case' : winner.ucInScope + ' in-scope use cases';
    const runner = ranked.filter(r=>r.id!==winner.id && r.ucInScope>0)[0];
    let runnerHtml = '';
    if(runner){
      const rPct = Math.round(runner.avgCov*100);
      const rBits = [];
      if(runner.full>0) rBits.push(`${runner.full} fully delivered`);
      rBits.push(`${rPct}% average coverage`);
      runnerHtml = `<div class="uv-runner">Runner-up: <b>${esc(runner.name)}</b> — ${rBits.join(', ')}.</div>`;
    }
    // Which specific use cases does the winner deliver fully? Show up to 3.
    const winnerFullList = useCases
      .map(uc=>({uc, cv:useCaseCoverage(uc, winner.id)}))
      .filter(x=>x.cv.scoped && x.cv.cov>=0.999)
      .map(x=>x.uc.title||'Untitled');
    let fullListHtml = '';
    if(winnerFullList.length){
      const shown = winnerFullList.slice(0,3).map(t=>esc(t)).join(', ');
      const more = winnerFullList.length>3 ? ` (+${winnerFullList.length-3} more)` : '';
      fullListHtml = `<div class="uv-detail">Fully delivers: <b>${shown}</b>${more}.</div>`;
    }
    html += `<div class="uc-verdict">
      <div class="uv-eyebrow">Best platform for your use cases</div>
      <div class="uv-title">${esc(winner.name)}</div>
      <div class="uv-body">Delivers ${parts.join(', ')} \u00b7 <b>${covPct}%</b> average coverage across ${ucStr}.</div>
      ${fullListHtml}
      ${runnerHtml}
    </div>`;
  }

  // ---- Use case × platform matrix ----
  html += `<div class="pill-grid"><table class="agg">`;
  html += '<thead><tr><th class="lbl">Use case</th>';
  active().forEach(p=>html+=`<th>${esc(p.code)}</th>`);
  html += '</tr></thead><tbody>';
  useCases.forEach(uc=>{
    const cells = active().map(pl=>({pl, cv:useCaseCoverage(uc, pl.id)}));
    const capStrip = _capIdStrip(uc);
    const capSub = capStrip ? `<div class="uc-caps-sub">${esc(capStrip)}</div>` : `<div class="uc-caps-sub" style="color:var(--gap);">no capabilities mapped</div>`;
    const scoped = cells.some(c=>c.cv.scoped);
    if(!scoped){
      html += `<tr><td class="lbl"><b>${esc(uc.title||'Untitled')}</b>${capSub}</td>`;
      active().forEach(()=>html+=`<td class="cov"><span class="cell-na">\u2014 out of scope</span></td>`);
      html += '</tr>';
      return;
    }
    let lead = -1;
    cells.forEach(c=>{ if(c.cv.scoped && c.cv.cov > lead) lead = c.cv.cov; });
    html += `<tr><td class="lbl"><b>${esc(uc.title||'Untitled')}</b>${capSub}</td>`;
    cells.forEach(c=>{
      const pct = Math.round(c.cv.cov*100);
      const isLead = c.cv.scoped && c.cv.cov === lead && lead > 0;
      html += `<td class="cov ${isLead?'leader':''}"><div class="cell-cov"><span class="n">${pct}%</span><span class="mini"><i style="width:${pct}%"></i></span></div></td>`;
    });
    html += '</tr>';
  });
  // Average use case coverage row
  html += '<tr class="total"><td class="lbl">Avg. use case coverage</td>';
  active().forEach(pl=>{
    const r = ranked.find(x=>x.id===pl.id);
    const pct = Math.round((r ? r.avgCov : 0) * 100);
    html += `<td class="cov"><div class="cell-cov"><span class="n">${pct}%</span><span class="mini"><i style="width:${pct}%"></i></span></div></td>`;
  });
  html += '</tr></tbody></table></div>';

  wrap.innerHTML = html;
}

function renderAll(){renderFramework();renderAgg();renderMatrix();renderScoreboard();renderProfiles();renderUseCaseCoverage();renderRetired();renderUseCases();}
function renderLive(){syncFrameworkState();renderAgg();renderMatrix();renderScoreboard();renderProfiles();renderUseCaseCoverage();}

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

  // ----- Use case events -----
  const libAdd=e.target.closest('[data-libadd]'); if(libAdd){ addUseCaseFromLibrary(libAdd.dataset.libadd); renderUseCases(); renderFramework(); renderUseCaseCoverage(); return; }
  if(e.target.id==='btnAddCustomUC'){ addCustomUseCase(); renderUCSelected(); renderUseCaseCoverage();
    requestAnimationFrame(()=>{ const cards=document.querySelectorAll('.uc-card'); const last=cards[cards.length-1]; const t=last&&last.querySelector('.uc-title'); if(t){t.focus();}});
    return; }
  const ucDel=e.target.closest('[data-ucdel]'); if(ucDel){ deleteUseCase(ucDel.dataset.ucdel); renderUseCases(); renderFramework(); renderUseCaseCoverage(); return; }
  const capRem=e.target.closest('[data-uccap-remove]'); if(capRem){ toggleUCCap(capRem.dataset.uc, capRem.dataset.cap); renderUCSelected(); renderFramework(); renderUseCaseCoverage(); return; }
  const ucAddCap=e.target.closest('[data-ucaddcap]'); if(ucAddCap){ toggleUCCapPicker(ucAddCap); return; }
  const ucPick=e.target.closest('[data-ucpick]');
  if(ucPick){ toggleUCCap(ucPick.dataset.uc, ucPick.dataset.cap);
    const ucId=ucPick.dataset.uc; renderUCSelected(); renderFramework(); renderUseCaseCoverage();
    const btn=document.querySelector(`[data-ucaddcap="${ucId}"]`); if(btn) toggleUCCapPicker(btn);
    return; }
  if(e.target.closest('[data-ucpickclose]')){ closeUCCapPickers(); return; }
  if(!e.target.closest('.uc-cap-pop') && !e.target.closest('[data-ucaddcap]') && !e.target.closest('[data-libeditaddcap]')) closeUCCapPickers();

  // ----- Library editor events (/usecases page) -----
  if(e.target.id==='btnAddLibItem'){ libAddItem(); renderLibraryEditor();
    requestAnimationFrame(()=>{ const cards=document.querySelectorAll('#libEditor .uc-card'); const last=cards[cards.length-1]; const t=last&&last.querySelector('.uc-title'); if(t){t.focus();}});
    return; }
  const libDel=e.target.closest('[data-libeditdel]');
  if(libDel){
    const item = USE_CASE_LIBRARY.find(x=>x.id===libDel.dataset.libeditdel);
    if(item && confirm(`Delete "${item.title||'this use case'}" from the library?\n\nExisting assessments that already added this use case keep their copies — only new assessments are affected.`)){
      libDeleteItem(libDel.dataset.libeditdel); renderLibraryEditor();
    }
    return;
  }
  const libRem=e.target.closest('[data-libeditremcap]');
  if(libRem){ libToggleCap(libRem.dataset.lib, libRem.dataset.cap); renderLibraryEditor(); return; }
  const libAddCap=e.target.closest('[data-libeditaddcap]');
  if(libAddCap){ toggleLibCapPicker(libAddCap); return; }
  const libPick=e.target.closest('[data-libeditpick]');
  if(libPick){
    const libId=libPick.dataset.lib;
    libToggleCap(libId, libPick.dataset.cap);
    renderLibraryEditor();
    const btn=document.querySelector(`[data-libeditaddcap="${libId}"]`); if(btn) toggleLibCapPicker(btn);
    return;
  }
  if(e.target.closest('[data-libeditpickclose]')){ closeUCCapPickers(); return; }

  const noteBtn=e.target.closest('[data-note]'); if(noteBtn&&editMode){showRatEdit(noteBtn);return;}
  const ratCell=e.target.closest('[data-rat]'); if(ratCell&&!editMode){
    if(ratPinned==='cell'&&currentRatCell===ratCell){hideRat();} else {showRatView(ratCell);ratPinned='cell';currentRatCell=ratCell;} return;}
  const ph=e.target.closest('[data-pillar]'); if(ph){const k=ph.dataset.pillar;
    if(collapsedPillars.has(k))collapsedPillars.delete(k);else collapsedPillars.add(k);
    ph.parentElement.classList.toggle('collapsed');return;}
  const mb=e.target.closest('.moscow button'); if(mb){S.moscow[mb.parentElement.dataset.cap]=mb.dataset.on;renderLive();_markChanged();return;}
  const tog=e.target.closest('[data-tog]'); if(tog){const sid=tog.dataset.tog,pl=tog.dataset.pl;
    SUBIDX[sid].sub.sup[pl]=!SUBIDX[sid].sub.sup[pl]; renderMatrix();renderAgg();renderScoreboard();renderProfiles();updateSupportLabels();return;}
  const addrow=e.target.closest('[data-addrow]'); if(addrow){const cap=findCap(addrow.dataset.addrow);
    const id='sx'+(++subCounter); const supObj={};PLATFORMS.forEach(pl=>supObj[pl.id]=false);
    cap.subs.push({id,q:'New sub-capability — describe a distinguishing requirement',sup:supObj,rat:{},retired:false});
    S.needs[id]=true; reindex(); collapsedPillars.delete(SUBIDX[id].pkey);
    pendingFocus=`[data-sublbl="${id}"]`; renderAll(); return;}
  const retirerow=e.target.closest('[data-retirerow]'); if(retirerow){const sid=retirerow.dataset.retirerow;
    const info=SUBIDX[sid]; if(info){info.sub.retired=!info.sub.retired;} renderAll(); return;}
  const addcap=e.target.closest('[data-addcap]'); if(addcap){const p=findPillar(addcap.dataset.addcap);
    const id='C'+(++capCounter); p.caps.push({id,title:'New capability',def:'',subs:[],retired:false});
    S.moscow[id]='should'; reindex(); collapsedPillars.delete(p.key);
    pendingFocus=`[data-ctitle="${id}"]`; renderAll(); return;}
  const retirecap=e.target.closest('[data-retirecap]'); if(retirecap){const cap=findCap(retirecap.dataset.retirecap);
    if(cap){cap.retired=!cap.retired;} renderAll(); return;}
  const retirepil=e.target.closest('[data-retirepillar]'); if(retirepil){const p=findPillar(retirepil.dataset.retirepillar);
    if(p){p.retired=!p.retired;} renderAll(); return;}
  const prt=e.target.closest('[data-plretire]'); if(prt){const p=PLATFORMS.find(x=>x.id===prt.dataset.plretire);
    if(active().length<=2){alert('Keep at least two active vendors to compare.');return;}
    if(p)p.retired=true; renderAll(); return;}
  const prs=e.target.closest('[data-plrestore]'); if(prs){const p=PLATFORMS.find(x=>x.id===prs.dataset.plrestore); if(p)p.retired=false; renderAll(); return;}
  // ----- admin-only hard delete (only rendered when ?admin=<token> unlocks it) -----
  if(adminDelete){
    const dpil=e.target.closest('[data-delpillar]'); if(dpil){const p=findPillar(dpil.dataset.delpillar);
      if(p&&confirm(`Permanently delete pillar “${p.name}” and all its capabilities and sub-capabilities?\n\nThis removes them from scoring in every assessment and cannot be undone. Use Retire instead to keep the data.`)){ deletePillar(dpil.dataset.delpillar); renderAll(); } return;}
    const dcap=e.target.closest('[data-delcap]'); if(dcap){const cap=findCap(dcap.dataset.delcap);
      if(cap&&confirm(`Permanently delete capability “${cap.title}” and its sub-capabilities?\n\nIt will also be unmapped from any use cases. This cannot be undone. Use Retire instead to keep the data.`)){ deleteCap(dcap.dataset.delcap); renderAll(); } return;}
    const drow=e.target.closest('[data-delrow]'); if(drow){const info=SUBIDX[drow.dataset.delrow];
      if(info&&confirm(`Permanently delete this sub-capability?\n\n“${info.sub.q}”\n\nThis cannot be undone. Use Retire instead to keep the data.`)){ deleteSub(drow.dataset.delrow); renderAll(); } return;}
    const dven=e.target.closest('[data-pldelete]'); if(dven){const p=PLATFORMS.find(x=>x.id===dven.dataset.pldelete);
      if(PLATFORMS.length<=2){alert('Keep at least two vendors to compare.');return;}
      if(p&&confirm(`Permanently delete vendor “${p.name}” and all of its support ratings and SME notes?\n\nThis cannot be undone. Use Retire instead to keep the data.`)){ deleteVendor(dven.dataset.pldelete); renderAll(); } return;}
  }
  if(e.target.id==='addVendorBtn'){const name=(prompt('New vendor name (e.g., Heap):')||'').trim(); if(!name)return;
    const id='v'+(++vendorCounter); const code=name.length<=12?name:name.slice(0,12);
    PLATFORMS.push({id,name,code,custom:true});
    RUBRIC.forEach(p=>p.caps.forEach(c=>c.subs.forEach(s=>{s.sup[id]=false;})));
    reindex();renderAll();return;}
  if(e.target.id==='addPillarBtn'){const key='P'+(++pillarCounter);
    RUBRIC.push({key,name:'New pillar',caps:[],retired:false}); reindex();
    pendingFocus=`[data-pname="${key}"]`; renderAll(); return;}
});
document.addEventListener('click',e=>{ if(e.target.closest('#ratPop')||e.target.closest('[data-rat]')||e.target.closest('[data-note]'))return; if(ratPinned)hideRat(); });
document.addEventListener('mouseover',e=>{ if(editMode||ratPinned)return; const c=e.target.closest('[data-rat]'); if(c){clearTimeout(ratHideTimer);showRatView(c);} });
document.addEventListener('mouseout',e=>{ if(editMode||ratPinned)return; const c=e.target.closest('[data-rat]'); if(c){ratHideTimer=setTimeout(hideRat,140);} });

document.addEventListener('change',e=>{
  if(e.target.matches('[data-need]')){S.needs[e.target.dataset.need]=e.target.checked;renderLive();_markChanged();}
});
// ===== tab switching =====
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===t));
  document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===t.dataset.tab));
  hideRat(); closeUCCapPickers(); window.scrollTo({top:0,behavior:'smooth'});
}));
document.addEventListener('blur',e=>{
  if(e.target.matches('[data-libedittitle]')){const id=e.target.dataset.libedittitle, it=USE_CASE_LIBRARY.find(x=>x.id===id);
    if(it){ it.title=e.target.textContent.trim(); _markLibChanged(); }
    return;}
  if(e.target.matches('[data-libeditdesc]')){const id=e.target.dataset.libeditdesc, it=USE_CASE_LIBRARY.find(x=>x.id===id);
    if(it){ it.desc=e.target.textContent.trim(); _markLibChanged(); }
    return;}
  if(e.target.matches('[data-uctitle]')){const id=e.target.dataset.uctitle,uc=S.useCases.find(u=>u.id===id);
    if(uc){ uc.title=e.target.textContent.trim(); _markChanged(); renderFramework(); renderUseCaseCoverage(); }
    return;}
  if(e.target.matches('[data-ucdesc]')){const id=e.target.dataset.ucdesc,uc=S.useCases.find(u=>u.id===id);
    if(uc){ uc.desc=e.target.textContent.trim(); _markChanged(); }
    return;}
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
// ===== drag-to-reorder pillars (admin matrix only) =====
// Reordering RUBRIC re-letters pillars by position (letters are positional), which
// is intentional — it only affects display order and report labels, never ids.
document.addEventListener('dragstart',e=>{const ph=e.target.closest('[data-pdrag]'); if(!ph||!editMode)return;
  pillarDragKey=ph.dataset.pdrag; e.dataTransfer.effectAllowed='move'; const card=ph.closest('.pillar-card'); if(card)card.classList.add('pillar-dragging');});
document.addEventListener('dragover',e=>{ if(!pillarDragKey)return; const card=e.target.closest('.pillar-card'); if(!card)return; e.preventDefault();
  document.querySelectorAll('.pillar-card.pillar-drop').forEach(x=>{if(x!==card)x.classList.remove('pillar-drop');});
  if(card.dataset.pcard!==pillarDragKey)card.classList.add('pillar-drop');});
document.addEventListener('drop',e=>{ if(!pillarDragKey)return; const card=e.target.closest('.pillar-card'); e.preventDefault();
  if(card&&card.dataset.pcard&&card.dataset.pcard!==pillarDragKey){
    const from=RUBRIC.findIndex(p=>p.key===pillarDragKey);
    if(from>=0){const [m]=RUBRIC.splice(from,1); const to=RUBRIC.findIndex(p=>p.key===card.dataset.pcard); RUBRIC.splice(to,0,m); reindex();}}
  pillarDragKey=null; renderAll();});
document.addEventListener('dragend',()=>{pillarDragKey=null; document.querySelectorAll('.pillar-dragging,.pillar-drop').forEach(x=>x.classList.remove('pillar-dragging','pillar-drop'));});
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
RUBRIC=buildRubric(); normalizeRubric(); reindex(); S=defaultState();
// Issue: on a Supabase-backed page the seed rubric used to paint first and then
// get replaced by the real rubric a moment later (a visible flash of stale data).
// When Supabase is configured we now show a brief placeholder and let db.js own
// the first paint via loadRubricData / applySelections. Offline: paint the seed now.
function showRubricLoading(){
  ['framework','mtxTable','libEditor'].forEach(id=>{const e=document.getElementById(id); if(e)e.innerHTML='<div class="rubric-loading">Loading rubric…</div>';});
}
(function _initialPaint(){
  const cfg=window.APP_CONFIG||{};
  if(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) showRubricLoading();
  else renderAll();
})();

// ===== integration API for the persistence layer (js/db.js) =====
function _setVendorCounter(){vendorCounter=PLATFORMS.reduce((m,p)=>{const n=/^v(\d+)$/.exec(p.id);return n?Math.max(m,+n[1]):m;},0);}
function _setUseCaseCounter(){useCaseCounter=(S.useCases||[]).reduce((m,u)=>{const n=/^uc(\d+)$/.exec(u.id||'');return n?Math.max(m,+n[1]):m;},0);}
// Re-derive the id counters from the loaded rubric so newly-added pillars,
// capabilities and sub-capabilities never reuse an id that already exists in
// the saved data. (Previously these reset to 0 / 15 every load, so each session
// re-minted P1, C16, sx1… — colliding with whatever was already saved. That
// single omission caused the duplicate pillar letters, the "+ Capability adds to
// Pillar A" misrouting, and the sub-capability retire toggling the wrong row.)
function _setPillarCounter(){ pillarCounter=RUBRIC.reduce((m,p)=>{const n=/^P(\d+)$/.exec(p.key||'');return n?Math.max(m,+n[1]):m;},0); }
function _setCapCounter(){ let m=15; RUBRIC.forEach(p=>p.caps.forEach(c=>{const n=/^C(\d+)$/.exec(c.id||'');if(n)m=Math.max(m,+n[1]);})); capCounter=m; }
function _setSubCounter(){ let m=0; RUBRIC.forEach(p=>p.caps.forEach(c=>c.subs.forEach(s=>{const n=/^sx(\d+)$/.exec(s.id||'');if(n)m=Math.max(m,+n[1]);}))); subCounter=m; }
function _syncCounters(){ _setVendorCounter(); _setPillarCounter(); _setCapCounter(); _setSubCounter(); }

// One-time repair for rubrics already saved with duplicate/blank ids. Runs on
// every load; it only touches items whose id/key collides with one seen earlier,
// so a healthy rubric is left untouched (returns false). Must run AFTER the
// counters are synced so replacement ids sort above every existing one. The first
// occurrence of a duplicate keeps its id (matching the bulk of existing
// references); later occurrences are re-minted. Returns true if anything changed.
function repairRubric(){
  let changed=false;
  const pKeys=new Set();
  RUBRIC.forEach(p=>{ if(!p.key||pKeys.has(p.key)){ p.key='P'+(++pillarCounter); changed=true; } pKeys.add(p.key); });
  const capIds=new Set();
  RUBRIC.forEach(p=>p.caps.forEach(c=>{ if(!c.id||capIds.has(c.id)){ c.id='C'+(++capCounter); changed=true; } capIds.add(c.id); }));
  const subIds=new Set();
  RUBRIC.forEach(p=>p.caps.forEach(c=>c.subs.forEach(s=>{ if(!s.id||subIds.has(s.id)){ s.id='sx'+(++subCounter); changed=true; } subIds.add(s.id); })));
  return changed;
}

// ===== admin-only hard delete (gated by ?admin=<ADMIN_DELETE_TOKEN>) =====
// Everyone else only has Retire, which preserves data. Delete is irreversible
// and strips the item (and its references) from scoring across every assessment.
function deletePillar(key){ RUBRIC=RUBRIC.filter(p=>p.key!==key); reindex(); _markChanged(); }
function deleteCap(id){
  RUBRIC.forEach(p=>{ p.caps=p.caps.filter(c=>c.id!==id); });
  delete S.moscow[id];
  USE_CASE_LIBRARY.forEach(it=>{ if(it.caps) it.caps=it.caps.filter(cid=>cid!==id); });
  (S.useCases||[]).forEach(u=>{ if(u.capIds) u.capIds=u.capIds.filter(cid=>cid!==id); });
  reindex(); _markChanged();
}
function deleteSub(id){
  RUBRIC.forEach(p=>p.caps.forEach(c=>{ c.subs=c.subs.filter(s=>s.id!==id); }));
  delete S.needs[id];
  reindex(); _markChanged();
}
function deleteVendor(id){
  PLATFORMS=PLATFORMS.filter(p=>p.id!==id);
  RUBRIC.forEach(p=>p.caps.forEach(c=>c.subs.forEach(s=>{ delete s.sup[id]; if(s.rat) delete s.rat[id]; })));
  reindex(); _markChanged();
}

window.PET={
  exportData:()=>({platforms:PLATFORMS,rubric:RUBRIC,useCases:USE_CASE_LIBRARY,selections:{moscow:S.moscow,needs:S.needs,useCases:S.useCases}}),
  exportRubric:()=>({platforms:PLATFORMS,rubric:RUBRIC,useCases:USE_CASE_LIBRARY}),
  importData:(d)=>{ if(!d)return; if(Array.isArray(d.platforms)&&d.platforms.length)PLATFORMS=d.platforms;
    RUBRIC=d.rubric?d.rubric:buildRubric(); normalizeRubric();
    if(Array.isArray(d.useCases)) USE_CASE_LIBRARY = d.useCases;
    _syncCounters(); repairRubric(); reindex();
    const base=defaultState(); const sel=d.selections||{};
    S={moscow:{...base.moscow,...(sel.moscow||{})},needs:{...base.needs,...(sel.needs||{})},useCases:Array.isArray(sel.useCases)?sel.useCases:[]};
    _setUseCaseCounter(); collapsedPillars.clear(); renderAll(); },
  loadRubricData:(d)=>{ if(!d)return false; if(Array.isArray(d.platforms)&&d.platforms.length)PLATFORMS=d.platforms;
    RUBRIC=d.rubric?d.rubric:buildRubric(); normalizeRubric();
    if(Array.isArray(d.useCases)) USE_CASE_LIBRARY = d.useCases;
    _syncCounters(); const repaired=repairRubric(); reindex();
    S=defaultState(); collapsedPillars.clear(); renderAll(); renderLibraryEditor();
    return repaired; }
};
window.PET.applySelections=(sel)=>{
  const base=defaultState();
  S={
    moscow:{...base.moscow,...((sel&&sel.moscow)||{})},
    needs:{...base.needs,...((sel&&sel.needs)||{})},
    useCases:Array.isArray(sel&&sel.useCases)?sel.useCases:[]
  };
  _setUseCaseCounter();
  collapsedPillars.clear();
  renderAll();
};
window.PET.getSelections=()=>({moscow:S.moscow,needs:S.needs,useCases:S.useCases});
window.PET.setEditMode=(b)=>{editMode=!!b;renderMatrix();};
window.PET.renderLibraryEditor=()=>renderLibraryEditor();
document.dispatchEvent(new Event('pet-ready'));