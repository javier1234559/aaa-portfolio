# PLANS — AAA Portfolio (full context for future builds)

**App name (display):** AAA Portfolio  
**npm package:** `aaa-portfolio`  
**Code location:** `idea/` inside monorepo `aaa-discovery-template`  
**Purpose:** Single living document so future agents/humans can continue builds without re-reading the whole chat.

**Languages:** This file is **English** for technical precision; product discussions may be in Vietnamese.

---

## 1. Origin & stakeholders

- **Brad** asked for an internal tool: **global visibility** across client projects and sales pipeline—not another Jira replacement.
- **Javier** is building the MVP in `idea/` after aligning with:
  - **`aaa-discovery-template`** — the 15-step Discovery skill workflow (Claude Code).
  - **`aaa-client-dashboard/`** — existing per-client status UI + sync patterns (Next.js + optional FastAPI + Postgres + GitHub Actions writing JSON into the repo).
- Brad’s sequence for design: run **Discovery skill end-to-end** on a real project, then **Claude Design** for hi-fi UI (external step).

---

## 2. Problem statement

- Work is **spread across** Jira, GitHub, Slack, meeting tools (Fireflies / Granola / Zoom), Notion, client-facing dashboards, and email.
- Leadership/PM lack a **single pane of glass**: “What phase is each deal/project in, what’s blocked, what’s next?”
- Client status questions should be answerable from a **consistent** narrative + links—not ad-hoc DMs only.

---

## 3. Brad’s product vision (internal portfolio)

### 3.1 Gantt-style overview (target, not fully built in MVP)

- **Web app** with a **Gantt chart**.
- **Left column:** rows = **sales pipeline deals** AND **client projects** (by name), visually separated.
- **Right side:** **timelines** per row; **segment colors** map to lifecycle **phase** (see §4).
- **Throughput / cadence:** Brad mentioned ~**5 business days** discovery-to-handoff as a cultural target on the AAA discovery skill—not a hardcoded app rule unless we add SLAs later.

### 3.2 Phase-colored timeline (six phases)

Canonical phase list for the **portfolio / Gantt** product:

1. **Sales**  
2. **Discovery**  
3. **Build**  
4. **QA**  
5. **UAT**  
6. **Maintenance**

These are **not** identical to the **`aaa-discovery` skill’s internal “Discovery Phase”** (15 steps ending in handoff). See **§6** for mapping and naming tension.

### 3.3 Financial / pipeline evolution (later)

- Eventually show **money in each phase** (e.g. read **Proposal** for estimate in Sales-ish window; **SOW** when in client delivery phases).
- Later: **lead source** (LinkedIn, email outreach) as volume scales.
- **Constraint (AAA):** pricing / payment terms must **not** leak into technical specs, Jira tech fields, or PRDs—commercial data lives in **separate buckets** (finance DB, CRM, or controlled docs) with ACL. The portfolio app may show $ **only** in restricted views.

---

## 4. Brad’s phase transition triggers (webhooks / automation intent)

These are **requirements intent**—implementation may combine **webhooks**, **polling GitHub Actions**, and **manual overrides**.

| Phase start (concept) | Intended signal (Brad) |
|---------------------|-------------------------|
| **Sales** | When the **first meeting ends** (Fireflies, Granola, Zoom). *Note: wording may mean “anchor timeline after first call”—confirm with Brad.* |
| **Discovery** | When **Project Brief**, **GitHub repo**, **Jira board**, and **Slack channel** exist. |
| **Build** | When **client dashboard** is ready **and** the **first Jira ticket** moves to **In Progress**. |
| **QA** | When **all Jira tasks** are **Done** (definition: which issue types count—must be specified). |
| **UAT** | When **QA issues fixed** and app/automation **deployed to production** with **monitoring**. |
| **Maintenance** | When **handoff document** is sent to the client. |

