---
name: ceo-ask
description: >-
  Answer questions about one portfolio project from config/projects/<slug>/ only.
  Use when Brad asks status, team, phase, revenue, Jira, or commits for a named client.
disable-model-invocation: true
---

# CEO — ask project

## Pick project

1. If the user message includes a **slug** or obvious project name → resolve via `config/projects.manifest.yaml`.
2. Else list numbered slugs from the manifest and wait for one choice.

## Read (read-only unless user asks to update)

- `config/projects/<slug>/<slug>.yml` — phase, team, **commercial**, URLs, description
- `data_sprint_progress.json` — Jira / sprint snapshot
- `data_github_activity.json` — recent commits
- `milestones.yaml` — delivery gates
- `data_sales_meetings.json` — sales transcripts
- Phase folders: `discovery/`, `qa/`, `uat/`, `maintenance/` markdown

## Answer style

- Short, executive-friendly bullets.
- Cite file paths when stating facts.
- For **money**: use `commercial` in YAML; if missing, say so and suggest `@ceo-init`.
- For **delivery %**: from Jira JSON or app rules — do not guess.
- Default **read-only**. To change phase or $ → confirm then edit YAML or suggest `@ceo-init`.

## Do not

- Edit `src/` or run destructive git commands.
- Expose internal revenue on client publish pages.
