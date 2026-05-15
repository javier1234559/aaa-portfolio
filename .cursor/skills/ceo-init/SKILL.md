---
name: ceo-init
description: >-
  Scaffold a new portfolio project from proposal + transcript. Compares against
  config/projects/kidneyhood/ template. Use when Brad adds a deal or pastes SOW/proposal text.
disable-model-invocation: true
---

# CEO — init project

## Inputs (ask if missing)

1. **Slug** (kebab-case, e.g. `acme-crm`)
2. **Proposal** (paste or file path)
3. **Meeting transcript** (paste or file path) — optional but preferred for Sales tab

Ask **one section at a time** if data is incomplete.

## Checklist (mirror `config/projects/kidneyhood/`)

| Section | Files / fields |
|---------|----------------|
| Registry | `config/projects.manifest.yaml` — add `- slug: <slug>` |
| CI sync | `config/ci-sync-manifest.json` — `slug`, `jira_project_key`, `github_repo` |
| Core YAML | `config/projects/<slug>/<slug>.yml` |
| Stubs | `data_comments.json` → `{ "comments": [] }` |
| Optional | `milestones.yaml`, `data_sales_meetings.json`, `discovery/*.md` |

### `<slug>.yml` required fields

- `slug`, `projectName`, `clientName`, `engagementType`, `currentPhase` (usually `sales`)
- `slackContactChannel`, `apiBaseUrl`, `description`
- `jiraProjectKey`, `githubRepo`, `clientDashboardPath` (https URL when dashboard exists)
- `team:` — `sales`, `qa` (default Javier), optional `pm`, `clients[]`, `engineers[]`
- **`commercial:`** (internal only — never on client publish):

```yaml
commercial:
  currency: USD
  status: pipeline   # pipeline | proposed | signed | invoicing | closed
  proposalAmount: 0
  contractedAmount:
  collectedAmount: 0
  winProbability: 0.5
  expectedCloseDate: YYYY-MM-DD
  notes: ""
```

Extract **proposalAmount** and dates from the proposal. Do not invent numbers — ask Brad if unclear.

### Sales meetings JSON

From transcript → `data_sales_meetings.json`:

```json
{ "meetings": [{ "id", "source", "meeting", "date", "attendees", "transcript" }] }
```

## Rules

- **Only edit** `config/` and docs unless Brad asks for app changes.
- Never commit secrets, API tokens, or real passwords.
- After scaffold: suggest `pnpm run build` (engineering) and `@ceo-stats` to verify rollup.
- End with: *“Open `/app/projects/<slug>` after deploy. Later edits → `@ceo-update`. Questions → `@ceo-ask`.”*
