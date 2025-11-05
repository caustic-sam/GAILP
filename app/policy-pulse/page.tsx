# Changelog — GAILP (www-GAILP-prd)

This project adheres to semantic-ish versioning at the app level. See also: `docs/reviewed/AUTH-DELIVERY-SUMMARY.md` for auth-specific history.

## [0.1.1] — 2025-11-05
### Added
- OAuth-first auth (GitHub/Google) with server-side gate (`app/admin/layout.tsx`).
- SSR Supabase client `lib/supabase/server.ts` (must `await getSupabaseServer()`).
- Global shell: compact blue top bar + right “fan” rail mounted via `app/layout.tsx` → `components/GlobalChrome.tsx`.
- Docs: Navigation, Feeds/FreshRSS, Deployment Checklist, Troubleshooting, Docs index.

### Changed
- Roles normalized to **admin / contributor / reader** (was `editor`).
- FreshRSS unread-count now falls back gracefully when the endpoint is not implemented (501), avoiding noisy errors.
- Edge middleware disabled (no-op); auth enforced via server layout to prevent prerender crashes.

### Fixed
- Build failures from client hooks in server contexts (`useAuth …`).
- Path alias / import depth issues for Supabase SSR client.
- Turbopack parse errors from stray JSX in server utilities.

### Removed
- OTP-first flow as the default (still possible to re-enable later as fallback).

---
## [0.1.0] — 2025-11-03
- Initial public shell, basic feeds surface, placeholder content & styles.

# Operations Runbook — GAILP (Vercel + Supabase)

Use this as a pager-friendly guide for deploys, hotfixes, rollbacks, and routine ops.

## Quick Links
- Deployment checklist: `docs/DEPLOYMENT-CHECKLIST.md`
- Troubleshooting: `docs/TROUBLESHOOTING.md`
- Feeds / FreshRSS: `docs/FEEDS-FRESHRSS.md`
- Auth setup: `docs/AUTH-SETUP.md`

---
## 1) Deploy (Production)
1. Ensure you are on latest `main` locally:
   ```bash
   git checkout main && git pull
   pnpm install
   pnpm build
   ```
2. Push changes:
   ```bash
   git push
   ```
3. Vercel auto-builds Production. Verify logs show `pnpm >= 8` and no SWC warnings. If SWC warning appears, run a local `pnpm build` once to patch the cache.
4. Smoke test (see section 5).

---
## 2) Hotfix
1. Create a hotfix branch:
   ```bash
   git checkout -b hotfix/<slug>
   ```
2. Commit minimal fix; verify locally:
   ```bash
   pnpm build && pnpm dev
   ```
3. Push branch, open PR, merge with approval, ensure Vercel Production deploy completes.

---
## 3) Rollback
- Preferred: **Redeploy previous successful build** in Vercel UI (Deployments → pick previous → Redeploy).
- If code rollback is needed:
  ```bash
  git revert <bad-commit-sha>
  git push
  ```

---
## 4) Environment & Secrets
- Vercel Project → Settings → Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE_URL`
  - FreshRSS vars if used: `FRESHRSS_API_URL`, `FRESHRSS_API_USERNAME`, `FRESHRSS_API_PASSWORD`
- Supabase Dashboard → Auth → Providers: GitHub/Google enabled; callback URLs set for dev + prod.
- **Rotation cadence**: review API keys quarterly or on incident.

---
## 5) Smoke Tests (Prod)
- `/` renders with top bar + right rail; links are clickable.
- `/login` shows GitHub/Google buttons; redirect flow completes to `/admin`.
- `/admin`:
  - Signed-out → redirected to `/login?redirectTo=/admin`.
  - Signed-in `admin|contributor` → access granted; `reader` → redirected home.
- Feeds surface returns items (unread count optional).
- Sign-out works (POST `/api/auth/signout` → home).

---
## 6) Supabase Migrations
- Apply SQL files in `supabase/migrations/` through Supabase SQL editor or CLI.
- Confirm `profiles` table exists and `handle_new_user()` trigger assigns default `reader` role.
- Promote users to `contributor`/`admin` using SQL or GUI.

---
## 7) Monitoring & Incidents
- Watch Vercel build & runtime logs for repeated warnings.
- For auth/login issues: verify callbacks in Supabase, check domain in `NEXT_PUBLIC_SITE_URL`.
- For feed errors: verify `FRESHRSS_API_URL` points to `.../api/greader.php` and credentials are valid.
- Incident playbook:
  1. Identify blast radius (only admin? entire site?).
  2. Roll back or hotfix (sections 2–3).
  3. Announce status & ETA internally.
  4. Create postmortem entry (summary, impact, root cause, actions).

# Engineer Onboarding — GAILP

Welcome! This guide gets you productive in ~15 minutes.

## Prereqs
- Node.js ≥ 18
- pnpm ≥ 8 (`corepack enable` then `corepack prepare pnpm@latest --activate`)
- Git + GitHub access

## Setup
```bash
git clone <repo-url> www-GAILP-prd
cd www-GAILP-prd
pnpm install
cp .env.example .env.local  # create local env file
# Fill in:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Optional FreshRSS:
# FRESHRSS_API_URL=https://host/api/greader.php
# FRESHRSS_API_USERNAME=...
# FRESHRSS_API_PASSWORD=...
pnpm dev
```

Visit `http://localhost:3000`.

## Common Scripts
- `pnpm dev` — run locally
- `pnpm build` — typecheck & build
- `pnpm lint` — lint
- `pnpm test` — jest tests (if/when added)

## Branch & PR Flow
- Branches: `feature/<slug>`, `fix/<slug>`, `hotfix/<slug>`
- Commit: concise subject + context
- PR checklist:
  - Build passes (`pnpm build`)
  - No stray `<html>/<body>` in pages (App Router)
  - Relative imports OK if alias not configured
  - No client hooks in server files

## Auth Roles
- Default `reader` on first login; promote to `contributor`/`admin` in Supabase.
- `/admin/**` requires `admin|contributor` (gated in `app/admin/layout.tsx`).

## Where to edit UI
- Top bar links: `components/Navigation.tsx`
- Right rail links: `components/RightSidebar.tsx`
- Global layout: `app/layout.tsx` → `components/GlobalChrome.tsx`

# Next Working Session — Agenda & Prep

## Goals
- Finalize nav IA (top bar labels/URLs, right-rail quick links)
- Tighten `/admin` surface (role-based menu; content editor access)
- Feeds polish (categorization, pagination, loading states)
- Auth UX details (post-login redirect, sign-out placement, 403 copy)
- Basic analytics & SEO (sitemap, robots, meta)

## Prep (do before session, ~10–15 min)
- Confirm `NEXT_PUBLIC_SITE_URL` points to your Vercel domain in Prod
- Enable your chosen OAuth providers in Supabase; verify callbacks
- Create one `contributor` test user; one `reader` user
- List the exact pages you want in the top bar and right rail

## Decisions to Make
- Final route names: `/updates`, `/blog`, `/live-policy`, `/law-policy`, `/research`, `/about`
- Access policy for `/admin` subsections (who can publish? delete?)
- Whether FreshRSS unread counts are required in MVP

## Candidate Tasks
- Implement per-section layouts where needed (only some routes show the rail)
- Add active-link styles and breadcrumb where relevant
- Write minimal e2e smoke tests (Playwright) for nav + auth flows
- Add `vercel.json` to pin install/build commands if necessary
