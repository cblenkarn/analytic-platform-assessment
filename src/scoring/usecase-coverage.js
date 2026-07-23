// ── Use-case coverage + ranking (pure) ────────────────────────────────────
import { store } from '../model/state.js';
import { findCap } from '../model/rubric.js';
import { active, capInScope, onSubs } from './coverage.js';
import { compute } from './fit.js';

// Coverage for one use case × platform, aggregated across its mapped, in-scope
// capabilities (Won't capabilities excluded).
export function useCaseCoverage(uc, plId) {
  const capIds = uc.capIds || [];
  let sup = 0, total = 0, capsScoped = 0, capsFullyMet = 0;
  capIds.forEach(cid => {
    const c = findCap(cid); if (!c) return;
    if (!capInScope(c)) return;
    const on = onSubs(c); if (!on.length) return;
    capsScoped++; total += on.length;
    const s = on.filter(x => !!x.sup[plId]).length; sup += s;
    if (s === on.length) capsFullyMet++;
  });
  return { sup, total, capsScoped, capsFullyMet, cov: total ? sup / total : 0, scoped: capsScoped > 0 };
}

// Rank platforms by ability to deliver the captured use cases:
// most fully delivered → highest average coverage → weighted fit tie-break.
export function useCaseRanking() {
  const useCases = store.S.useCases || [];
  const fitRows = compute(); const fitMap = {}; fitRows.forEach(r => fitMap[r.id] = r.fit);
  return active().map(pl => {
    let full = 0, part = 0, none = 0, sumCov = 0, ucInScope = 0;
    useCases.forEach(uc => {
      const cv = useCaseCoverage(uc, pl.id); if (!cv.scoped) return;
      ucInScope++; sumCov += cv.cov;
      if (cv.cov >= 0.999) full++; else if (cv.cov > 0) part++; else none++;
    });
    return { ...pl, full, part, none, ucInScope, avgCov: ucInScope ? sumCov / ucInScope : 0, fit: fitMap[pl.id] || 0 };
  }).sort((a, b) => b.full - a.full || b.avgCov - a.avgCov || b.fit - a.fit);
}