**Open engineering work:** normalize these into an **event schema** (`meeting.ended`, `repo.created`, `jira.board.created`, `slack.channel.created`, `jira.issue.in_progress`, `jira.all_done`, `deploy.production`, `handoff.sent`, …) plus **idempotent rules** that compute `current_phase` and segment boundaries.

---

## 5. Internal vs client-facing surfaces (two products in one ecosystem)

### 5.1 AAA Portfolio (`idea/` — this app)

- **Audience:** internal (PM, leadership, engineers).
- **Jobs-to-be-done:** portfolio table → **project detail** with **phase tabs** (Sales … Maintenance), links to artifacts, eventually Gantt + revenue rollups.
- **MVP UI (implemented):** `/` marketing, `/login` mock auth, `/app` **table** (not Gantt yet), `/app/projects/[slug]` **tabs**; rows from `config/` (YAML + JSON, aligned with `aaa-client-dashboard` clients + data files).

### 5.2 `aaa-client-dashboard` (existing sibling repo / folder in monorepo)

- **Audience:** **client-facing** bookmark URL `…/client/[slug]`.
- **Stack (documented in its `CLAUDE.md`):** Next.js on Vercel + shared FastAPI on Railway + Postgres + Clerk for **admin**; `/client/*` public; Slack webhook for contact; Jira/GitHub **sync via GitHub Actions** committing JSON under `app/src/app/client/data/<slug>/`.
- **Multi-client:** `CLIENTS` registry in `clients.ts` + per-slug data dir—**one deploy, many clients**.
- **Relationship to Portfolio:** Portfolio should **deep-link** to client dashboard where appropriate (Build tab), not re-implement the entire client UI unless product says otherwise.

### 5.3 Future: simplified **client status** page (not in MVP v0.1)

Concept from Javier/Brad discussions—three sections:

1. **Comments** → notify **Slack** (needs server endpoint + persistence if history matters). **Portfolio stub:** `POST /api/portfolio/comments` + `slack-comment-notify.ts` (Slack commented until env) — see **§7.6**.
2. **Status** — visual **phase stepper** (where we are now).  
3. **Sidebar** — minimal client-safe reading list per phase.

Likely needs **small backend** (same pattern as dashboard: don’t expose Slack webhook secret to browser; store comments in DB).

---

## 6. `aaa-discovery` skill vs portfolio “Discovery” (critical distinction)

### 6.1 What the skill is

- **Name:** `aaa-discovery` (Claude Code skill, installs under `~/.claude/skills/aaa-discovery/` via `install.sh` in template repo).
- **Purpose:** **15 sequential steps** from sales artifacts → scoped, ticketed, client-informed handoff **before** engineers write production code.
- **Orchestrates other skills/agents:** e.g. `grill-me`, `to-prd`, `board-nanny`, `cto-technical-architect` (as documented in `SKILL.md`).

### 6.2 Naming collision

- **Skill “Discovery Phase”** = the whole **15-step run** ending with handoff email + DOCX (internal AAA definition).
- **Gantt “Discovery”** = Brad’s segment that starts when **brief + repo + Jira + Slack** exist—**earlier** in the skill timeline than “skill discovery complete.”

**Implication for AAA Portfolio:** either use **different labels** in the UI (`Setup`, `Delivery discovery`, …) or store **two parallel models**: `skill_step` (1–15) vs `portfolio_phase` (six colors). Document the mapping explicitly in code when we implement automation.

### 6.3 High-level skill step list (for mapping automation)

1. Read transcripts  
2. Read signed proposal  
3. Write project brief (`spec/project-brief.md`)  
4. `/grill-me` on brief (product)  
5. `/to-prd` → `spec/prd.md`  
6. Jira project + **empty** board  
7. GitHub repo + README  
8. Slack **internal** review (`#next` / team channel) with brief+PRD DOCX  
9. Revise specs + bump versions + regen DOCX  
10. `/grill-me` architecture (**engineer-led**)  
11. Tech spec `spec/tech-spec.md`  
12. `board-nanny` fills Jira  
13. Client status artifact (dashboard / link)  
14. Pandoc DOCX to client docs dir (**never** in git)  
15. Client handoff email markdown under `client-comms/`

