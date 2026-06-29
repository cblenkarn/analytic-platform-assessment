# Merkle — Analytic Platform Assessment

A consultant tool for matching analytics needs to platforms (GA4, Adobe Analytics, CJA,
Amplitude, Contentsquare, Piano, plus any vendors you add). Static front-end, with
**Supabase** storing the master rubric and saved assessments, deployed on **Vercel**.

- **Needs Discovery** — set MoSCoW priorities (workshop-facing).
- **Results** — weighted-fit ranking, coverage by pillar, assessment-aware platform profiles.
- **Rubric Admin** — the master rubric: support toggles, SME rationale, pillars/capabilities/sub-capabilities, vendor management.

The app runs **fully offline** with no backend (using the built-in Export/Import JSON).
Add Supabase keys to turn on cloud save of the rubric and named assessments.

---

## 1. Create the Supabase backend

1. Create a project at https://supabase.com.
2. Open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and **Run**.
   This creates two tables — `rubrics` (the master rubric) and `assessments` (saved snapshots) — with Row Level Security.
3. Open **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key

> The anon key is a *publishable* key and is safe to ship in client code. Access is governed
> by the RLS policies in the schema. For real production, enable Supabase Auth and tighten the
> policies (see the comments at the bottom of `schema.sql`).

## 2. Add your keys

Edit [`config.js`](config.js):

```js
window.APP_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
  SUPABASE_ANON_KEY: "eyJ...your-anon-key..."
};
```

(Leave them blank to keep the tool offline-only.)

## 3. Put it on GitHub

**Option A — upload in the browser (no git needed):**
1. Create a new repository on GitHub (empty, no README).
2. **Add file → Upload files**, drag in *everything in this folder* (keep the `js/` and `supabase/`
   subfolders), and commit.

**Option B — command line:**
```bash
cd merkle-platform-assessment
git init
git add .
git commit -m "Merkle Analytic Platform Assessment"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

## 4. Deploy on Vercel

1. Go to https://vercel.com → **Add New → Project → Import** your GitHub repo.
2. **Framework Preset: Other.** No build command, no install command — it's a static site.
   (Leave Output Directory blank / root.)
3. **Deploy.** Vercel serves `index.html` and the assets directly.

Pushing to the `main` branch re-deploys automatically.

---

## Using it

- **Rubric Admin** is the single source of truth. Edit support, capture SME rationale (the ✎),
  manage vendors (drag to reorder, retire, + Add vendor). Click **Save rubric to cloud** to
  publish your changes to Supabase. On load, the app pulls the master rubric from the cloud.
- **Assessments** (the bar under the tabs): name an assessment and **Save** to store the current
  priorities and rubric snapshot. Reload any saved assessment from the dropdown. Each assessment
  is a self-contained snapshot, so it stays reproducible even after the rubric evolves.
- **Export / Import (.json)** still works as a manual backup / transfer, with or without Supabase.

## Project structure

```
index.html            the app (single-file UI + logic)
config.js             your Supabase URL + anon key (edit this)
config.example.js     reference copy
js/db.js              Supabase data layer (rubric + assessments) — ES module
supabase/schema.sql   tables + RLS policies; run once in Supabase
vercel.json           static hosting config
package.json          metadata; `npm run dev` serves locally
```

## Run locally

```bash
npm run dev      # serves at http://localhost:3000
```
(or open `index.html` directly — cloud features need the keys in `config.js`).

## Security notes

- The anon key is public by design; never put the **service_role** key in client code.
- The default RLS policies allow anyone with the anon key to read/write. Acceptable for an
  internal tool, but for production enable Supabase Auth and scope the policies to authenticated
  users / your team. The schema file shows exactly what to change.
