# Elevated forum visual polish

## Goal
Raise the visual craft of HospoGrad's existing dense-forum design across
the whole site (shared `style.css` + every page that uses it) without
abandoning the information-first table/list structure established by the
TheStudentRoom-style redesign. This is a polish pass, not a re-skin: the
navy/white/teal palette, table-based thread listings, breadcrumb nav, and
comment-rail layout all stay — the goal is to make them feel more crafted.

## Direction
- **Typography**: introduce a distinct display treatment for headings and
  the nav brand (heavier weight / slightly different letter-spacing than
  body text) so the site doesn't read as 100% flat system-sans everywhere.
  Body/table text stays as-is for density and legibility.
- **Depth & color**: add subtle shadows and refined hover/focus states to
  cards (`post-card`, `comment-row`, `form-card`), buttons, and table
  rows — currently everything is flat 1px borders with no elevation.
  Slightly richer accent-color usage where it reinforces hierarchy
  (active states, primary actions).
- **Spacing rhythm**: more generous padding on low-density surfaces
  (forms, comment threads, empty states); tables/lists remain tight and
  dense — the site's forum identity is worth keeping.
- **Micro-interactions**: smoother CSS transitions on hover/focus/active
  states; button press feedback; no JS-driven animation, pure CSS.
- **Consistency + deferred-backlog cleanup**: this pass also resolves
  several items flagged as follow-ups during the previous redesign,
  since they're directly relevant to visual quality/consistency:
  - `category.js`'s `renderPostList` empty state has no `<thead>`/`colspan`
    (the same bug `home.js` had, already fixed there) — bring it in line
  - `#post-list > p` is dead CSS (can never match a `<table>`'s children);
    remove it and give the table-based empty states a real styled
    treatment consistent with the app's other empty states
    (`#comment-list`, `#verification-list`, etc.)
  - The 9 school-banner `<img>` tags have no `width`/`height`, causing
    layout shift while they load — add explicit dimensions
  - The school-banner's grayscale-to-color hover effect never resolves
    on touch devices, permanently dimming the logos on mobile — gate it
    behind `@media (hover: hover)` with a more visible default state
  - Category-icon emojis are read aloud by screen readers since they're
    bare text inside the link — wrap in `aria-hidden="true"`

## Scope
In scope: `public/css/style.css` (primary surface for this pass),
`public/js/category.js` (empty-state fix only), `public/js/home.js`
(aria-hidden on category icons only), `public/index.html` (logo
width/height attributes only). Every HTML page inherits the CSS changes
automatically since they share one stylesheet — no other page-specific
markup changes are in scope beyond the four listed above.

Out of scope: no new features, no new pages, no changes to the shared
JS helpers (`api.js`, `layout.js`) beyond what's listed, no changes to
`admin.js`/`profile.js`/`post.js`/auth pages' markup (they inherit the
CSS pass but aren't otherwise touched).

## Execution
This spec hands off to the `frontend-design` skill for the actual
implementation — it's purpose-built for producing distinctive,
production-quality CSS/markup that avoids generic AI-aesthetic patterns,
which is a better fit for "make it more appealing" than a
line-by-line-specified plan would be. The direction and scope above are
the brief; specific color values, shadow depths, and spacing numbers are
left to that skill's design judgment within these constraints:
- Keep the existing `--color-nav-bg` (`#1e3a5f`), `--color-accent`
  (`#0b8a6c`), and `--color-bg`/`--color-surface` family as the base
  palette — refine/extend, don't replace
- Keep the dense table/list structure on `.forum-index`/`.thread-table`
  — these must remain scannable, information-first layouts
- Typography: use **Instrument Serif** (SIL OFL 1.1, self-hosted at
  `public/fonts/`, not loaded from Google Fonts CDN) for headings and
  the nav brand only — body/table text stays on the existing system-sans
  stack. Regular and Italic weights already downloaded and committed.

## Testing
No backend changes, so no new Vitest coverage. Manual verification:
load each page type (`index.html`, `category.html`, `post.html`,
`login.html`, `admin.html`) in a browser, confirm visual consistency,
confirm the four specific bug fixes (category.js empty state,
dead CSS removal, logo dimensions, touch-device grayscale) behave
correctly, confirm no regression in existing functionality (voting,
commenting, sorting, navigation).