**Global rules from skill:** no financials in brief/PRD/tech spec/Jira; DOCX only under client docs path; sequential steps—don’t skip.

---

## 7. Data, sync, and “how we avoid scattered chaos”

### 7.1 Recommended architecture (from discussions)

- **Event-first:** append-only **`ProjectEvent`** (`project_id`/`slug`, `type`, `ts`, `source`, `payload`) → **rule engine** updates `current_phase` + Gantt segments. Supports webhooks + cron + manual overrides.
- **Deterministic sync:** **GitHub Actions** on a schedule + `workflow_dispatch` (pattern already in `aaa-client-dashboard` for Jira + GitHub activity → JSON committed to repo). Good for **audit trail** and **no token burn** for steady sync.
- **Interactive / ad-hoc:** **MCP** (Jira, Slack, Atlassian, etc.) while a human or agent is working—**complements** Actions; does not replace scheduled sync for baseline truth.

### 7.2 JSON-in-git vs database (Next.js on Vercel)

- **Read-only dashboards** from committed JSON: **works** (dashboard pattern).
- **Runtime “edit JSON files in repo” from a serverless route:** **not viable** on Vercel (read-only FS except temp). Options:
  - **Postgres** (or Supabase) for mutable state (comments, overrides, phase locks), **or**
  - **GitHub API** commits / PRs for config changes.

### 7.3 AI in the loop

- **Good for:** scaffolding, summarizing diffs, drafting copy, **Q&A over structured metadata** once indexed.
- **Not sole source of truth** for phase or $—persist decisions in DB or git with review.

### 7.4 Config format for fast client onboarding

- **YAML** often best for **human-edited** `project.config.yaml` (comments, multiline); scripts can emit **JSON** for the Next app.
- **JSON** fine if team prefers JS-only editing.
- **Skill** should target **both Cursor Agent Skills and Claude Code skills** where possible—same `SKILL.md` content, different install paths (`~/.cursor/skills/…` vs `~/.claude/skills/…`).
- **In-repo helpers:** `.cursor/skills/` (`about`, `ceo-init`, `ceo-update`, `ceo-ask`, `ceo-stats`, `dev-ask`, `dev-new-feature`), mirrored under `.claude/skills/`, and `.cursor/rules/portfolio-config.mdc`.

### 7.5 Jira & GitHub snapshots — automated cadence (dashboard is the model)

- **Reference implementation:** **`aaa-client-dashboard`** scheduled **GitHub Actions** (`aaa-client-dashboard/.github/workflows/sync-jira-data.yml`, `sync-github-activity.yml`) call Python scripts and **commit** JSON under `app/src/app/client/data/<slug>/` (`sprint-progress.json`, `github_activity.json`).
- **AAA Portfolio (standalone `idea/` repository):** GitHub Actions in **`.github/workflows/`** of this app — `portfolio-sync-jira.yml` and `portfolio-sync-github-activity.yml` — run on a **similar cadence** and write **`config/projects/<slug>/data_sprint_progress.json`** and **`data_github_activity.json`**. Project list + keys: **`config/ci-sync-manifest.json`** (omit `jira_project_key` or `github_repo` when that sync does not apply).
- **Python entrypoints:** `scripts/sync_jira_portfolio.py` and `scripts/sync_github_portfolio.py` mirror the dashboard scripts’ Jira Agile + GitHub REST logic; only the **output paths** differ.
- **Secrets:** same pattern as the dashboard — `JIRA_*` for Jira; `GH_PAT_REPO_READ` (or `GITHUB_TOKEN`) for GitHub. Configure as **repository or organization secrets** on the repo that hosts this monorepo.
- **Keeping dashboard and portfolio in sync:** if you also maintain `aaa-client-dashboard`, you can run **both** automation stacks or consolidate later — this repo is **independent** and does not depend on sibling folders at runtime.
### 7.6 Internal portfolio comments (Next.js API + Slack intent)

