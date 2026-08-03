# Dark Theme Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace HospoGrad's light theme with a dark theme by swapping CSS custom-property values in the shared stylesheet, per the approved spec.

**Architecture:** Single-file token swap in `public/css/style.css` — no HTML/JS changes, no new files, no backend changes.

**Tech Stack:** Vanilla CSS custom properties, no build step.

## Global Constraints

- Scope is `public/css/style.css` only.
- Every color value comes from the spec's table verbatim — no improvised hex values.
- No light/dark toggle, no localStorage, no JS — full replacement only.

---

### Task 1: Swap palette, shadow, and school-banner-logo tokens to dark theme values

**Files:**
- Modify: `public/css/style.css`

**Interfaces:** None — this is a leaf change with no other tasks depending on it.

- [ ] **Step 1: Replace the `:root` color tokens**

Replace these lines inside `:root { ... }`:

```css
  --color-bg: #0f1720;
  --color-surface: #171f2b;
  --color-surface-hover: #1c2532;
  --color-text: #e8ecf0;
  --color-text-muted: #8b95a3;
  --color-border: #2a3441;
  --color-nav-bg: #12202e;
  --color-nav-bg-deep: #0a1219;
  --color-nav-text: #ffffff;
  --color-accent: #14b892;
  --color-accent-hover: #0f9878;
  --color-accent-soft: rgba(20, 184, 146, 0.15);
  --color-accent-soft-strong: rgba(20, 184, 146, 0.28);
  --color-link: #5eb3ff;
  --color-danger: #e2694a;
  --color-danger-soft: rgba(226, 105, 74, 0.15);
```

Leave `--radius-sm`, `--radius-md`, `--radius-lg`, `--font-display`, `--font-ui` untouched.

- [ ] **Step 2: Replace the shadow tokens**

Replace:

```css
  --shadow-sm: 0 1px 2px rgba(20, 26, 36, 0.06), 0 1px 1px rgba(20, 26, 36, 0.04);
  --shadow-md: 0 10px 24px -10px rgba(20, 26, 36, 0.2), 0 2px 6px rgba(20, 26, 36, 0.06);
  --shadow-accent: 0 8px 18px -6px rgba(11, 138, 108, 0.35);
```

with:

```css
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.35), 0 1px 1px rgba(0, 0, 0, 0.25);
  --shadow-md: 0 10px 24px -10px rgba(0, 0, 0, 0.55), 0 2px 6px rgba(0, 0, 0, 0.3);
  --shadow-accent: 0 8px 18px -6px rgba(20, 184, 146, 0.45);
```

- [ ] **Step 3: Replace the school-banner-logo treatment**

Find this block:

```css
.school-banner-logos img {
  height: 28px;
  width: auto;
  object-fit: contain;
  filter: grayscale(0.5) opacity(0.85);
  transition: filter 0.15s ease;
}
/* Grayscale-to-color reveal only where hover exists; touch devices keep the
   more legible default state above instead of a permanently faded logo. */
@media (hover: hover) {
  .school-banner-logos img { filter: grayscale(1) opacity(0.7); }
  .school-banner:hover .school-banner-logos img { filter: none; }
}
```

Replace it with:

```css
.school-banner-logos img {
  height: 28px;
  width: auto;
  object-fit: contain;
  background: #f4f5f7;
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.6rem;
}
```

(This removes the grayscale/hover treatment entirely — two of the nine logo files are opaque JPEGs with light backgrounds baked in, which would render as visible light rectangles on the new dark banner background without a consistent chip treatment. The light chip background makes every logo, opaque or transparent, read as an intentional design element instead of a broken image.)

Note: the `@media (max-width: 640px)` block later in the file already sets `.school-banner-logos img { height: 20px; }` for mobile — that rule still applies on top of this change and does not need modification, since it only overrides `height`, not `background`/`padding`/`border-radius`.

- [ ] **Step 4: Verify no syntax errors and visual correctness**

Run: `npx vitest run` in the repo root — confirm the backend suite (unaffected by this frontend-only change) still passes.

Manual/visual verification (no frontend test framework in this project): start `npx wrangler dev`, load `/index.html`, `/login.html`, `/category.html?slug=<any-seeded-slug>`, and a thread page in a browser. Confirm:
- Page background, cards, and tables are dark with light text, readable throughout
- The accent teal is clearly visible on buttons, active sort-toggle state, and hover highlights
- Links are legible (light blue, not the old dark blue)
- Card/comment hover-lift shadows are visible against the dark background
- All 9 school-banner logos render as light rounded chips with no visible light-rectangle artifacts around the two JPEG logos (`glion.jpg`, `ihtti.jpg`)
- Mobile viewport (375px) still looks correct — banner chips shrink with the existing mobile rule, no overflow

- [ ] **Step 5: Commit**

```bash
git add public/css/style.css
git commit -m "feat: switch to dark theme palette"
```

---

## Self-Review Notes

- **Spec coverage:** palette swap (Step 1), shadow adjustment (Step 2), school-banner logo chip fix (Step 3) — all three spec sections covered. No HTML/JS changes needed since the entire spec is CSS-only, matching the spec's stated scope.
- **No placeholders:** every color value is copied verbatim from the spec's table.
- **Single task:** this is intentionally one task, not decomposed further — it's one cohesive token swap in one file with no meaningful independent sub-units to gate separately.
