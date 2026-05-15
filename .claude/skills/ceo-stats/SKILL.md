---
name: ceo-stats
description: >-
  Portfolio-wide executive report: phases, health, revenue rollup, blockers.
  Use when Brad wants status of all projects or total forecast revenue.
disable-model-invocation: true
---

# CEO — portfolio stats

Read all projects from `config/projects.manifest.yaml` + each `config/projects/<slug>/`.

## Report structure (keep to one screen)

### 1. Headline numbers

- Project count · client count
- **Revenue forecast (total)** — sum per `src/feature/portfolio/lib/portfolio-commercial.ts` rules:
  - Signed: `contractedAmount - collectedAmount`
  - Pipeline/proposed: `proposalAmount × winProbability`
- **Total contracted** (signed/invoicing/closed only)
- **Pipeline weighted** (non-signed proposals)
- Count missing `commercial:` block

### 2. By phase

| Phase | # projects | $ forecast in phase |

### 3. Per project (table)

| Project | Phase | Health | Revenue line | Forecast | Note |

Derive health/progress using same logic as the app (`map-portfolio-display`) when possible; otherwise state phase + Jira open ticket count from JSON.

### 4. Attention (max 5 bullets)

- At Risk / Critical (from health rules)
- Open Jira blockers (status contains block/risk)
- Stale or empty sync JSON
- Deals with **expectedCloseDate** in next 30 days
- Missing `commercial` on active delivery projects

## Rules

- **Never invent dollar amounts** — only from YAML `commercial:` or say “not configured”.
- Internal report only; do not paste full transcripts.
- If many projects lack commercial data, recommend `@ceo-init` updates per slug.
- Offer: *“Drill into one project? → `@ceo-ask` + slug.”*
