# TUTORIAL — AAA Portfolio MVP (demo recording)

Step-by-step script to **install**, **run**, and walk through **CEO skills** in Cursor (or Claude Code).  
Use a throwaway project slug **`demo-example`** — delete it after recording (see [Cleanup](#cleanup-after-demo)).

**Time:** ~15–20 minutes on camera.

---

## Before you record

- [ ] Cursor (or Claude Code) opened on this repo root (`aaa-portfolio/`)
- [ ] Terminal ready
- [ ] Browser ready for `http://localhost:3000`
- [ ] This file open for copy-paste blocks below

**Skills live in:** `.cursor/skills/` (Cursor) and `.claude/skills/` (Claude Code). Tag with **`@skill-name`** in chat.

---

## Part 0 — Install and run

```bash
corepack enable
pnpm install
cp .env.example .env
pnpm dev
```

1. Open **http://localhost:3000**
2. Sign in with mock credentials from `.env`:
   - Email: `user@gmail.com`
   - Password: `123456`
3. You should land on the portfolio dashboard: **http://localhost:3000/app**

> If the app does not pick up new config later, restart `pnpm dev` after `@ceo-init` creates files.

---

## Part 1 — `@about` (skill menu)

**Paste in chat:**

```
@about

I just cloned AAA Portfolio. What can I do here?
```

**Say on camera:** The agent explains the app, lists CEO vs dev skills, and asks A–G what you want next. For this demo you will use **B → C → D → E** (init → update → ask → stats).

**Optional follow-up:**

```
I want to add a fake demo project and walk through the CEO workflow.
```

---

## Part 2 — `@ceo-init` (new demo project)

### 2a — Start the skill

**Paste in chat:**

```
@ceo-init

Create a new portfolio project for our demo recording.

Slug: demo-example
Project display name: Example CRM (Demo)
Client name: Example Corp
Current phase: sales

Use the proposal and meeting transcript below. This is FAKE data for a tutorial — we will delete the project after the demo.

Do not edit src/ — only config/ files.
```

### 2b — Proposal (copy everything below)

```
--- PROPOSAL (EXAMPLE — DELETE LATER) ---

Automation Architecture — Example CRM (Demo)
Prepared for: Example Corp
Date: May 15, 2026
Prepared by: Brad Wilcox, AAA Sales

Executive summary
Example Corp needs a lightweight CRM to track inbound leads from their website and route them to two sales reps. AAA will deliver a Next.js web app with Supabase auth, a lead inbox, and Slack notifications.

Scope (Phase 1)
- Lead capture form + admin inbox
- Assign lead to rep; status: New / Contacted / Qualified / Lost
- Slack #example-crm-alerts on new lead
- Deploy to Vercel (staging + production)

Commercial
- Fixed fee: USD 48,000
- Payment: 50% on SOW signature, 25% at UAT start, 25% at go-live
- Target SOW signature: June 30, 2026
- Assumes 8-week delivery from kickoff

Out of scope
- Salesforce integration (Phase 2 option)
- Mobile native apps

Acceptance
- Signed SOW + deposit triggers Discovery phase per AAA lifecycle.

Contact
- Client: Alex Example (CEO, Example Corp)
- AAA Sales: Brad Wilcox
- AAA Delivery / QA: Javier
```

### 2c — Meeting transcript (copy everything below)

```
--- MEETING TRANSCRIPT (EXAMPLE — DELETE LATER) ---

Source: Fireflies
Meeting: Example Corp — Discovery intro call
Date: 2026-05-10
Attendees: Alex Example (Example Corp), Brad Wilcox (AAA), Javier (AAA)

Brad: Thanks for joining. Today we align on the CRM scope from the proposal.

Alex: We get ~40 leads per week from the website form. Right now it's a shared Gmail inbox — we need assignment and status.

Javier: We'll stand up a GitHub repo and Jira board after SOW. Slack channel #example-crm works for alerts.

Brad: Proposal is forty-eight thousand, fifty percent on signature. Does that match your budget timeline?

Alex: Yes, goal is to sign by end of June and be live before Q4 busy season.

Brad: We'll keep phase at Sales until SOW is signed, then move to Discovery when repo, Jira, and Slack are ready.

Alex: Perfect. Send the SOW this week.

[End of transcript]
```

### 2d — Optional: one-shot prompt (proposal + transcript combined)

If you prefer a **single message**, paste **2a** then immediately append **2b** and **2c** in the same chat turn.

### 2e — What the agent should create

Confirm these exist (agent may ask one clarifying question — answer from the proposal):

| Item | Path |
|------|------|
| Manifest row | `config/projects.manifest.yaml` → `- slug: demo-example` |
| CI row (nullable keys OK) | `config/ci-sync-manifest.json` |
| Project YAML | `config/projects/demo-example/demo-example.yml` |
| Comments stub | `config/projects/demo-example/data_comments.json` |
| Sales meetings | `config/projects/demo-example/data_sales_meetings.json` |

**Expected YAML highlights** (agent should derive from proposal):

- `currentPhase: sales`
- `commercial.proposalAmount: 48000`, `status: pipeline` or `proposed`
- `team.sales: Brad Wilcox`, `team.qa: Javier`, `team.clients: [Alex Example]`
- `clientDashboardPath` — placeholder `https://dashboard.automationarchitecture.ai/client/demo-example` is fine
- `jiraProjectKey` / `githubRepo` — placeholder or `null` in CI manifest if unknown

**After agent finishes:**

```bash
pnpm run build
```

Restart dev server if the new project does not appear.

---

## Part 3 — Check the UI

| Step | URL / action | What to show on camera |
|------|----------------|-------------------------|
| 1 | http://localhost:3000/app | Dashboard — **Revenue forecast** card; table row **Example CRM (Demo)** with Revenue column |
| 2 | `/app/projects/demo-example` | Project detail — snapshot (phase **Sales**, **Revenue** tile), phase tabs |
| 3 | **Sales** tab | Meeting from `data_sales_meetings.json` (Fireflies transcript) |
| 4 | Phase strip | Dates only for phases reached (Sales only while `currentPhase: sales`) |

**Say on camera:** Data is file-based under `config/` — no database. Jira/GitHub panels may be empty until CI sync runs; that is expected for the demo slug.

---

## Part 4 — `@ceo-update` (edit the demo project)

**Paste in chat:**

```
@ceo-update

Update project demo-example (Example CRM Demo):

1. Change currentPhase from sales to discovery
2. Update commercial:
   - status: signed
   - proposalAmount: 48000
   - contractedAmount: 48000
   - collectedAmount: 24000
   - winProbability: 1
   - expectedCloseDate: 2026-06-30
   - notes: Demo recording — signed SOW, 50% collected
3. Add one milestone in milestones.yaml:
   - title: SOW signed
   - startedAt: 2026-06-15
   - completed: true
   - phase: sales
4. Add a second milestone:
   - title: Discovery kickoff
   - startedAt: 2026-06-20
   - completed: false
   - phase: discovery

Only edit config/ for demo-example. Do not touch src/.
```

**Check UI again:**

- Refresh `/app/projects/demo-example` — phase **Discovery**, Revenue shows contracted / collected
- Phase dot strip shows **Sales** and **Discovery** dates

---

## Part 5 — `@ceo-ask` (Q&A one project)

**Paste in chat:**

```
@ceo-ask

For project demo-example:

1. What phase is it in and what is the revenue status?
2. Who is on the AAA and client team?
3. Summarize the last sales meeting in two sentences.
4. How much is left to collect on the contract?

Read only from config — do not change files.
```

**Say on camera:** Answers come from YAML + JSON under `config/projects/demo-example/`, not from guessing.

**Optional second question:**

```
@ceo-ask demo-example — What would we need before moving to Build phase per our portfolio lifecycle?
```

---

## Part 6 — `@ceo-stats` (portfolio rollup)

**Paste in chat:**

```
@ceo-stats

Give me an executive portfolio report:

- Headline revenue numbers (forecast, contracted, pipeline)
- Count of projects by phase
- Table of all projects with revenue line and one-line note
- "Attention this week" — include demo-example if it is signed and in Discovery

Use only checked-in config data. Mark demo-example clearly as demo/tutorial data.
```

**Say on camera:** Open `/app` side-by-side — totals on dashboard should align with config (all projects with `commercial:` blocks, including fake sample data on other slugs until you clean them up).

---

## Demo flow checklist (recording order)

| # | Tag | Done |
|---|-----|------|
| 0 | Install + `pnpm dev` + login | ☐ |
| 1 | `@about` | ☐ |
| 2 | `@ceo-init` + proposal + transcript | ☐ |
| 3 | UI: `/app` + `/app/projects/demo-example` | ☐ |
| 4 | `@ceo-update` | ☐ |
| 5 | UI refresh | ☐ |
| 6 | `@ceo-ask` | ☐ |
| 7 | `@ceo-stats` + dashboard | ☐ |

---

## Cleanup after demo

Remove the tutorial project so it does not stay in production config:

1. Delete folder: `config/projects/demo-example/`
2. Remove from `config/projects.manifest.yaml`:
   ```yaml
   - slug: demo-example
   ```
3. Remove its object from `config/ci-sync-manifest.json` → `projects` array
4. `pnpm run build`
5. Commit only if you intend to keep other changes; otherwise discard config edits

**Do not** leave `demo-example` in the manifest for real deployments.

---

## Quick reference — all CEO tags

| Tag | Use |
|-----|-----|
| `@about` | Menu — which skill to use |
| `@ceo-init` | New project from proposal + transcript |
| `@ceo-update` | Edit existing project config |
| `@ceo-ask` | Questions about one project |
| `@ceo-stats` | Whole-portfolio report + revenue |

Engineering (not part of this CEO demo): `@dev-ask`, `@dev-new-feature`.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| New project not in table | Restart `pnpm dev`; run `pnpm run build` |
| Revenue shows `—` | Add or fix `commercial:` in `<slug>.yml` via `@ceo-update` |
| Sales tab empty | Check `data_sales_meetings.json` was created by `@ceo-init` |
| Agent edits TypeScript | Re-prompt: "Only config/, this is @ceo-init" |
| UI change requested | Use `@dev-new-feature`, not CEO skills |

---

*Related: [`README.md`](../README.md) · [`AGENTS.md`](../AGENTS.md) · [`PLANS.md`](PLANS.md)*
