# Homepage visual polish + school-logo trust banner

## Goal
Polish the homepage's TheStudentRoom-style layout (fix known rough edges from
the prior redesign, add light visual interest) and add a banner showing
logos of nine Swiss hospitality schools (Glion, EHL, Les Roches, SHMS, SHL,
HTMi, Culinary Arts Academy Switzerland, IHTTI, ISBM) as a community-trust
signal. Homepage (`index.html`) only — category and thread pages are
unaffected.

## Scope
In scope:
- `public/index.html`, `public/js/home.js` — intro strip, category icons,
  active sort-toggle state, school-logo banner markup
- `public/css/style.css` — fixes to shared classes used by the homepage
  (empty-state colspan/header visibility, sort-toggle active state,
  responsive `@media` rules for `.forum-index`/`.thread-table`/header
  strips, new `.school-banner` styles) — shared file, but only rules
  relevant to homepage components are touched
- `public/images/schools/` (new) — nine logo image files, already
  downloaded from official sources (Wikimedia Commons where the school
  itself doesn't have a stable direct URL, else the school's own site):
  - `glion.jpg` (454×135, Wikimedia Commons, CC-BY-SA) — Glion Institute of Higher Education
  - `ehl.png` (967×851, transparent, Wikimedia Commons, CC-BY-SA) — EHL Hospitality Business School
  - `les-roches.png` (800×800, transparent, Wikimedia Commons, CC-BY-SA) — Les Roches
  - `shms.png` (128×114, Wikimedia Commons, CC-BY-SA) — Swiss Hotel Management School
  - `shl.svg` (vector, official shl.ch site) — SHL Schweizerische Hotelfachschule Luzern
  - `htmi.png` (72×104 @2x retina, transparent, official htmi.ch site) — HTMi Hotel & Tourism Management Institute
  - `caas.png` (145×145, transparent, official culinaryartsswitzerland.com CMS) — Culinary Arts Academy Switzerland
  - `ihtti.jpg` (200×200, Wikimedia Commons, CC-BY-SA) — IHTTI School of Hotel and Design Management (closed 2021 — alumni still represented)
  - `isbm.png` (360×354, transparent, official isbm.ch site) — ISBM Geneva

Out of scope: `category.html`, `post.html`, `admin.html`, and all other
pages — no changes. No backend changes. No new API routes.

## Visual polish details

### Empty-state fix (deferred from prior redesign)
`renderForumIndex`/`renderPostList` empty-state rows currently render a
lone `<td>` with no `colspan`, and the `<thead>` is dropped entirely when
the table has no rows — so the column headers disappear on an empty
homepage. Fix: keep the `<thead>` always rendered; give the empty-state
`<td>` a `colspan` matching the table's column count (3 for forum-index,
4 for post-list).

### Sort-toggle active state
`#sort-new` / `#sort-top` currently have no active-state styling — a
visitor can't tell which sort is selected. Add a `.active` class (CSS:
solid `--color-accent` background, white text) applied via JS based on
the `sort` query param, matching the existing `.btn`/`.btn-secondary`
pattern already in `style.css`.

### Category icons
Each forum-index row gets a small emoji icon before the category name,
mapped by slug (all 7 seeded categories, per `migrations/0001_init.sql`):
- `accommodation` → 🏠
- `health-insurance` → 🩺
- `visa-legal` → 📋
- `jobs-internships` → 💼
- `money-taxes` → 💰
- `school-life` → 🎓
- `general` → 💬
- any other/future slug → 📌 (fallback)

This mapping lives as a plain object in `home.js`. No new category data
needed from the backend.

### Intro strip
A single `<p class="homepage-intro">` above the forum-index table, static
text: "Switzerland's community for hotel management students and alumni —
housing, visas, jobs, and everything in between." Styled larger/lighter
than body text, no dynamic content.

