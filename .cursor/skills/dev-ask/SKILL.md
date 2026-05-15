---
name: dev-ask
description: >-
  Answer engineering questions about AAA Portfolio: architecture, conventions,
  where code lives, how config loads. Read-only unless user asks to implement.
---

# Dev — ask

## Use for

- “Where is X implemented?”
- “How does config load?” / “What shape is `data_sprint_progress.json`?”
- Explaining `docs/CONVENTION.md`, `docs/PLANS.md`, skills, CI workflows
- Reviewing a approach before coding

## Read first

- `docs/CONVENTION.md`, `docs/PLANS.md`, `README.md`
- `src/server/portfolio/load-config.ts`, `src/feature/portfolio/`
- `config/` examples (`config/projects/kidneyhood/`)

## Style

- Concise bullets with file paths.
- Default **read-only** — no edits unless user says “implement” / “fix” → then use **`@dev-new-feature`**.

## Redirect

- Brad changing deal data only → `@ceo-update` / `@ceo-ask`
- Brad new project from proposal → `@ceo-init`
