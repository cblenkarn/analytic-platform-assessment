// ── Seed SME rationale (FIRST-RUN fallback only) ──────────────────────────
// Attached to sub-capabilities at build time by model/rubric.buildRubric via
// cloneRat(). Canonical rationale is edited in the admin matrix and stored in
// Supabase (rubric_pillars, nested per sub-capability). Keyed by sub-capability id → vendor id.

export const RAT = {
  C1a: { aa:{ note:'Historically rigid eVar/prop model constrains free-form schema design.', tone:'con', conf:'med' } },
  C2a: { cs:{ note:'Auto-capture removes the tagging backlog entirely.', tone:'pro', conf:'high' }, amp:{ note:'Autocapture plus the ability to define events retroactively.', tone:'pro' } },
  C5a: { ga4:{ note:'Reports and Explore are limited; real analysis means exporting to BigQuery first.', tone:'con', conf:'high' } },
  C5b: { aa:{ note:'Analysis Workspace is best-in-class for free-form, drag-and-drop analysis.', tone:'pro', conf:'high' }, amp:{ note:'Comparable exploratory depth for product analytics.', tone:'pro' } },
  C5c: { piano:{ note:'If you liked the Universal Analytics UI, you will like Piano — minimal retraining.', tone:'pro', conf:'high' } },
  C6b: { cs:{ note:'Best-in-class session replay, heatmaps and zoning tied to the quantitative drop-off.', tone:'pro', conf:'high' } },
  C8b: { amp:{ note:'Predictive churn / conversion propensity available out of the box.', tone:'pro' }, ga4:{ note:'Native predictive metrics and predictive audiences.', tone:'pro' } },
  C9a: { ga4:{ note:'Only GA4 reliably activates audiences to Google Ads for bidding.', tone:'pro', conf:'high' }, aa:{ note:'Can push to GMP but subject to match-rate limits — not reliable for bidding.', tone:'con' }, amp:{ note:'GMP push exists but is match-rate limited.', tone:'con' } },
  C11a:{ aa:{ note:'Adobe Target integrates natively and is considered best-in-class.', tone:'pro', conf:'high' }, amp:{ note:'Native experimentation — rare among analytics platforms.', tone:'pro', conf:'high' }, ga4:{ note:'Requires buying and wiring a separate tool (Optimizely, VWO, AB Tasty).', tone:'con' } },
  C12a:{ cs:{ note:'No raw, unsampled warehouse export pipeline.', tone:'con' } },
  C13a:{ ga4:{ note:'Will not sign a BAA; cannot receive PHI — disqualifying for regulated health data.', tone:'con', conf:'high' }, piano:{ note:'HIPAA compliant and will sign a BAA.', tone:'pro', conf:'high' }, amp:{ note:'Will sign BAAs as needed; EU data centers in Frankfurt.', tone:'pro' } },
  C15a:{ aa:{ note:'Variable, usage-based pricing tends to run expensive.', tone:'con' }, ga4:{ note:'Usage-based, but exposure is mitigable with an upfront commitment.', tone:'note' } },
};
