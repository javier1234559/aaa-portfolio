---
name: about
description: >-
  AAA Portfolio hub — what the app is, which skills exist, and which @tag to use next.
  Use when Brad (or anyone) is unsure where to start after cloning the repo.
---

# About — AAA Portfolio

## What this repo is

Internal **portfolio command center**: all client projects in one table, phase tabs (Sales → Maintenance), Jira/GitHub snapshots, revenue in YAML. Data lives under **`config/`**.

- **Run locally:** `pnpm install` → `cp .env.example .env` → `pnpm dev` → `/app`
- **Client publish:** `/app/publish/<slug>` when `clientDashboardPath` is `https://…`

## Skills (tag `@name`)

| Tag | Who | Does |
|-----|-----|------|
| `@about` | Everyone | This menu |
| `@ceo-init` | Brad | New project: proposal + transcript → `config/` |
| `@ceo-update` | Brad | Edit existing project config |
| `@ceo-ask` | Brad | Q&A one project (data only) |
| `@ceo-stats` | Brad | Portfolio report + revenue rollup |
| `@dev-ask` | Engineering | Q&A architecture / code / config (read-only) |
| `@dev-new-feature` | Engineering | Any code or config/schema/CI change |

**Brad:** `@ceo-init` · `@ceo-update`. **Engineering:** `@dev-ask` · `@dev-new-feature`.

## What do you want to do?

- **A** — Setup after clone → README, then `@ceo-stats`
- **B** — New client → `@ceo-init`
- **C** — Update existing project data → `@ceo-update`
- **D** — Ask about one project → `@ceo-ask`
- **E** — Company-wide status → `@ceo-stats`
- **F** — How does the app work? → `@dev-ask`
- **G** — Build or change app/config/CI → `@dev-new-feature`

Do not edit `src/` unless the user chose **G** (or explicitly asked for code).
