---
name: ceo-update
description: >-
  Update an existing portfolio project's config (YAML, JSON, markdown) from Brad's
  instructions. Use when CEO wants to change phase, revenue, team, milestones, or tab content.
disable-model-invocation: true
---

# CEO — update project

## Scope (this skill)

**Allowed:** edit files under `config/projects/<slug>/` and registry rows when needed:

- `<slug>.yml` — `currentPhase`, `description`, `team`, **`commercial`**, URLs, engagement copy
- `milestones.yaml`, `data_sales_meetings.json`, `data_comments.json`
- Phase markdown: `discovery/`, `qa/`, `uat/`, `maintenance/*.md`

Follow shapes in `README.md`, `config/projects/kidneyhood/`, and `.cursor/rules/portfolio-config.mdc`.

## Out of scope → redirect

If the user asks to change **app UI**, new dashboard cards, TypeScript, loaders, or API routes:

> That needs engineering. Tag **`@dev-new-feature`** (describe the UI change). I can only update config data here.

If they need **Jira/GitHub sync**, CI, loader changes, or new config fields:

> Use **`@dev-new-feature`**. Brand-new project folder from proposal → **`@ceo-init`**.

## Workflow

1. **Resolve project** — slug or name from message; else list manifest slugs (numbered) and wait.
2. **Confirm change** — one short bullet list of what you will edit before writing (unless user gave exact values).
3. **Edit minimally** — only fields they asked for; preserve existing keys and formatting.
4. **Verify** — `pnpm run build` only if YAML structure changed heavily; otherwise remind user to refresh `/app`.
5. **End** — *“View `/app/projects/<slug>`. Portfolio totals → `@ceo-stats`.”*

## Common updates

| Request | Where |
|---------|--------|
| Change phase | `currentPhase` in yml |
| Deal value / status | `commercial:` block |
| New meeting / transcript | `data_sales_meetings.json` |
| Delivery gate date | `milestones.yaml` (`phase:` optional) |
| QA/UAT notes | phase folder markdown or yml `qa.notes` |

## Rules

- Do **not** edit `src/`, `docs/PLANS.md`, or workflows unless user explicitly escalates to dev.
- Do **not** invent dollar amounts — use Brad's numbers or ask.
- Never commit secrets.
- Client publish must not gain new sensitive fields; `commercial` stays internal (already excluded from client views).
