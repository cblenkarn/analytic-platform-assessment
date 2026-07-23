// ── Reference constants ───────────────────────────────────────────────────
// Default vendor set + MoSCoW weights. These are the FIRST-RUN / OFFLINE
// fallback only: on a Supabase-backed page the canonical platform list comes
// from the normalized tables (loaded via persistence/tables-sync.js).
//
// NOTE on SEED_ORDER: the seed rubric in seed-rubric.js authors vendor support
// as positional arrays aligned to SEED_ORDER. The RUNTIME + DATABASE format is
// keyed ({ga4:true, aa:false, ...}); buildRubric() converts positional→keyed.
// If you add/reorder a default vendor, update SEED_ORDER to match.

export const DEFAULT_PLATFORMS = [
  { id: 'ga4',   name: 'Google Analytics 4',          code: 'GA4' },
  { id: 'aa',    name: 'Adobe Analytics',             code: 'AA' },
  { id: 'cja',   name: 'Customer Journey Analytics',  code: 'CJA' },
  { id: 'amp',   name: 'Amplitude',                   code: 'AMP' },
  { id: 'cs',    name: 'Contentsquare',               code: 'CS' },
  { id: 'piano', name: 'Piano Analytics',             code: 'PIANO' },
];

// Column order the positional seed arrays are aligned to.
export const SEED_ORDER = ['ga4', 'aa', 'piano', 'cja', 'amp', 'cs'];

export const MOSCOW_W = { must: 3, should: 2, could: 1, wont: 0 };