- **Different from Jira/GitHub sync:** comments are **interactive** — users expect a UI, **POST** to persist, and optional **real-time** refresh. That requires at least one **Next.js Route Handler** (e.g. `POST /api/portfolio/comments`) running on the server, never calling Slack from the browser (webhook secret must stay server-side — same lesson as `aaa-client-dashboard` contact flow).
- **Persistence (choose explicitly before shipping):** (a) **Postgres / Supabase** — best default for append-only threads and search; (b) **GitHub Contents API** — replace `data_comments.json` via authenticated API — good audit trail but **PR/commit noise**, **rate limits**, and **concurrency** handling; (c) **hybrid** — DB for live UI, optional export to git. Vercel serverless **cannot** append to tracked files on disk; git updates always go through GitHub. MVP may return **202** with no durable store until one of the above exists.
- **Why not one git commit per comment by default?** Possible via GitHub API from the Route Handler, but usually worse ergonomically than a small **DB** for high-churn internal threads (see (a)).
- **Slack:** when a comment is created, the server should optionally **POST** to a Slack incoming webhook (e.g. `#client-comms` or `#portfolio-internal`). **No Slack credentials are configured in this repo yet** — the helper in `src/lib/portfolio/slack-comment-notify.ts` is **present but fully commented** until `SLACK_WEBHOOK_URL_PORTFOLIO_COMMENTS` (or similar) is set in deployment env. Uncomment and wire from the Route Handler once the webhook exists.

---

## 8. Per-phase detail tab intent (internal project page)

What each tab should **eventually** surface (MVP uses mocks where noted):

| Phase | Content intent |
|-------|----------------|
| **Sales** | Table of **meetings**; links to **transcripts** (prefer link + metadata over full text in DB; ACL for sensitive). |
| **Discovery** | **Table or shallow tree** of discovery artifacts (brief, PRD, tech spec, grill session, etc.)—links to Git paths or exported docs. |
| **Build** | Link to **`aaa-client-dashboard`** for that slug; **Jira** activity grouped by status; **GitHub** commits/PRs + repo link. |
| **QA** | Links to **Notion** QA checklists; **Loom** embed or link. |
| **UAT** | Handoff pack: staging URL, **credential distribution policy** (no real passwords in public git—use vault / token-gated page). |
| **Maintenance** | Owner, escalation channel, SLA notes, renewal / support contract pointers. |

---

## 9. Security & compliance notes

- **Mock auth today:** `NEXT_PUBLIC_MOCK_EMAIL` / `NEXT_PUBLIC_MOCK_PASSWORD` + `portfolio_session` cookie—**not production-safe** (`NEXT_PUBLIC_*` is exposed to browser bundles). Replace with real auth before externalizing.
- **Secrets in UI:** especially UAT; use **token-gated** routes or internal-only views.
- **Slack webhooks:** never call directly from untrusted client without backend validation / rate limits.

---

## 10. Current implementation status (`idea/` repo)

| Area | Status |
|------|--------|
| **Routes** | `/` public marketing; `/login`; `/app` projects table; `/app/projects/[slug]` detail tabs; API `/api/auth/login`, `/logout`, `/me`. |
| **Auth** | Mock credentials from env; `httpOnly` cookie **`portfolio_session=ok`**; middleware guards `/app`. |
| **UI** | shadcn **table** + **tabs** + cards; sidebar shell under `(private)/app`. **Detail pages** (`/app/projects/[slug]`, `/app/publish/[slug]`) use a **single-column stacked** layout (no cramped two-column split). **Tables** include client-side **pagination** (Active Stream + Publish portals; paged lists on detail views where lists are long). Semantic tokens for light/dark (`bg-card`, `border-border`, …). |
| **Data + CI** | `config/` + `config/ci-sync-manifest.json`; `.github/workflows/portfolio-sync-*.yml`; `scripts/sync_*_portfolio.py` (Jira/GitHub); `scripts/sync_comments_portfolio.py` documents comment pipeline (no cron). |
| **Comments API (stub)** | `POST /api/portfolio/comments` validates input; **Slack** helper commented until env set (**§7.6**). No persistence yet. |
| **Gantt / sync / webhooks** | **Not built**—documented as next milestones. |

