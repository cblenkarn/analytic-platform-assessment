// ── Best-of-breed stack recommendation (pure) ─────────────────────────────
import { store } from '../model/state.js';
import { capInScope, onSubs, coverage } from './coverage.js';

export function recommendStack(rows) {
  const qual = rows.filter(r => !r.dq); const pool = qual.length ? qual : rows; const primary = pool[0];
  if (!primary) return { primary: null, augments: [] };
  const gaps = [];
  store.RUBRIC.forEach(p => p.caps.forEach(c => {
    if (!capInScope(c)) return; const on = onSubs(c); if (!on.length) return;
    const pr = store.S.moscow[c.id]; if (pr !== 'must' && pr !== 'should') return;
    const cv = coverage(primary.id, c, on); if (cv.cov < 1) gaps.push({ c, on, leadCov: cv.cov });
  }));
  const aug = {};
  gaps.forEach(g => {
    let best = null;
    rows.forEach(r => {
      if (r.id === primary.id) return;
      const cv = coverage(r.id, g.c, g.on);
      if (cv.cov > g.leadCov + 1e-9 && (!best || cv.cov > best.cov)) best = { id: r.id, cov: cv.cov };
    });
    if (best) { aug[best.id] = aug[best.id] || { caps: [], gain: 0 }; aug[best.id].caps.push(g.c.title); aug[best.id].gain += (best.cov - g.leadCov); }
  });
  const augments = Object.entries(aug).map(([id, v]) => ({ ...store.PLATFORMS.find(p => p.id === id), caps: v.caps, gain: v.gain }))
    .sort((a, b) => b.caps.length - a.caps.length || b.gain - a.gain).slice(0, 2);
  return { primary, augments };
}
