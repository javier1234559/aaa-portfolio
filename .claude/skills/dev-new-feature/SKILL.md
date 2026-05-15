---
name: dev-new-feature
description: >-
  Engineering work on AAA Portfolio: UI, loaders, config/schema, CI sync, manifest.
  Reads docs/CONVENTION.md and docs/PLANS.md; updates PLANS todos as work progresses.
---

# Dev — new feature

Use for **any engineering change**: new UI, loader/types, manifest, sync scripts, workflows, or extending config shapes.

## Before coding

1. Read `docs/CONVENTION.md` and `docs/PLANS.md`.
2. Restate the request in one sentence; list files you expect to touch.
3. Add or tick todos in `docs/PLANS.md` (§17 or relevant section).

## While working

- Match patterns in `src/feature/portfolio/`, `src/server/portfolio/`, `src/components/`.
- Prefer **config-driven** data under `config/` over hardcoding in TS.
- Run `pnpm exec tsc --noEmit` and ESLint on touched files.

## Config & sync (same skill — not a separate tag)

Config root: **`config/`** (`PORTFOLIO_CONFIG_ROOT` to override).

| Task | Where |
|------|--------|
| Registry | `config/projects.manifest.yaml` |
| CI targets | `config/ci-sync-manifest.json` |
| Project folder | `config/projects/<slug>/` — `<slug>.yml`, `data_*.json`, optional `milestones.yaml`, phase markdown |
| Jira/GitHub JSON | `.github/workflows/portfolio-sync-*.yml`, `scripts/sync_*_portfolio.py` |
| Loader/types | `src/server/portfolio/load-config.ts`, `src/feature/portfolio/types.ts` |
| Revenue | `commercial:` in YAML → `portfolio-commercial.ts` |

Verify: `pnpm run build`. Do not commit secrets; deploy filesystem is read-only for `config/`.

Brad-facing data entry (no code) → suggest `@ceo-init` / `@ceo-update`.

## After

- Short summary + how to verify (`pnpm dev`, URLs).
- What changed in `docs/PLANS.md`.
