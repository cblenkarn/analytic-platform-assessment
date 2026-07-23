// ── Seed use-case library (FIRST-RUN fallback only) ───────────────────────
// Canonical library is edited on /usecases and stored in its own Supabase
// table (use_case_library — one row per item). Each entry is pre-mapped to
// the capability ids that typically deliver it.

export const USE_CASE_LIBRARY = [
  { id:'lib-attribution',    title:'Cross-channel marketing attribution',                desc:'Understand how paid, owned and earned channels contribute to conversion so spend can be reallocated to real incremental value.', caps:['C1','C9','C10','C12'] },
  { id:'lib-journey',        title:'Cross-device customer journey',                      desc:'Follow prospects from anonymous to known across devices and sessions to see the real path to conversion, not one-session snapshots.', caps:['C1','C3','C6'] },
  { id:'lib-funnel',         title:'Funnel drop-off diagnosis',                          desc:'Locate where users abandon a critical flow (checkout, signup, application) and understand qualitatively what they do instead.', caps:['C6','C2'] },
  { id:'lib-adoption',       title:'Product feature adoption',                           desc:'Measure how quickly and deeply new features are adopted, and how usage changes core outcomes (activation, revenue, retention).', caps:['C2','C5','C7'] },
  { id:'lib-retention',      title:'Retention & churn analysis',                         desc:'Track how well cohorts stick, identify leading indicators of churn and quantify the impact of interventions.', caps:['C7','C8'] },
  { id:'lib-predictive',     title:'Predictive audiences (churn / propensity / LTV)',    desc:'Score users on likelihood to churn, convert or spend so marketing can act upstream of the outcome, not after it.', caps:['C8','C10','C12'] },
  { id:'lib-experimentation',title:'A/B testing & personalization',                      desc:'Run controlled experiments and target variants to the behavioural cohorts most likely to respond.', caps:['C11','C7'] },
  { id:'lib-activation',     title:'Audience activation to paid media',                  desc:'Push behavioural segments to Google, Meta, CRM and CDP for suppression, retargeting and lookalike modelling.', caps:['C9','C10','C3'] },
  { id:'lib-friction',       title:'UX friction & rage-click diagnosis',                 desc:'Identify pages and interactions where users struggle, and understand qualitatively what breaks the experience.', caps:['C6','C2'] },
  { id:'lib-selfserve',      title:'Ad-hoc analyst self-serve',                          desc:'Enable senior analysts to answer new questions directly in the platform without engineering or warehouse export.', caps:['C5'] },
  { id:'lib-bi',             title:'Executive KPI dashboards in BI',                     desc:'Deliver a single, trusted view of business KPIs to leadership in the enterprise BI tool (Tableau, Power BI, Looker).', caps:['C12'] },
  { id:'lib-privacy',        title:'Consent-compliant measurement',                      desc:'Maintain durable measurement under GDPR / CCPA consent flows and Consent Mode v2 without losing signal to opt-outs.', caps:['C13','C1'] },
  { id:'lib-phi',            title:'HIPAA / PHI-safe measurement',                       desc:'Collect and analyse behavioural data on regulated properties where the vendor must sign a BAA and PHI is possible.', caps:['C13'] },
  { id:'lib-firstparty',     title:'First-party data foundation',                        desc:'Establish a governed first-party event schema and identity spine that feeds CDP, activation and warehouse downstream.', caps:['C1','C3','C12','C10'] },
  { id:'lib-content',        title:'Content & landing page performance',                 desc:'Measure engagement and conversion contribution of content and campaign landing pages by cohort.', caps:['C5','C6'] },
  { id:'lib-onboarding',     title:'Onboarding funnel optimization',                     desc:'Measure and improve first-time user activation from signup through the "aha moment" and habit-forming actions.', caps:['C6','C7','C11'] },
];
