// ── Autosave status indicator ─────────────────────────────────────────────
import { byId } from '../ui/dom.js';

// state: 'saving' | 'saved' | 'err'
export function setAuto(state, text) {
  const a = byId('autosave'); if (!a) return;
  a.className = 'autosave ' + state;
  const t = byId('autosaveText'); if (t) t.textContent = text;
}
