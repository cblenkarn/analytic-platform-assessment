# Merkle Analytic Platform Assessment

A consultant tool that matches a client's analytics needs (MoSCoW priorities) to
platforms — GA4, Adobe Analytics, CJA, Amplitude, Contentsquare, Piano — and
produces a weighted-fit ranking plus a best-of-breed stack recommendation.

Static multi-page site on **Vercel** with a **Supabase** (Postgres) backend.

## Pages

| Path           | File             | Purpose |
|----------------|------------------|---------|
| `/dashboard`   | `dashboard.html` | Lists every assessment; create / open / delete from here. Landing page (`/` redirects here). |
| `/assessment?id=…` | `assessment.html` | The workspace: **Needs discovery** (MoSCoW + sub-capabilities) and **Results** (ranking, stack, pillar coverage, profiles). Selections autosave. Links back to the dashboard. |
| `/admin`       | `admin.html`     | The **single master rubric** editor. Every edit autosaves to the database and applies to all assessments, including new ones. |

Shared assets: `css/app.css`, `js/core.js` (rubric model, scoring, rendering),
`js/db.js` (Supabase + page routing + autosave + realtime).

## Single rubric

There is **one** rubric, stored in the `rubrics` table as the row `id='master'`.
Assessments store **only** the client's selections (`{moscow, needs}`), not a
copy of the rubric. Opening an assessment loads the current master rubric and
overlays that assessment's selections — so a rubric change in `/admin` reaches
every assessment immediately. Import and "reset to defaults" have been removed:
the master rubric in the database is the single source of truth.

## Autosave

- **Rubric** (`/admin`): any edit autosaves ~0.8s after you stop. No save button.
- **Selections** (`/assessment`): MoSCoW and sub-capability changes autosave ~0.7s after you stop.

The dot next to the page title shows status (saving / saved / error).

## Multiple editors

Saves are **last-write-wins**, and the rubric is **live-synced** over Supabase
Realtime:

- When another editor saves, your `/admin` page is notified in real time.
- If you have **no unsaved edits**, the change is applied silently.
- If you are **mid-edit**, a banner appears ("updated by another editor — Reload")
  rather than clobbering your work. Reloading pulls their version; ignoring it and
  continuing means your next save overwrites theirs.
- Two people editing the **same field** at the same instant resolve last-write-wins
  (no field-level merge).

This is appropriate for a small consulting team coordinating edits. For stricter
control, enable Supabase Auth and tighten the RLS policies (see `supabase/schema.sql`).

## Deploy

1. **Supabase** → create a project → SQL Editor → paste & run `supabase/schema.sql`.
   Then Settings → API Keys → copy the **Project URL** and the **publishable key**
   (`sb_publishable_…`).
2. **config.js** → paste the URL and publishable key. `config.js` **must be committed**
   — the publishable key is public-safe. Never put a secret/service-role key in client code.
3. **GitHub** → commit and push the repo.
4. **Vercel** → Import the repo → Framework preset **Other** → no build command → Deploy.

The site is `noindex` (meta tag + `X-Robots-Tag` header + `robots.txt`).

## Local dev

```bash
npm run dev   # npx serve .
```