---

## 11. Non-goals (MVP v0.1)

- Real Gantt rendering and drag-edit timelines.
- Live Jira/GitHub ingestion **inside this Next app** (snapshots are refreshed via **dashboard GitHub Actions** + copy/CI — see **§7.5**).
- Production-grade auth / multi-tenant RBAC.
- Storing full transcripts, real UAT passwords, or pricing tables in git-tracked files.

---

## 12. Milestones (ordered, expanded)

1. **View model file** — `config/projects.manifest.yaml` + per-slug folder; table + detail read from it (YAML + JSON; sprint/GitHub JSON mirrors `aaa-client-dashboard` data files).
2. **Gantt read path** — Compute horizontal segments from `ProjectEvent` or denormalized `phase_intervals` table; read-only chart.
3. **GitHub Actions** — Port/adapt `sync-jira-data.yml` / `sync-github_activity.yml` ideas: **manifest-driven** matrix instead of N duplicate steps when possible.
4. **Event ingestion** — Webhook endpoints (GitHub/Jira/Slack) writing to DB or append-only log; idempotent processing.
5. **Client status** — `/status/[token]` public-lite page: stepper + comments + Slack notify + persistence.
6. **Commercial rollup** — Restricted internal view for $ by phase; explicit ACL; no bleed into Jira/spec pipelines.
7. **Skills** — `project.config.yaml` + Cursor/Claude skill to scaffold registry entry + data dir + optional PR (mirror `aaa-client-init` philosophy).

---

## 13. Open questions (resolve with Brad / PM)

1. Exact meaning of **“Sales phase begins when first meeting ends”**—start vs end of sales, or milestone only?  
2. **Jira “all tasks DONE”** for QA transition—which issue types / epics excluded?  
3. **Single Slack channel** that gates “Discovery started” vs multiple (`#next`, `#client-comms`, `#slug-sprint`)—which is authoritative for automation?  
4. Should **portfolio** ever **mutate** Jira, or remain **read-mostly** with overrides stored locally?

---

## 14. References (paths in monorepo)

| Asset | Path / URL pattern |
|-------|---------------------|
| This app | `idea/` |
| Plans (this file) | `idea/docs/PLANS.md` |
| Conventions | `idea/docs/CONVENTION.md` |
| Client dashboard (reference) | `aaa-client-dashboard/` — `app/src/app/config/clients.ts`, `app/src/app/client/data/<slug>/`, `.github/workflows/sync-*.yml` |
| Discovery skill template | `aaa-discovery-template/SKILL.md`, `references/step-*.md` |
| Portfolio GitHub Actions | `.github/workflows/portfolio-sync-jira.yml`, `portfolio-sync-github-activity.yml` (this repo root) |
| Portfolio CI manifest | `config/ci-sync-manifest.json` |
| Portfolio config + synced JSON | `config/projects.manifest.yaml`, `config/projects/<slug>/` |
| Live client dashboard pattern | `https://dashboard.automationarchitecture.ai/client/[slug]` (example; confirm per env) |

---

## 15. Maintenance of this document

- After each major build increment, append a **short “Changelog”** subsection with date + what changed (optional).
- When Brad decisions change phase rules, update **§4** and **§13** first—everything else hangs off that.

---

## 16. Changelog & conversation context (product / UX)

_Added from implementation feedback (May 2026). Vietnamese product notes are summarized in English for this doc._

### 16.1 Layout: project detail & publish detail (client portal)

