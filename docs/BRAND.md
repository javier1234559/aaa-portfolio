# Brand update guide

Use this doc when you want to rebrand the template: favicon, SEO metadata, and app identity. **Tag this file** and either (1) provide a **single logo/brand image**, or (2) provide **generated favicon/icon files** to have them placed and config updated.

## Visual design system (soft SaaS)

This product UI follows a **soft-minimal dashboard** language (light shell, cool neutrals, blue primary, generous radius). It is distilled from the internal reference screens (light + dark variants): airy layout, white surfaces on a cool gray canvas, pill-shaped controls, and status color only where it carries meaning.

### Color

| Role | Light | Dark | Usage |
|------|--------|------|--------|
| **Canvas (app background)** | `#F8F9FB` | `#0F172A` | Page behind cards and sidebar |
| **Surface (card / sidebar)** | `#FFFFFF` | `#1E293B` | Cards, modals, sidebar panel |
| **Ink (primary text)** | `#0F172A` | `#F8FAFC` | Headings, table titles |
| **Muted text** | `#64748B` | `#94A3B8` | Secondary labels, captions, sidebar section labels |
| **Primary (brand blue)** | `#3B82F6` | `#60A5FA` | Primary actions, links, focus ring, active nav key line |
| **Primary on color** | `#FFFFFF` | `#0F172A` | Text/icons on solid primary buttons |
| **Nav active tint** | `#EEF2FF` (indigo-50) | `color-mix` toward `#1E293B` | Sidebar row active background |
| **Input fill** | `#F1F5F9` | `#334155` | Default field background (soft, low border) |
| **Border / hairline** | `#E2E8F0` | `#334155` | Dividers, card edges |
| **Success** | e.g. emerald | — | Positive status badges |
| **Warning** | e.g. amber | — | Pending / attention |
| **Danger** | e.g. red | — | Errors, destructive |

**Implementation:** CSS variables in `src/app/globals.css` map to shadcn tokens (`--primary`, `--background`, `--sidebar-*`, etc.). Legacy utility names such as `brand-green` / `brand-offwhite` in TSX resolve through the same tokens so older screens stay aligned when tokens change.

### Typography

| | |
|--|--|
| **UI / body** | **Inter** (400–600), loaded in `src/app/layout.tsx` as `--font-inter` → `font-sans` / `font-display` |
| **Mono** | **Geist Mono** for IDs, routes, code |
| **Hierarchy** | Large bold KPIs and page titles; small caps + wide tracking for section labels (e.g. sidebar groups) |

### Shape, spacing, elevation

| | |
|--|--|
| **Radius** | Prefer **16–24px** on cards (`rounded-2xl` / `rounded-3xl`); **pill** (`rounded-full`) on primary/secondary buttons and compact filters |
| **Rhythm** | **8px** base; comfortable padding inside cards (`p-6`–`p-8`) |
| **Shadow** | **Soft and shallow** — `shadow-sm` default; avoid heavy drop shadows except rare hero blocks |
| **Dark panels** | Optional **slate-900** (`#0F172A`) blocks for metrics / promos with **white** or **slate-200** foreground |

### Components (shadcn)

| Component | Direction |
|-----------|-----------|
| **Button** | `default` = primary blue, pill; `cta` = ink (black) pill for strongest single action (e.g. sign-in); `outline` = white + hairline border |
| **Input** | `default` = muted fill, pill or large radius, subtle focus ring toward primary; `outline` = classic bordered field |
| **Card** | White (light) / slate surface (dark), `rounded-2xl`, light border, `shadow-sm` |

**Code:** `src/app/globals.css`, `src/app/layout.tsx`, `src/components/ui/{button,input,card}.tsx`, portfolio views under `src/feature/portfolio/`. **Legacy layout reference:** `design/aaa-portfolio/` (structure only; colors follow this document).

---

## When you have only a logo/brand image

1. **Generate all favicon and icon sizes**  
   Go to **[RealFaviconGenerator](https://realfavicongenerator.net/)** and upload your image. It will generate the right formats and sizes for browsers, iOS, Android, and Google (favicon.ico, PNGs, SVG, Apple Touch, etc.).

2. **Download the package** from RealFaviconGenerator (ZIP with all files and optional HTML snippet).

3. **Tag this file again and attach the generated files** (or the ZIP). Ask the assistant to:
   - Place each file in the correct location (see below).
   - Update `src/config.ts` → `brandConfig` with your app name, description, author, etc.
   - Update `src/app/layout.tsx` metadata (title, description) and optional Open Graph / Twitter from `brandConfig` or your copy.

---

## Where to put favicon and icon files

| File / purpose | Location in this project |
|----------------|---------------------------|
| `favicon.ico` | `src/app/favicon.ico` (replace existing) |
| `icon.png` or `icon.svg` (browser tab) | `src/app/icon.png` or `src/app/icon.svg` |
| Apple Touch icon | `src/app/apple-icon.png` |
| Other PNGs (e.g. 192x192, 512x512 for PWA) | `public/` (e.g. `public/icon-192.png`, `public/icon-512.png`) |
| SVG favicon | `src/app/icon.svg` or `public/favicon.svg` |
| HTML snippet from generator | Use only the `<link>` and `<meta>` tags; add them (or equivalent) into `src/app/layout.tsx` if needed for extra platforms. |

Next.js App Router automatically serves `favicon.ico`, `icon.*`, and `apple-icon.*` from `src/app/`. Anything else (e.g. large PNGs) goes in `public/`.

---

## Checklist: favicon + SEO + brand config

- [ ] **Favicon / icons**  
  - [ ] Replace `src/app/favicon.ico`  
  - [ ] Add or replace `src/app/icon.png` or `icon.svg`  
  - [ ] Add or replace `src/app/apple-icon.png`  
  - [ ] Any extra icons (e.g. PWA) in `public/` and referenced if needed  

- [ ] **SEO & metadata** (in `src/app/layout.tsx` and/or page-level)  
  - [ ] `metadata.title`  
  - [ ] `metadata.description`  
  - [ ] Optional: `metadata.openGraph`, `metadata.twitter` (image, title, description)  

- [ ] **Brand config** (single source for app identity)  
  - [ ] Update `src/config.ts` → `brandConfig`:  
    - `NAME` — App name  
    - `DESCRIPTION` — Short app description (can be reused for default meta description)  
    - `VERSION` — App version  
    - `AUTHOR`, `AUTHOR_EMAIL`, `AUTHOR_URL` — For footer, legal, or meta  

Use `brandConfig` in layout (e.g. `metadata.title = brandConfig.NAME`) so changing it once updates the whole app.

---

## Quick prompt examples

- **“I’m tagging BRAND.md and attaching my logo image [image]. Guide me to generate favicons and tell me the next steps.”**  
  → Assistant reminds you to use [RealFaviconGenerator](https://realfavicongenerator.net/), then come back with the generated files.

- **“I’m tagging BRAND.md and attaching the favicon/icon files I generated. Place them in the right locations, update `src/config.ts` brandConfig with [app name], [description], [author], and update layout metadata to use brandConfig.”**  
  → Assistant places files, updates `config.ts`, and wires metadata in `layout.tsx`.
