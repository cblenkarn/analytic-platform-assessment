// ── Shared page context ───────────────────────────────────────────────────
// The current assessment id, read from ?id=... on the URL. Event handlers
// deep inside a feature module (framework.events.js, usecases.events.js)
// need this to persist a change but don't have it passed down through
// render calls — this avoids duplicating the same URL-parsing snippet in
// every one of them.
export function assessmentIdFromUrl() {
  try { return new URLSearchParams(location.search).get('id'); } catch (e) { return null; }
}
