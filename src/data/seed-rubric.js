// ── Seed rubric (FIRST-RUN / OFFLINE fallback only) ───────────────────────
// The canonical rubric lives in Supabase (rubric_pillars — one row per pillar). This SEED is only
// written to the DB once, if the master row does not yet exist, and is used
// offline. Vendor support is authored positionally against SEED_ORDER
// (see data/platforms.js); model/rubric.buildRubric() converts it to the
// keyed { <vendorId>: bool } format used at runtime and in the database.
//
// Consultants can safely edit copy here; it does not affect a populated DB.

export const SEED = [
  { letter: 'A', name: 'Data Collection Architecture & Engineering', caps: [
    { id: 'C1', title: 'Cross-platform Collection & Schema Control', def: 'Captures web, app and server-side under one flexible, governed schema rather than a rigid predefined taxonomy.', subs: [
      { id: 'C1a', q: 'Fully customizable event schema, not a fixed taxonomy (no eVar/prop-style constraints)', s: [1,0,1,1,1,0] },
      { id: 'C1b', q: 'Server-side / Measurement Protocol ingestion for first-party data durability', s: [1,1,1,1,1,0] },
      { id: 'C1c', q: 'Built-in schema governance / data dictionary to stop tag drift across teams', s: [0,1,1,1,1,0] },
    ]},
    { id: 'C2', title: 'Auto-capture (Codeless Collection)', def: 'Captures front-end interactions with no upfront tagging, so events can be defined retroactively — trading schema discipline for speed.', subs: [
      { id: 'C2a', q: 'Auto-captures clicks and views with zero upfront tagging', s: [0,0,0,0,1,1] },
      { id: 'C2b', q: 'Define new events retroactively against historical auto-captured data', s: [0,0,0,0,1,1] },
    ]},
    { id: 'C3', title: 'Identity Resolution & Cross-device Stitching', def: 'Unifies anonymous and known activity into one durable profile — strongest where built on a dedicated identity graph.', subs: [
      { id: 'C3a', q: 'Deterministic cross-device stitching on a persistent identity graph', s: [1,1,1,1,1,0] },
      { id: 'C3b', q: 'Retroactively binds prior anonymous sessions to the user on login', s: [0,0,0,1,1,0] },
    ]},
    { id: 'C4', title: 'Implementation & Migration Effort', def: 'How fast it deploys via the existing TMS and how much re-modeling it forces on a team already running GA4 / GTM.', subs: [
      { id: 'C4a', q: 'Low migration effort from an existing GA4/GTM setup (similar data model)', s: [1,0,1,0,1,1] },
      { id: 'C4b', q: 'Lightweight footprint — minimal Core Web Vitals / performance impact', s: [1,0,1,0,1,1] },
    ]},
  ]},
  { letter: 'B', name: 'Core Analytics & Behavioral Insights', caps: [
    { id: 'C5', title: 'In-platform Analytical Depth', def: 'Whether a senior analyst can answer the why inside the UI, or has to export to a warehouse first. The clearest GA4 pain point.', subs: [
      { id: 'C5a', q: 'Robust ad-hoc exploration in-UI without exporting to a warehouse', s: [0,1,1,1,1,1] },
      { id: 'C5b', q: 'Free-form drag-and-drop exploratory workspace (Analysis Workspace-class)', s: [0,1,0,1,1,1] },
      { id: 'C5c', q: 'Familiar to UA-trained analysts — low retraining curve', s: [1,0,1,0,0,0] },
    ]},
    { id: 'C6', title: 'Funnel, Path & Session Analysis', def: 'Reconstructs journeys and drop-off, with qualitative replay where the quantitative signal needs explaining.', subs: [
      { id: 'C6a', q: 'Retroactive ordered/unordered funnels on historical data', s: [0,1,1,1,1,1] },
      { id: 'C6b', q: 'Native session replay / heatmaps tied to the quantitative drop-off', s: [0,0,0,0,0,1] },
      { id: 'C6c', q: 'Open-ended pathing that surfaces unexpected detours (not just predefined funnels)', s: [0,1,0,1,1,0] },
    ]},
    { id: 'C7', title: 'Cohort & Retention Analysis', def: 'Behavioral segmentation and lifecycle value — the product-analytics core, where Amplitude-class tools lead.', subs: [
      { id: 'C7a', q: 'Complex behavioral cohorts — did X but not Y within N days', s: [0,1,0,1,1,0] },
      { id: 'C7b', q: 'N-day, unbounded and rolling retention curves out of the box', s: [0,0,0,1,1,0] },
    ]},
    { id: 'C8', title: 'In-platform ML / AI', def: 'Native intelligence layered on the behavioral data — predictive, anomaly and assisted analysis, not nice-to-have dashboards.', subs: [
      { id: 'C8a', q: 'Anomaly detection / contribution analysis on key metrics', s: [1,1,0,1,1,1] },
      { id: 'C8b', q: 'Predictive metrics & audiences out of the box (churn / purchase propensity)', s: [1,0,0,0,1,0] },
      { id: 'C8c', q: 'Natural-language querying / AI assistant (e.g., Ask Amplitude, Adobe AI Assistant)', s: [0,1,0,0,1,0] },
    ]},
  ]},
  { letter: 'C', name: 'Ecosystem & Activation', caps: [
    { id: 'C9', title: 'Google Marketing Platform Integration', def: 'Real two-way value with the Google stack. In practice only GA4 clears the bar for activation, not just import.', subs: [
      { id: 'C9a', q: 'Reliable audience export/activation to Google Ads for bidding (not just import)', s: [1,0,0,0,0,0] },
      { id: 'C9b', q: 'Native Google Search Console / GMP reporting integration', s: [1,0,0,0,0,0] },
    ]},
    { id: 'C10', title: 'Third-party Integrations & Activation', def: 'Breadth and ease of connectors to CDP, CRM, email and non-Google suites — and how much developer effort each takes.', subs: [
      { id: 'C10a', q: 'Large library of point-and-click activation / destination connectors', s: [0,0,1,1,1,1] },
      { id: 'C10b', q: 'Native reverse-ETL / audience activation to CRM & CDP', s: [0,0,0,1,1,0] },
    ]},
    { id: 'C11', title: 'A/B Testing & Personalization', def: 'Whether experimentation lives natively in the platform, or requires buying and wiring a separate tool (Optimizely, VWO, AB Tasty).', subs: [
      { id: 'C11a', q: 'Native experimentation / personalization engine — no separate purchase', s: [0,1,0,0,1,0] },
      { id: 'C11b', q: 'Target live variants directly by behavioral cohort from the analytics', s: [0,1,0,0,1,0] },
    ]},
    { id: 'C12', title: 'Warehousing & BI Reporting', def: 'Getting raw, unsampled event data into the warehouse and trusted BI dashboards without row caps.', subs: [
      { id: 'C12a', q: 'Raw, unsampled, event-level export (no row or calculation caps)', s: [1,1,1,1,1,0] },
      { id: 'C12b', q: 'Native connectors to BigQuery / Snowflake / Databricks', s: [1,0,1,1,1,0] },
      { id: 'C12c', q: 'Direct reporting integration with BI tools (Tableau, Power BI)', s: [1,1,1,1,1,0] },
    ]},
  ]},
  { letter: 'D', name: 'Operations, Governance & Commercials', caps: [
    { id: 'C13', title: 'Data Privacy, Consent & Governance', def: 'Fitness for a consent-driven, privacy-sensitive, potentially PHI-adjacent environment.', subs: [
      { id: 'C13a', q: 'Will sign a BAA / supports PHI under HIPAA', s: [0,0,1,0,1,0] },
      { id: 'C13b', q: 'Guaranteed regional data residency (e.g., EU storage)', s: [0,1,1,1,1,0] },
      { id: 'C13c', q: 'Native OneTrust consent integration + Consent Mode v2 / server-side enforcement', s: [1,1,1,1,1,0] },
      { id: 'C13d', q: 'Granular, country/region-level governance controls', s: [1,1,1,1,1,0] },
    ]},
    { id: 'C14', title: 'Reliability, Stability & Maintenance', def: 'Whether it stays accurate and low-touch, or taxes engineering with breaking changes and re-tagging.', subs: [
      { id: 'C14a', q: 'Strong uptime track record / contractual SLA', s: [0,1,1,1,1,1] },
      { id: 'C14b', q: 'Low frequency of schema-breaking platform changes / forced re-tagging', s: [0,1,1,1,1,1] },
    ]},
    { id: 'C15', title: 'Pricing & Commercial Model', def: 'Predictability and exposure to volume-driven cost spikes — the live concern with usage-based models.', subs: [
      { id: 'C15a', q: 'Predictable pricing not driven by fluctuating event / MTU volume', s: [0,0,1,0,0,1] },
      { id: 'C15b', q: 'Full-featured free / sandbox tier for development', s: [1,0,0,0,1,0] },
    ]},
  ]},
];
