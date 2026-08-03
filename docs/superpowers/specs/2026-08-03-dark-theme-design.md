# Dark theme redesign

## Goal
Replace HospoGrad's current light theme with a dark theme, site-wide. This
is a full switch, not a toggle — no light/dark preference UI, no
localStorage persistence, no dual-palette maintenance. One dark palette,
everywhere, replacing the current light one in `style.css`.

## Motivation
User feedback: the current light theme (from the "elevated forum" polish
pass) reads as pale/washed out. Moving to a dark theme addresses this
directly and lets the existing teal accent color read with more contrast
and presence.

## Scope
`public/css/style.css` only — this is a token/value swap on the existing
CSS custom properties and any hardcoded colors that don't already
reference a token, plus adjustments to shadow color (dark shadows don't
render against a dark background) and a few explicit color overrides
(link color, danger color) that need brightening for contrast on dark
surfaces. No HTML/JS changes. No new files.

Everything from the prior "elevated forum" pass carries over unchanged:
Instrument Serif headings/brand, dense table/list structure, spacing and
radius tokens, hover-lift shadows on cards/comments, the two-tier header,
the school-logo banner. This spec only changes color values, not
structure or typography.

## Palette

| Token | Current (light) | New (dark) | Notes |
|---|---|---|---|
| `--color-bg` | `#f0f2f4` | `#0f1720` | Page background |
| `--color-surface` | `#ffffff` | `#171f2b` | Cards, tables, forms |
| `--color-surface-hover` | `#f7f9fa` | `#1c2532` | Row/card hover state |
| `--color-text` | `#1a1a1a` | `#e8ecf0` | Body text |
| `--color-text-muted` | `#6b7378` | `#8b95a3` | Secondary text |
| `--color-border` | `#d5dadf` | `#2a3441` | Dividers, borders |
| `--color-nav-bg` | `#1e3a5f` | `#12202e` | Nav bar (darker than page bg so it still reads as a distinct bar) |
| `--color-nav-bg-deep` | `#14283f` | `#0a1219` | Nav gradient's darker stop |
| `--color-accent` | `#0b8a6c` | `#14b892` | Brightened for contrast on dark surfaces |
| `--color-accent-hover` | `#096e56` | `#0f9878` | |
| `--color-accent-soft` | `rgba(11,138,108,0.1)` | `rgba(20,184,146,0.15)` | Slightly stronger since dark bg mutes low-opacity overlays less predictably |
| `--color-accent-soft-strong` | `rgba(11,138,108,0.2)` | `rgba(20,184,146,0.28)` | |
| `--color-link` | `#0060a8` | `#5eb3ff` | Dark blue is illegible on dark bg; shift to a light sky blue |
| `--color-danger` | `#b3452c` | `#e2694a` | Brightened for contrast |
| `--color-danger-soft` | `rgba(179,69,44,0.08)` | `rgba(226,105,74,0.15)` | |

`--radius-sm/md/lg`, `--font-display`, `--font-ui` are unchanged.

## Shadows

Current shadow tokens use `rgba(20, 26, 36, ...)` — a dark navy shadow
color, tuned to sit visibly on a white background. Against a `#0f1720`
page background these would be nearly invisible. New values shift to
pure black at higher opacity so the hover-lift effect (added in the
prior polish pass, on `.post-card`, `.comment-row`) and the nav/table
shadows stay visible:

| Token | New value |
|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.35), 0 1px 1px rgba(0,0,0,0.25)` |
| `--shadow-md` | `0 10px 24px -10px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.3)` |
| `--shadow-accent` | `0 8px 18px -6px rgba(20,184,146,0.45)` |

## Other explicit-color spots

A few places in `style.css` reference colors directly instead of via a
token and need manual adjustment since they won't inherit from the
`:root` swap:
- `.btn { color: #ffffff; }` — stays as-is, still correct on the
  brightened accent background
- `.nav` gradient (`linear-gradient(180deg, var(--color-nav-bg) 0%,
  var(--color-nav-bg-deep) 100%)`) — already token-based, inherits
  automatically
- `::selection` background uses `--color-accent-soft-strong` — inherits
  automatically, but confirm the resulting selection-highlight text
  (`--color-text`, now off-white) stays legible against it

## School-banner logo chips

Two of the nine logo files (`glion.jpg`, `ihtti.jpg`) are opaque JPEGs
with light/white backgrounds baked into the image — on a dark banner
background they'd render as visible light rectangles around the logo,
not a clean cutout. (The other seven are transparent PNGs/SVG, which
are lower-risk but some may also contain dark marks that lose contrast
on a dark background.)

Fix: give every logo in `.school-banner-logos` a small light rounded
"chip" background, a standard pattern for logo walls on dark
backgrounds — this makes opaque-background logos look intentional
instead of broken, and improves legibility for any transparent logo
with a dark or low-contrast mark:

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

This replaces the existing `grayscale`/`opacity` filter treatment from
the prior pass (which relied on a light page background to read well)
with the chip background doing the visual-consistency job instead. The
`@media (hover: hover)` grayscale-reveal-on-hover behavior is dropped in
favor of this simpler, theme-appropriate treatment — logos are legible
by default on both touch and pointer devices, with no hover-dependent
state.

## Testing
No backend changes, no new Vitest coverage. Manual verification: load
each page type (home, category, thread, login/signup forms, admin) in a
browser at both desktop and mobile widths, confirm text contrast is
readable throughout (body text, muted text, links, table headers),
confirm the accent color reads clearly on buttons/active states/hover
highlights, confirm shadows are visible on card/comment hover, and
confirm all nine school-banner logos render as clean chips with no
visible seams or broken-looking edges against the dark banner
background.
