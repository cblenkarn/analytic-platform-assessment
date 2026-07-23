// ── Weighted-fit score + pillar aggregation (pure) ────────────────────────
import { store } from '../model/state.js';
import { MOSCOW_W } from '../data/platforms.js';
import { active, capInScope, onSubs, scopedCaps, coverage } from './coverage.js';

// Weighted fit per platform. A Must with zero coverage disqualifies (dq) the
// platform rather than merely deducting points.
export function compute() {
  const caps = scopedCaps();
  const wsum = caps.reduce((a, x) => a + x.w, 0);
  return active().map(pl => {
    let acc = 0, metCaps = 0; const mustGaps = [];
    caps.forEach(({ c, on, w }) => {
      const cv = coverage(pl.id, c, on); acc += w * cv.cov; if (cv.sup > 0) metCaps++;
      if (store.S.moscow[c.id] === 'must' && cv.sup === 0) mustGaps.push(c.title);
    });
    return { ...pl, fit: wsum ? Math.round(100 * acc / wsum) : 0, capCount: caps.length, metCaps, mustGaps, dq: mustGaps.length > 0 };
  }).sort((a, b) => (a.dq ? 1 : 0) - (b.dq ? 1 : 0) || b.fit - a.fit || b.metCaps - a.metCaps);
}

export function pillarAgg() {
  const out = {};
  store.RUBRIC.forEach(p => {
    const caps = p.caps.filter(c => capInScope(c) && onSubs(c).length);
    const wsum = caps.reduce((a, c) => a + MOSCOW_W[store.S.moscow[c.id]], 0);
    out[p.key] = { inScope: caps.length > 0, retired: !!p.retired };
    active().forEach(pl => {
      if (!caps.length) { out[p.key][pl.id] = null; return; }
      let acc = 0; caps.forEach(c => { acc += MOSCOW_W[store.S.moscow[c.id]] * coverage(pl.id, c).cov; });
      out[p.key][pl.id] = wsum ? Math.round(100 * acc / wsum) : 0;
    });
  });
  return out;
}
