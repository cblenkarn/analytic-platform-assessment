// ── Single owner of mutable application state ─────────────────────────────
// Every other module imports `store` and reads/writes its properties. Keeping
// all reassignable state on one object (rather than scattered module-level
// `let`s) is what makes the codebase safely splittable into ES modules:
// exported `let` bindings can't be reassigned by importers, but object
// properties can be mutated by anyone holding the reference.

import { DEFAULT_PLATFORMS } from '../data/platforms.js';

// UI-level admin unlock — NOT a security boundary. The token is visible in
// client code and RLS is open; it only reveals irreversible Delete controls
// alongside Retire for whoever holds the URL (?admin=<token>).
export const ADMIN_DELETE_TOKEN = 'merkle-delete-2026';

let _adminDelete = false;
try { _adminDelete = new URLSearchParams(location.search).get('admin') === ADMIN_DELETE_TOKEN; } catch (e) {}

export const store = {
  // core data
  PLATFORMS: DEFAULT_PLATFORMS.map(p => ({ ...p })),
  RUBRIC: null,          // [{ key, name, retired, caps:[{ id,title,def,retired,subs:[{id,q,sup,rat,retired}] }] }]
  S: null,               // selections { moscow:{capId:priority}, needs:{subId:bool}, useCases:[...] }
  SUBIDX: {},            // subId -> { sub, cap, pkey }
  USE_CASE_LIBRARY: [],  // master use-case library (seed until DB load)

  // id counters (re-derived from loaded data so new ids never collide)
  counters: { sub: 0, cap: 15, pillar: 0, vendor: 0, useCase: 0, lib: 0 },

  // view flags
  editMode: true,
  viewNeededOnly: false,
  collapsedPillars: new Set(),
  pendingFocus: null,

  // admin delete unlock
  adminDelete: _adminDelete,
  ADMIN_DELETE_TOKEN,
};
