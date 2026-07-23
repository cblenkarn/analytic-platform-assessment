// ── Shared page chrome behaviours ─────────────────────────────────────────
// Generic, page-agnostic UI wiring used by more than one page.

// Collapsible read-me / section panels: <div data-seccollapse> toggles the
// closest .collapsible ancestor. Used on the admin and use-case pages.
export function initCollapsibles() {
  document.addEventListener('click', e => {
    const head = e.target.closest('[data-seccollapse]');
    if (!head) return;
    head.closest('.collapsible')?.classList.toggle('collapsed');
  });
}
