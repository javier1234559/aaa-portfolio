# DESIGN — Prompt & brief (AAA Portfolio project detail)

Use this file when you want a **fresh visual pass** (human designer, Figma, or **Claude Design** / similar) on the **internal project detail** screen, e.g. `/app/projects/kidneyhood`. Paste or tag this document as the single source of truth for the redesign request.

**Hard constraints (do not violate):**

- Follow **`docs/BRAND.md`** (soft SaaS, semantic tokens, Inter, pill controls, `rounded-2xl` cards).
- Follow **`docs/CONVENTION.md`** (Next.js App Router; business logic stays out of `page.tsx`; portfolio UI lives under `src/feature/portfolio/`).
- **`docs/PLANS.md` §16:** keep **one primary column** (`max-w-3xl`–`max-w-4xl` centered) — no return to cramped two-column master/detail for this page.
- **No new backend** for this iteration: all data is still **config-driven** (YAML + JSON snapshots).

---

## 1. Problem (current UI — May 2026)

Reference: internal detail page (KidneyHood-style).

- **Too many stacked full-width cards** for the same facts (Overview + “Global status & intent” repeat client, engagement, phase).
- **Very low information density:** label-left / value-right rows each consume a full row; large empty whitespace in the card center.
- **Weak hierarchy for operational signals:** **Health** and **Progress** read as equal-weight text; progress bar is **too thin / low-contrast** at low percentages.
- **Redundant copy:** project name and phase appear in the hero, again in Overview, again in the prose block, again in pills.
- **People & links** adds **vertical scroll** before the user reaches **phase tabs / pipeline** (the main “where are we?” surface).

Product intent: this page must answer in **under 5 seconds**: *Which phase? Healthy or at risk? How far? Where do I click next (dashboard, Jira, GitHub)?*

---

## 2. Goals (this redesign cycle)

1. **Status-first layout** — At the top, a **single snapshot region** (one card or one bordered region) that shows: **phase**, **health** (color + icon, never plain gray body text only), **progress** (large numeric + **thick** track, visible at 0–10%), **client**, **slug**, **engagement** — **without repeating** the same fields in a second card.
2. **One sentence of intent** — Optional short line under the KPI strip (max ~2 lines); must **not** duplicate the grid above.
3. **Pipeline / phase navigation** — Make the **phase tab strip** feel like the **spine** of the page: visually connected to the snapshot (same surface or shared top border), so the mental model is *status → pipeline → stream items*.
4. **People & links** — Keep content, but **compress**: e.g. two columns on `md+`, or a compact link row + small team list; avoid another deep card tower before tabs.
5. **Beautiful but enterprise-dense** — Airy **page** chrome, but **data-dense** summary; align with **BRAND** (hairline borders, `shadow-sm`, muted captions).

Non-goals for this prompt: real Gantt, drag-edit timelines, live webhooks, production auth (see **`docs/PLANS.md` §11**).

---

## 3. Suggested layout directions (for designer / image model)

Pick one primary direction (or hybrid) and specify spacing in **8px grid**.

**A — “KPI ribbon” (recommended)**  
Single card: top row = 3–4 **equal-height KPI tiles** (Phase | Health | Progress | “Open actions” or Jira open count). Second row = **dense 2×2 metadata grid** (Client, Slug, Engagement, Dashboard link). Third row = **one** intent line + **at most two** chips (e.g. engagement type + “Config-driven”).

**B — “Hero + inset snapshot”**  
Keep large title + description (max **2 lines** with `line-clamp-2`), but move **all** scalar fields into a **inset panel** with `bg-muted/30` and **tighter padding** so the hero does not float above an ocean of white.

**C — “Horizontal quick links”**  
Operational links as a **horizontal scroll** chip row under the KPI strip (icons + labels), instead of a vertical list of full-width rows.

Deliverables from design pass:

- **Mobile + desktop** frame (375px and 1280px).
- Annotation for **health** colors in light/dark.
- Spec for **progress** track height (min **8px**) and fill token (`bg-primary`).

---

## 4. Engineering handoff checklist

After design is approved:

- [ ] Implement in **`ProjectDetailView`** (and mirror **`ClientPortalView`** if parity required).
- [ ] Reuse **`mapPortfolioToUiProject`** / `portfolioProgress` — no new data fields unless product adds them to YAML.
- [ ] Keep **semantic Tailwind tokens** (`text-muted-foreground`, `border-border`, `bg-card`).
- [ ] Run **`pnpm lint`** (or project equivalent) on touched files.

---

## 5. One-line prompt you can copy

> Redesign the AAA Portfolio **internal project detail** page (`/app/projects/[slug]`): replace stacked redundant “Overview” + “Global status” cards with **one dense snapshot** (KPI strip for phase, health, progress; 2×2 metadata; single intent line); **emphasize health and progress** with color and a thicker progress track; compress **People & links** into a shorter block; connect visually to the **phase tab** pipeline below. Obey **`docs/BRAND.md`**: soft SaaS, semantic tokens, single centered column max-w-4xl, no Gantt/backend scope.