- **Problem:** Two-column layouts (`lg:grid-cols-*` with a narrow primary column + sidebar) felt **cramped** and wasted horizontal space on `/app/projects/[slug]` and `/app/publish/[slug]`.
- **Direction:** Prefer a **single primary column** (`max-w-4xl` / `max-w-3xl` centered): **one full-width section per row** (stacked cards), inspired by clean “detail” UIs (label left / value right rows, subtle dividers).
- **Internal vs client:** `ProjectDetailView` (internal) and `ClientPortalView` (publish preview) should both follow this **stacked** pattern so previews at e.g. `/app/projects/kidneyhood` and `/app/publish/kidneyhood` match the same spatial logic.

### 16.2 Tables & lists

- **Pagination:** All **data `<table>`** views in the app should expose **client-side pagination** (Prev/Next + “x–y of z”) so long manifests do not sprawl. Initial implementation: **Active Stream** table (`PortfolioProjectTable`) and **Active Shared Portals** table (`PublishPortfolioView`). Long **lists** inside detail pages (artifacts, GitHub activity, combined sales rows) use the same control pattern where useful.
- **Overflow:** Tables stay in `min-w-0` + horizontal scroll wrappers where needed; footers remain readable.

### 16.3 Theming

- **Semantic tokens:** Prefer `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-muted` over raw `bg-white` / `border-gray-*` so **dark mode** stays consistent (see `globals.css` and `docs/BRAND.md`).
- **Chrome:** Theme toggle lives in the **portfolio user popover** next to Account settings / Notifications / Log out (not a separate sidebar strip).

### 16.4 Preview URLs (local)

- Example smoke routes after `npm run dev` in `idea/`: `http://localhost:3000/app/projects/kidneyhood`, `http://localhost:3000/app/publish/kidneyhood` (slug must exist under `config/projects/`).

### 16.5 Follow-ups (not closed in this increment)

- **Server-driven pagination** when data moves from static JSON to API/DB.
- **Gantt** and phase automation remain per **§12** / **§4**.

---

## 17. Near-term backlog (UI polish + skills)

Ordered checklist for the **current build track** (UI-first; backend/Gantt deferred per **§11**). Check items in Git / update this list when shipped.

**Design brief (prompt for redesign / handoff):** `docs/DESIGN.md`

### 17.1 UI / UX

- [x] **Project detail density** (`/app/projects/[slug]`) — reduce redundant cards; single **snapshot** band for metadata + intent; emphasize **health** + **progress**; tighter “People & links” (see `docs/DESIGN.md`).
- [ ] **Publish / client preview parity** — `ClientPortalView` + `/app/publish/[slug]` aligned with the same snapshot + density patterns as internal detail.
- [ ] **Portfolio dashboard table** — optional second pass for row density / status scannability after detail page stabilizes.
- [ ] **Lightweight pipeline readout** — read-only **phase stepper** or slim timeline derived from `currentPhase` + config (no drag-edit; precursor to Gantt in **§12**).

### 17.2 Agent skills (Cursor + Claude; `.cursor/skills/` + `.claude/skills/`)

- [x] **`@about`** — hub menu; routes Brad to the right tag.
- [x] **`@ceo-init`** — scaffold project from proposal + transcript; includes `commercial:` block.
- [x] **`@ceo-update`** — edit existing project config (phase, commercial, team, milestones); redirects UI work to `@dev-new-feature`.
- [x] **`@ceo-ask`** — per-project Q&A from `config/projects/<slug>/`.
- [x] **`@ceo-stats`** — portfolio rollup including revenue forecast.
- [x] **`@dev-ask`** — engineering Q&A (read-only).
- [x] **`@dev-new-feature`** — all engineering work (UI, config schema, manifest, CI, loader); updates this PLANS file.
- [x] **Commercial in config + UI** — YAML `commercial:`; dashboard forecast card + table Revenue column + detail Revenue tile.
- [ ] **Skill: sync hygiene** — compare manifest slugs to folders; flag missing `data_*` files or stale keys (local / CI helper).
