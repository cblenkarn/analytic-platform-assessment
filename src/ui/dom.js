// ── Tiny DOM / string helpers shared across features ──────────────────────

// Build a single element from an HTML string.
export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstChild;
}

// Escape for safe interpolation into innerHTML.
export function esc(s) {
  return (s || '').replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
}

// Trailing-edge debounce.
export function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

export const byId = id => document.getElementById(id);
