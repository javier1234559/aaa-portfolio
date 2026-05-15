# AAA Portfolio

Internal **project portfolio** UI for Automation Architecture: one table of clients/deals, per-project phase tabs, and links to the live **client dashboard**. This repository is a **standalone Next.js app** (no separate backend service in MVP); static rows and Jira/GitHub snapshots are read from files under `config/`.

## Documentation

| Doc | Purpose |
|-----|---------|
| [`docs/PLANS.md`](docs/PLANS.md) | Product vision, phases, data/sync architecture, milestones |
| [`docs/CONVENTION.md`](docs/CONVENTION.md) | Engineering conventions |
| [`docs/BRAND.md`](docs/BRAND.md) | Visual brand |
| [`AGENTS.md`](AGENTS.md) | Agent entry point |

## Quick start

```bash
corepack enable   # once per machine; pins pnpm via package.json "packageManager"
pnpm install
cp .env.example .env   # adjust mock login if needed
pnpm run dev
```

Open `http://localhost:3000`, sign in with the mock credentials from `.env`, then open **Projects** (`/app`).

## Configuration (“static database”)

All portfolio rows and synced snapshots live under **`config/`** at the **root of this repo**:

- `config/projects.manifest.yaml` — ordered list of project `slug`s.
- `config/projects/<slug>/` — per project:
  - **`<slug>.yml`** — human-edited metadata (names, URLs, phase, Jira project key, GitHub `org/repo`, dashboard link, optional tab copy, optional **`commercial:`** for internal revenue rollup).
  - **`data_sprint_progress.json`** — Jira/sprint-style card snapshot (same shape as `aaa-client-dashboard` `sprint-progress.json`).
  - **`data_github_activity.json`** — recent commits (same shape as the dashboard `github_activity.json`).
  - **`data_comments.json`** — optional internal comment threads (read today; **writes** planned via API + persistence — see `docs/PLANS.md` §7.6).
  - **`milestones.yaml`** *(optional)* — delivery gates; use optional **`phase`** (`sales` … `maintenance`) to set the **start date** shown on the snapshot phase dot strip. Without `phase` rows, a compact Jira % bar appears in the Progress tile only.
  - **`data_sales_meetings.json`** *(optional)* — Sales tab meeting list + inline transcript (`source`, `meeting`, `date`, `attendees`, `transcript`).
  - **`discovery/`**, **`qa/`**, **`uat/`**, **`maintenance/`** *(optional)* — phase markdown (`*.md` with YAML frontmatter + body); rendered in the project detail tabs.

The Next.js loader resolves `config/` relative to the app root (this repo), or **`PORTFOLIO_CONFIG_ROOT`** if you override the path.

## GitHub Actions (this repo only)

Workflows live in **`.github/workflows/`** here (standard GitHub convention when this folder is its **own** git remote — nothing under `idea/` in a parent monorepo is required).

| Workflow | Schedule | Output |
|----------|----------|--------|
| [`.github/workflows/portfolio-sync-jira.yml`](.github/workflows/portfolio-sync-jira.yml) | Every 6h (`:05`) + `workflow_dispatch` | `config/projects/<slug>/data_sprint_progress.json` |
| [`.github/workflows/portfolio-sync-github-activity.yml`](.github/workflows/portfolio-sync-github-activity.yml) | Every 6h (`:35`) + `workflow_dispatch` | `config/projects/<slug>/data_github_activity.json` |

**Which projects to sync:** [`config/ci-sync-manifest.json`](config/ci-sync-manifest.json) — each row has `slug`, optional `jira_project_key`, optional `github_repo`. `null` skips that sync.

**Secrets** (repository or org — align with your `aaa-client-dashboard` secrets where possible):

| Secret | Used by |
|--------|---------|
| `JIRA_BASE_URL`, `JIRA_USER_EMAIL`, `JIRA_API_TOKEN` | Jira workflow |
| `GH_PAT_REPO_READ` (preferred) or `GITHUB_TOKEN` | GitHub workflow for private org repos |

## Scripts (`scripts/`)

| Script | Role |
|--------|------|
| [`sync_jira_portfolio.py`](scripts/sync_jira_portfolio.py) | Jira Agile API → `data_sprint_progress.json` (same logic as dashboard `sync_jira.py`). |
| [`sync_github_portfolio.py`](scripts/sync_github_portfolio.py) | GitHub REST → `data_github_activity.json` (same logic as dashboard `sync_github_activity.py`). |
| [`sync_comments_portfolio.py`](scripts/sync_comments_portfolio.py) | **No remote sync.** Explains that internal comments are not Jira data; use `POST /api/portfolio/comments` + persistence (`python scripts/sync_comments_portfolio.py --why`). |

Local examples (from **this repo root**):

```bash
export JIRA_BASE_URL=... JIRA_USER_EMAIL=... JIRA_API_TOKEN=...
python scripts/sync_jira_portfolio.py --slug kidneyhood --project-key LKID

export GITHUB_TOKEN=...
python scripts/sync_github_portfolio.py --slug kidneyhood --repo Automation-Architecture/LKID
```

**Reference implementation** (separate repo): `aaa-client-dashboard` — its `.github/workflows/sync-*.yml` and `scripts/sync_*.py` are the model this portfolio copies.

## Agent skills (Cursor + Claude Code)

Tag with **`@skill-name`** in chat. Mirrored under `.cursor/skills/` and `.claude/skills/`.

| Tag | Audience |
|-----|----------|
| `@about` | Menu — which skill to use |
| `@ceo-init` | Brad — new project from proposal + transcript |
| `@ceo-update` | Brad — edit existing project config (phase, revenue, team, …) |
| `@ceo-ask` | Brad — Q&A one project |
| `@ceo-stats` | Brad — portfolio report + revenue rollup |
| `@dev-ask` | Engineering — Q&A (architecture, config, code) |
| `@dev-new-feature` | Engineering — any code/config/CI change + `docs/PLANS.md` |

Entry point: [`AGENTS.md`](AGENTS.md). Cursor **rules:** [`.cursor/rules/portfolio-config.mdc`](.cursor/rules/portfolio-config.mdc).

### `commercial:` block (internal)

```yaml
commercial:
  currency: USD
  status: signed          # pipeline | proposed | signed | invoicing | closed
  proposalAmount: 95000
  contractedAmount: 88000
  collectedAmount: 44000
  winProbability: 0.5     # for pipeline deals (0–1)
  expectedCloseDate: "2026-06-01"
  notes: ""
```

## pnpm scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Next.js dev server |
| `pnpm run build` | Production build |
| `pnpm run lint` | ESLint |

## Comments API (stub)

- **`POST /api/portfolio/comments`** — JSON `{ "slug", "author", "body", "phase?" }`. Slack helper commented until env is set — see `src/lib/portfolio/slack-comment-notify.ts` and `docs/PLANS.md` §7.6.

## Security note (MVP)

Mock auth uses `NEXT_PUBLIC_*` credentials — **not** production-safe. Replace with real auth before exposing externally. Do not store secrets or real UAT passwords in tracked config.
