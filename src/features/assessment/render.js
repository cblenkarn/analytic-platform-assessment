// ── Assessment render composers ───────────────────────────────────────────
// The assessment page's full-build and live-update pipelines, composed from
// the per-tab view modules. Registered on the render bus by the entry; the
// live variant is called by tab event handlers.
import { renderFramework, syncFrameworkState } from './tab-prioritization/framework.view.js';
import { renderScoreboard } from './tab-results/scoreboard.view.js';
import { renderAgg } from './tab-results/pillar-agg.view.js';
import { renderProfiles } from './tab-results/profiles.view.js';
import { renderUseCaseCoverage } from './tab-results/usecase-coverage.view.js';
import { renderUseCases } from './tab-usecases/usecases.view.js';

// Full build (initial load / data reload): builds the framework DOM once.
export function renderAssessmentAll() {
  renderUseCases();
  renderFramework();
  renderScoreboard();
  renderAgg();
  renderProfiles();
  renderUseCaseCoverage();
}

// Live update (priority / need change): sync framework in place (don't rebuild,
// so open refine panels survive) + recompute results.
export function renderAssessmentLive() {
  syncFrameworkState();
  renderAgg();
  renderScoreboard();
  renderProfiles();
  renderUseCaseCoverage();
}
