// ── Render bus ────────────────────────────────────────────────────────────
// Decouples the model from the views. The model calls requestRender() after a
// data load or selection change; each PAGE ENTRY registers the concrete render
// pipeline for that page via setRenderer(). This is why the model never has to
// import any view module (no cross-feature coupling, no cycles).

let _renderer = () => {};

export function setRenderer(fn) { _renderer = typeof fn === 'function' ? fn : () => {}; }
export function requestRender() { _renderer(); }
