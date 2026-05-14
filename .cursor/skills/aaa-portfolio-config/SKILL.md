---
name: aaa-portfolio-config
description: >-
  Maintains AAA Portfolio static config under idea/config: manifest, per-slug YAML,
  and JSON mirrors of aaa-client-dashboard sprint-progress and github_activity.
  Use when adding or renaming a portfolio project, refreshing Jira/GitHub snapshot
  files from the dashboard repo, or wiring new fields into the portfolio loader.
disable-model-invocation: true
---

# AAA Portfolio — config maintenance

## When to use

- User adds/removes a **client** that exists in `aaa-client-dashboard` `CLIENTS`.
- User wants to **refresh** `data_sprint_progress.json` / `data_github_activity.json` from the dashboard data tree.
- User edits **`idea/config/`** and needs consistency with `src/server/portfolio/load-config.ts`.

## Steps

1. **Manifest** — Add or remove `- slug: <slug>` in `idea/config/projects.manifest.yaml` in the desired table order.

2. **Folder** — Ensure `idea/config/projects/<slug>/` exists with:
   - `<slug>.yml` (required): copy fields from `aaa-client-dashboard/app/src/app/config/clients.ts` for that slug; set `clientDashboardPath` to `https://dashboard.automationarchitecture.ai/client/<slug>` (adjust base URL per environment); set `jiraProjectKey` and `githubRepo` from dashboard sync workflows where applicable.

3. **JSON from automation** — `data_sprint_progress.json` / `data_github_activity.json` are updated by **root** `.github/workflows/portfolio-sync-*.yml` (see `idea/config/ci-sync-manifest.json`). You can still copy from `aaa-client-dashboard` if you prefer a single sync source.

4. **Comments file** — Keep `data_comments.json` as `{ "comments": [] }` until the POST API and persistence layer exist.

5. **CI manifest** — Add the same `slug` to `idea/config/ci-sync-manifest.json` with `jira_project_key` / `github_repo` (or `null` to skip a sync).

6. **Verify** — Run `npm run build` inside `idea/`.

- Commit Slack webhook URLs or other secrets into YAML/JSON.
- Assume serverless routes can write back to `idea/config/` on Vercel (read-only filesystem except temp); see `docs/PLANS.md` for persistence options.
