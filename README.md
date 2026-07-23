# Merkle Analytic Platform Assessment

A consultant tool that matches a client's analytics needs (MoSCoW priorities) to
platforms — GA4, Adobe Analytics, CJA, Amplitude, Contentsquare, Piano — and
produces a weighted-fit ranking plus a best-of-breed stack recommendation.

Static multi-page site on **Vercel** (no build step, native ES modules) with a
**Supabase** (Postgres) backend.

## Pages

| Path           | File             | Purpose |
|----------------|------------------|---------|
| `/dashboard`   | `dashboard.html` | Lists every assessment; create / open / delete from here. `/` redirects here. |
| `/assessment?id=…` | `assessment.html` | The workspace: Use Cases, Prioritization (MoSCoW), Results. Selections autosave. |
| `/admin`       | `admin.html`     | The **master rubric** editor. Every edit autosaves and applies to all assessments. |
| `/usecases`    | `usecases.html`  | The **master use-case library** editor (the picker chips consultants drop into assessments). |

## Code layout

```
src/data/            seed rubric / vendors / rationale / library — FIRST-RUN
                      fallback only; the canonical data lives in Supabase.
src/model/            in-memory rubric model: build/normalize/reindex, structural
                      edits (rubric-edit.js), library edits (library.js).
src/scoring/          pure functions: coverage, weighted fit, stack recommendation,
                      use-case coverage. No DOM, no persistence.
src/ui/               dom helpers, render bus, shared chrome behaviours.
src/persistence/      supabase.js (table CRUD), granular-save.js (row-scoped
                      debounced autosave), tables-sync.js (load + realtime).
src/features/<page>/  per-page views + event wiring.
src/entries/          one entry module per HTML page.
css/                  base + chrome + components load broadly; per-page files
                      layer on top (split from the original app.css by section).
```

## Data model — normalized, row-scoped tables

The rubric is **not** one JSON blob anymore. It's three tables:

- `rubric_pillars` — one row per pillar (`data` holds that pillar's nested
  capabilities + sub-capabilities, same shape as before).
- `vendors` — one row per platform.
- `use_case_library` — one row per master use-case (its own table now,
  separate from the rubric).
- `assessments` — unchanged; one row per client assessment, storing only
  that assessment's own selections.

**Why:** the original schema kept everything — every pillar, every vendor,
the entire use-case library — in a single ~90KB row. Every edit re-saved the
whole document, so two editors working in different pillars at the same time
could silently overwrite each other's work. Now every edit writes only the
one row it touched (see `src/persistence/granular-save.js`). Two editors
touching different pillars/vendors/use-cases can never collide. Editors
touching the exact same row still resolve last-write-wins on *that row only*
— normal Postgres behaviour, not "wipe out eleven unrelated pillars."

If you're migrating from the old single-blob schema, see **Migration** below.

## Migration from the old single-blob schema

1. Run `supabase/schema.sql` in the Supabase SQL editor — it only creates the
   new tables; your existing `rubrics` table is untouched.
2. Run the one-off script locally (never in the deployed app):
   ```
   npm install
   SUPABASE_URL=https://xxxx.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
   node scripts/migrate-to-tables.mjs
   ```
   (Service-role key from Supabase → Project Settings → API. Never commit it,
   never put it in `config.js`.) It's idempotent — safe to re-run.
3. Verify `/admin` and `/usecases` show your real data.
4. Once confident, drop the old table yourself: `drop table if exists public.rubrics;`

## Autosave & live sync

Every structural edit (rename, retire, toggle support, add/delete, drag
reorder, SME rationale note) debounces a save of just the affected row(s).
Realtime subscriptions on all three tables patch other editors' changes in
automatically — unless you have an unsaved edit on that *same* row, in which
case a banner appears so you can review before reloading.

## Local dev

`npm run dev` (serves the folder). `npm run check` runs `node --check` on
every module. `npm run migrate` runs the one-off migration script (see above).

## Config

Copy `config.example.js` to `config.js` and set your Supabase URL + publishable
(anon) key. `config.js` is git-ignored.
