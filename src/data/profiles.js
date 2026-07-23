// ── General platform profile text (Results tab reference blocks) ──────────
// Keyed by vendor id. Editable copy; not scoring-affecting.

export const PROS = {
  ga4:  ['Free tier + native BigQuery export — strongest cost-to-value','Only platform with reliable audience activation to Google Ads','Ubiquitous skills base; GTM-native, lowest implementation lift'],
  aa:   ['Analysis Workspace is best-in-class for ad-hoc analysis','Native Adobe Target for experimentation & personalization','Mature Attribution IQ and enterprise governance'],
  piano:['UA-like UI — minimal retraining for existing teams','Privacy-first: EU residency, HIPAA, will sign a BAA','Solid in-platform analysis without a warehouse'],
  cja:  ['Cross-channel identity stitching on AEP','Workspace-grade analysis over a full data lake','Ingests any online/offline schema'],
  amp:  ['Best-in-class cohort, retention, funnel and pathing','Native experimentation — rare among analytics tools','Broad activation ecosystem; BAA + EU data centers'],
  cs:   ['Best-in-class session replay, heatmaps and zoning','Auto-capture removes the tagging backlog','Auto-generated experience / frustration insights'],
};

export const CONS = {
  ga4:  ['In-platform analysis is limiting — real analysis needs BigQuery','Will not sign a BAA — unfit for PHI / regulated data','Usage-based pricing and frequent platform churn'],
  aa:   ['Rigid eVar/prop model — higher migration effort from GA4','No native autocapture; steeper analyst learning curve','Expensive, variable commercial model'],
  piano:['Lighter on experimentation (Composer is paywall-focused)','Smaller activation ecosystem than Google / Adobe','Weaker predictive / ML tooling'],
  cja:  ['Premium AEP-based total cost of ownership','No native autocapture or experimentation','Implementation depends on AEP data engineering'],
  amp:  ['Event-volume pricing can spike at scale','Google-stack integration not comparable to GA4','Not a session-replay or compliance-first platform'],
  cs:   ['Weak cross-device identity and attribution','No raw warehouse export pipeline','Screen recording raises privacy questions'],
};
