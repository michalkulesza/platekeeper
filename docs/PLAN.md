# PlateKeeper — Project Plan

A public, multi-user PWA recipe library where users keep their own recipes and import
recipes from Instagram Reels / TikTok via an automated extraction pipeline.

## Decisions (resolved 2026-06-05)

| Area | Decision |
|---|---|
| Audience | Public multi-user app from launch |
| FE | Vite + React + TS, PWA, deployed on Cloudflare Pages |
| Main API | Python / FastAPI + Postgres on VPS (Docker Compose) |
| Importer | Separate Python service on VPS (same compose stack) |
| Repo | Monorepo: `apps/web`, `services/api`, `services/importer`, `packages/shared` |
| Package mgmt | pnpm workspace (TS), uv (Python) |
| Auth | Self-hosted: Google/Apple OAuth + email/password (fastapi-users / authlib), httpOnly cookie sessions |
| Routing | FE at `platekeeper.<tld>` (CF Pages); API at `api.platekeeper.<tld>` — CF-proxied DNS → VPS (Caddy/nginx TLS). Same-site cookies, simple CORS |
| Types contract | FastAPI OpenAPI schema → generated TS types in `packages/shared` |
| Job model | Postgres job queue (`FOR UPDATE SKIP LOCKED`), N workers race-safe; FE polls `GET /imports/{id}` ~2s; `locked_at` timeout sweep re-queues dead-worker jobs |
| Scraping | **Paid scraping API only** (vendor TBD — spike: Apify vs ScrapeCreators vs alternatives). Behind a `Fetcher` interface |
| Extraction | Gemini Flash with structured output (JSON schema) for **all** stages; no regex parsing; trivial pre-check only (length/digits) |
| Link stage | schema.org/Recipe JSON-LD parsed deterministically first; Gemini on stripped page text as fallback |
| Video stage | Gemini multimodal video (Files API) — handles speech **and** on-screen text overlays. No Deepgram |
| Cost control | Per-user import quota (e.g. 10/day) + global cache keyed on canonical reel URL (duplicate imports reuse extraction, zero vendor cost) |
| Ingredients | **Fully structured**: required `qty`/`unit`/`name` + optional `note` are source of truth; display text rendered. Manual-entry UX: parse-on-type helper (user types a line → parsed into fields → user corrects) |
| Media | Store reel thumbnail (in R2) + creator handle + source URL. Video deleted after Gemini processing — never rehosted |
| Image storage | Cloudflare R2 (thumbnails + user uploads); VPS stays stateless except Postgres |
| Sharing | Private by default + unlisted share links. Logged-out: read-only public preview. Logged-in: one-click "save to my library" (DB copy/fork, attribution preserved, no pipeline cost) |
| PWA scope | Installable + offline **read** of own library (vite-plugin-pwa / Workbox). Writes require network. No sync queue at MVP |
| Cooking mode | Toggle on recipe view; Screen Wake Lock API keeps screen on; auto-release on navigate away |
| CI/CD | Trunk-based. Merge to `main` → GH Actions: tests → Docker build → GHCR → SSH to VPS → `docker compose pull && up -d`. CF Pages auto-builds FE + per-PR preview deploys |
| Testing | FE: Vitest + RTL + MSW. BE: pytest + real Postgres (testcontainers); vendors mocked with recorded golden fixtures. Playwright e2e: signup, manual create, import happy path (stubbed importer), share link. All merge-gating |
| Language | Recipes stored in source language (no translation). UI English-only at MVP, no i18n framework yet |
| MVP library features | Text search (Postgres FTS), tags, favorites/pinning, collections/folders |
| Recipe structure | **Group is the universal unit**: every recipe lives in a group; a simple recipe = group with one component. Library/share/favorites/tags/thumbnail/visibility all attach to the group |
| Component roles | Free-form label ('main', 'sauce', 'marinade'…) with autocomplete suggestions; single-component groups default to 'main' and hide the badge |
| Component ownership | Components owned by exactly one group (`group_id` FK); reuse elsewhere = explicit copy. No shared references — edits never leak across dishes |
| Import × groups | Gemini extraction schema returns `components[]` (role, name, ingredients, steps) — reels with "for the sauce:" sections land pre-split. Import result shows a preview where user can merge/rename components before saving |
| Scaling | Servings live on the group; scaling multiplies all components together. Components may carry an optional yield note ('makes ~300 ml') |
| Group display | One scrollable page, a section per component (role badge + ingredients + steps), plus a combined all-ingredients toggle (qty-merged where units match). Cooking mode walks the same page. Single-component groups render with zero section chrome |

## Import pipeline

```
URL submitted → quota check → canonical-URL cache check (hit ⇒ done)
  → paid scraper API: metadata (description, thumbnail, handle)
  → Stage 1: description → Gemini Flash structured extract  (found ⇒ done)
  → Stage 2: links in description → fetch page → JSON-LD parse → else Gemini on page text  (found ⇒ done)
  → Stage 3: download video → Gemini Files API (video) → structured extract
  → extraction returns group {title, servings, components[]} → user previews/adjusts split
  → store group + thumbnail→R2 + cache entry; delete video
Job stages visible to FE: queued → fetching → checking_description → checking_links → analyzing_video → done | failed
```

Vendors: **two total** — scraping API + Gemini. Worst-case import cost ≈ 1–5¢; quota + cache bound the spend.

## Data model sketch

- `users` (auth, quota counters)
- `recipe_groups` — **the library unit**: (user_id, title, servings, source_url, source_handle,
  thumbnail_key, visibility enum [private|unlisted], forked_from_id, language)
- `recipes` — components: (group_id FK, position, role, name, yield_note, prep/cook times)
- `ingredients` (recipe_id, position, qty, unit, name, note) — structured, required
- `steps` (recipe_id, position, text)
- `tags` + `group_tags` (M2M on groups)
- `collections` + `collection_groups` (M2M on groups)
- `favorites` (user_id, group_id)
- `import_jobs` (user_id, url, canonical_url, status, stage, locked_at, worker_id, error, result_group_id)
- `import_cache` (canonical_url → extraction JSON)

Search matches component names + ingredients but always returns/links the parent group.
Share links, save-to-library forks, and deletes operate on whole groups (cascade to components).

## Build phases

1. **Skeleton** — monorepo scaffold, compose stack (Postgres, API, importer), CF Pages wired,
   CI pipeline green end-to-end with a hello-world deploy.
2. **Auth + recipe CRUD** — signup/login (email + Google), structured-ingredient editor with
   parse-on-type, search/tags/favorites/collections.
3. **Import pipeline** — job queue, scraper vendor spike + integration, Stage 1 (description),
   then Stage 2 (links), then Stage 3 (video). Quotas + cache.
4. **PWA polish** — installability, offline read, cooking mode (wake lock), share links +
   one-click save-to-library.
5. **Launch hardening** — rate limiting, monitoring/alerts on the VPS, live-vendor canary
   (consider), backup strategy for Postgres.

## Open items

- Scraping API vendor choice (spike in phase 3; abstract behind `Fetcher` from day one)
- Transactional email provider for verification/reset (default candidate: Resend)
- Domain purchase + Cloudflare zone setup
- Postgres backup target (R2 via wal-g/pgbackrest?)