### Responsive rules
Add `@media (max-width: 640px)` rules scoped to: `.layout` (reduce
padding), `.header-strip-breadcrumb` (stack breadcrumb and search input
vertically, or hide `.search-input` below the breakpoint since it's
non-functional placeholder), `.forum-index`/`.thread-table` (allow
horizontal scroll via a wrapping `<div style="overflow-x:auto">` around
each table rather than trying to reflow the table itself — simplest fix
that doesn't require restructuring the table markup).

## School-logo banner

### Structure
New element in `index.html`, positioned directly after the two-tier
header (`<nav id="site-nav">` + `<div id="breadcrumb-strip">`) and before
`<div class="layout">`:

```html
<div class="school-banner">
  <span class="school-banner-label">Our community includes students &amp; alumni from:</span>
  <div class="school-banner-logos">
    <img src="/images/schools/glion.jpg" alt="Glion Institute of Higher Education" />
    <img src="/images/schools/ehl.png" alt="EHL Hospitality Business School" />
    <img src="/images/schools/les-roches.png" alt="Les Roches" />
    <img src="/images/schools/shms.png" alt="Swiss Hotel Management School" />
    <img src="/images/schools/shl.svg" alt="SHL Schweizerische Hotelfachschule Luzern" />
    <img src="/images/schools/htmi.png" alt="HTMi Hotel and Tourism Management Institute" />
    <img src="/images/schools/caas.png" alt="Culinary Arts Academy Switzerland" />
    <img src="/images/schools/ihtti.jpg" alt="IHTTI School of Hotel and Design Management" />
    <img src="/images/schools/isbm.png" alt="ISBM Geneva" />
  </div>
</div>
```

Static markup — no JS needed to populate it (fixed set of 9 schools, not
data-driven). With 9 logos, `.school-banner-logos` uses `flex-wrap: wrap`
so it wraps to 2 rows on typical desktop widths rather than trying to
force a single unbroken line — a strict "slim single-row strip" doesn't
scale to 9 items without shrinking logos illegibly small. The banner is
still visually light (small fixed logo height, wraps cleanly).

### Styling
- Not sticky — with 9 logos wrapping to ~2 rows, pinning it would
  permanently occupy significant vertical space on every scroll position.
  It renders once, directly under the breadcrumb strip, and scrolls away
  with the rest of the page content like any other section.
- Light background (`--color-surface`), 1px bottom border matching the
  existing `--color-border` convention
- Logos: fixed height (~28px), `object-fit: contain`, `filter: grayscale(1)
  opacity(0.7)` by default, `filter: none` on `.school-banner:hover img`
  (whole-banner hover, not per-logo, since these are informational not
  interactive/clickable)
- Flex layout, evenly spaced, wraps on narrow viewports (covered by the
  same responsive pass above)

### Attribution
All nine logos are official marks of their respective schools. Five
(`glion.jpg`, `ehl.png`, `les-roches.png`, `shms.png`, `ihtti.jpg`) are
sourced from Wikimedia Commons under Creative Commons Attribution-ShareAlike
licenses (own-work uploads by contributors, not AI-generated or
fabricated). The remaining four (`shl.svg`, `htmi.png`, `caas.png`,
`isbm.png`) are downloaded directly from each school's own official
website, where no separately-licensed Commons copy was available. None
are AI-generated or fabricated — all are real assets pulled from an
official or Creative-Commons-licensed source. This is nominative/
referential use — HospoGrad is a community for these schools' students and
alumni, not implying institutional endorsement or affiliation. No claim of
endorsement is made in the copy ("Our community includes...", not
"Endorsed by..."). IHTTI closed in 2021; it's included because its alumni
are still part of the community this banner represents.

## Testing
- No backend changes, so no new Vitest coverage needed.
- Manual verification: load `/index.html` in a browser (or via curl +
  static HTML inspection, since this project has no frontend test
  framework), confirm:
  - Empty-state tables show headers + colspan-correct empty message
  - Sort toggle shows visible active state on `?sort=new` vs `?sort=top`
  - Category icons render for all 7 seeded categories (including the
    fallback icon, if any seeded slug isn't in the explicit mapping)
  - School banner renders all nine logos with correct alt text and
    wraps cleanly to multiple rows
  - Page doesn't horizontally overflow at a 375px-wide viewport
