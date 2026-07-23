// ── Coverage primitives (pure) ────────────────────────────────────────────
import { store } from '../model/state.js';
import { MOSCOW_W } from '../data/platforms.js';
import { capPillar } from '../model/rubric.js';

export function active() { return store.PLATFORMS.filter(p => !p.retired); }
export function sup(subId, plId) { return !!(store.SUBIDX[subId] && store.SUBIDX[subId].sub.sup[plId]); }
export function supportCount(subId) { return active().filter(pl => sup(subId, pl.id)).length; }

export function capInScope(c) {
  if (c.retired) return false;
  const p = capPillar(c); if (p && p.retired) return false;
  return store.S.moscow[c.id] !== 'wont';
}
export function onSubs(c) { return c.subs.filter(s => !s.retired && store.S.needs[s.id]); }

export function scopedCaps() {
  const out = [];
  store.RUBRIC.forEach(p => p.caps.forEach(c => {
    if (capInScope(c)) { const on = onSubs(c); if (on.length) out.push({ c, p, on, w: MOSCOW_W[store.S.moscow[c.id]] }); }
  }));
  return out;
}
export function anyScope() { return scopedCaps().length > 0; }

export function coverage(plId, c, on) {
  on = on || onSubs(c);
  if (!on.length) return { sup: 0, on: 0, cov: 0 };
  const s = on.filter(x => !!x.sup[plId]).length;
  return { sup: s, on: on.length, cov: s / on.length };
}
