# Homepage Polish + School-Logo Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the homepage's forum-index/thread-table layout (empty-state header/colspan fix, active sort-toggle state, category icons, intro strip, basic responsive handling) and add a banner of nine Swiss hospitality school logos as a community-trust signal.

**Architecture:** Pure frontend presentation change — `public/index.html`, `public/js/home.js`, and additive rules in the shared `public/css/style.css`. No backend, no new routes, no schema changes. All nine logo image files are already downloaded and committed under `public/images/schools/`.

**Tech Stack:** Vanilla HTML/CSS/JS frontend (no build step, no framework), Cloudflare Workers backend (untouched by this plan).

## Global Constraints

- Scope is `public/index.html`, `public/js/home.js`, `public/css/style.css` only. No other HTML/JS files, no backend files.
- No fake/placeholder data — the intro strip and school-banner content is static copy, not data pretending to be dynamic.
- Keep `escapeHtml()` on every user-controlled string rendered into `innerHTML` (existing pattern already in `home.js` — this plan doesn't add new user-controlled rendering, so no new escaping surface, but do not remove any existing `escapeHtml()` calls while editing).
- This project has no frontend test framework — verification is manual (static HTML/CSS inspection, `node --check` for JS syntax, and browser/curl checks where practical).

---

### Task 1: Fix empty-state table header/colspan; wire up sort-toggle active state

**Files:**
- Modify: `public/js/home.js`
- Modify: `public/css/style.css`

**Interfaces:**
- Produces: `.btn-secondary.active` CSS class (consumed by this task's own JS change, not by later tasks)

- [ ] **Step 1: Fix the empty-state branch in `renderPostList`**

In `public/js/home.js`, replace the `renderPostList` function's empty-state branch:

```javascript
function renderPostList(posts) {
  const table = document.getElementById("post-list");
  if (posts.length === 0) {
    table.innerHTML =
      "<thead><tr><th>Thread</th><th class=\"num-col\">Replies</th><th class=\"num-col\">Votes</th><th class=\"num-col\">Started</th></tr></thead>" +
      "<tbody><tr><td colspan=\"4\">No posts yet. Be the first to post!</td></tr></tbody>";
    return;
  }
  const rows = posts
    .map(
      (p) =>
        "<tr>" +
        '<td class="thread-title">' +
        '<a href="/post.html?id=' + encodeURIComponent(p.id) + '">' + escapeHtml(p.title) + "</a>" +
        '<div class="thread-byline">u/' + escapeHtml(p.username) + " &middot; " + escapeHtml(p.school) + " &middot; " + escapeHtml(p.status) + "</div>" +
        "</td>" +
        '<td class="num-col">' + p.comment_count + "</td>" +
        '<td class="num-col">' + p.score + "</td>" +
        '<td class="num-col">' + formatTimestamp(p.created_at) + "</td>" +
        "</tr>"
    )
    .join("");
  table.innerHTML =
    "<thead><tr><th>Thread</th><th class=\"num-col\">Replies</th><th class=\"num-col\">Votes</th><th class=\"num-col\">Started</th></tr></thead>" +
    "<tbody>" + rows + "</tbody>";
}
```

(Only the empty-state branch changed — the non-empty branch is unchanged from the current file.)

- [ ] **Step 2: Add active-state wiring for the New/Top sort toggle**

In `public/js/home.js`, add a new function after `renderPostList` and call it from `loadFeed`:

```javascript
function updateSortToggle(sort) {
  document.getElementById("sort-new").classList.toggle("active", sort === "new");
  document.getElementById("sort-top").classList.toggle("active", sort === "top");
}
```

Replace the existing `loadFeed` function:

```javascript
async function loadFeed() {
  const params = new URLSearchParams(window.location.search);
  const sort = params.get("sort") === "top" ? "top" : "new";
  updateSortToggle(sort);
  const data = await apiGet("/api/posts?sort=" + sort);
  renderPostList(data.posts);
}
```

- [ ] **Step 3: Add `.active` CSS for the sort toggle**

In `public/css/style.css`, add directly after the existing `.btn-secondary:hover { ... }` rule (around line 304):

```css
.btn-secondary.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #ffffff;
}
.btn-secondary.active:hover { background: var(--color-accent-hover); }
```

- [ ] **Step 4: Verify JS syntax and manual check**

Run: `node --check public/js/home.js` — expect no output (valid syntax).

Manual check (no frontend test framework in this project): start `npx wrangler dev`, visit `/index.html?sort=new` and `/index.html?sort=top`, confirm the corresponding button shows the solid accent background. To see the empty-state fix, temporarily point at a fresh/empty local D1 (or reason about the code: the empty branch now always emits the `<thead>` and a `colspan="4"` `<td>`, so no manual DB reset is required to confirm correctness by inspection).

- [ ] **Step 5: Commit**

```bash
git add public/js/home.js public/css/style.css
git commit -m "fix: keep table headers visible on empty state; add sort-toggle active state"
```

---

### Task 2: Category icons + homepage intro strip

**Files:**
- Modify: `public/js/home.js`
- Modify: `public/index.html`
- Modify: `public/css/style.css`

**Interfaces:**
- Consumes: nothing from Task 1
- Produces: `.homepage-intro` CSS class (consumed only by this task's own HTML)

- [ ] **Step 1: Add the category-icon mapping and use it in `renderForumIndex`**

In `public/js/home.js`, add this near the top of the file, after `formatTimestamp`:

```javascript
const CATEGORY_ICONS = {
  accommodation: "🏠",
  "health-insurance": "🩺",
  "visa-legal": "📋",
  "jobs-internships": "💼",
  "money-taxes": "💰",
  "school-life": "🎓",
  general: "💬",
};

function categoryIcon(slug) {
  return CATEGORY_ICONS[slug] || "📌";
}
```

Then replace `renderForumIndex`'s row-mapping line that builds the category-name cell — change:

```javascript
        '<td class="category-name">' +
        '<a href="/category.html?slug=' + encodeURIComponent(c.slug) + '">' + escapeHtml(c.name) + "</a>" +
```

to:

```javascript
        '<td class="category-name">' +
        '<a href="/category.html?slug=' + encodeURIComponent(c.slug) + '">' + categoryIcon(c.slug) + " " + escapeHtml(c.name) + "</a>" +
```

(The icon is a fixed emoji from a developer-controlled lookup table, not user-controlled data, so it does not need `escapeHtml()`.)

- [ ] **Step 2: Add the intro strip to `index.html`**

In `public/index.html`, add a line directly before `<table class="forum-index" id="forum-index"></table>`:

```html
        <p class="homepage-intro">Switzerland&rsquo;s community for hotel management students and alumni &mdash; housing, visas, jobs, and everything in between.</p>
        <table class="forum-index" id="forum-index"></table>
```

- [ ] **Step 3: Style the intro strip**

In `public/css/style.css`, add after the `.forum-index .num-col { ... }` rule (around line 212):

```css
.homepage-intro {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  margin: 0 0 1rem 0;
  font-weight: 400;
}
```

- [ ] **Step 4: Verify**

Run: `node --check public/js/home.js` — expect no output.

Manual check: visit `/index.html`, confirm the intro sentence renders above the category table, and each of the 7 seeded categories (`accommodation`, `health-insurance`, `visa-legal`, `jobs-internships`, `money-taxes`, `school-life`, `general`) shows its mapped icon before its name.

- [ ] **Step 5: Commit**

```bash
git add public/js/home.js public/index.html public/css/style.css
git commit -m "feat: add category icons and homepage intro strip"
```

---

### Task 3: Responsive handling for the homepage

**Files:**
- Modify: `public/index.html`
- Modify: `public/css/style.css`

**Interfaces:**
- Produces: `.table-scroll` CSS class (a generic horizontal-scroll wrapper — safe to reuse by any future page that wraps a wide table in it, though only this task's homepage tables use it today)

- [ ] **Step 1: Wrap both homepage tables in a scroll container**

In `public/index.html`, replace:

```html
        <table class="forum-index" id="forum-index"></table>
```

with:

```html
        <div class="table-scroll"><table class="forum-index" id="forum-index"></table></div>
```

And replace:

```html
        <table class="thread-table" id="post-list"></table>
```

with:

```html
        <div class="table-scroll"><table class="thread-table" id="post-list"></table></div>
```

(These are the same two `<table>` elements from Task 2's context — the surrounding sort-toggle `<div>` and intro `<p>` are unaffected.)

- [ ] **Step 2: Add the scroll-wrapper CSS and the mobile breakpoint rules**

In `public/css/style.css`, add at the end of the file:

```css
.table-scroll {
  width: 100%;
  overflow-x: auto;
}

@media (max-width: 640px) {
  .layout {
    padding: 0 0.75rem;
    margin: 1rem auto;
  }
  .header-strip-breadcrumb {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
  }
  .search-input {
    display: none;
  }
}
```

- [ ] **Step 3: Verify**

Manual check: with `npx wrangler dev` running, use browser devtools (or `$B viewport 375x812` if using the browse skill) to confirm at a 375px-wide viewport: the breadcrumb strip stacks vertically instead of overlapping the (now-hidden) search input, and the tables scroll horizontally within their container instead of breaking the page's overall width (confirm `document.body.scrollWidth` does not exceed `window.innerWidth` at that viewport).

- [ ] **Step 4: Commit**

```bash
git add public/index.html public/css/style.css
git commit -m "feat: add responsive handling for homepage header and tables"
```

---

### Task 4: School-logo banner

**Files:**
- Modify: `public/index.html`
- Modify: `public/css/style.css`

**Interfaces:**
- Consumes: the 9 logo files already committed at `public/images/schools/{glion.jpg, ehl.png, les-roches.png, shms.png, shl.svg, htmi.png, caas.png, ihtti.jpg, isbm.png}`

- [ ] **Step 1: Add the banner markup to `index.html`**

In `public/index.html`, add directly after `<div class="header-strip-breadcrumb" id="breadcrumb-strip"></div>` and before `<div class="layout">`:

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

- [ ] **Step 2: Style the banner**

In `public/css/style.css`, add at the end of the file:

```css
.school-banner {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 0.6rem 1.25rem;
}
.school-banner-label {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-bottom: 0.4rem;
}
.school-banner-logos {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;
}
.school-banner-logos img {
  height: 28px;
  width: auto;
  object-fit: contain;
  filter: grayscale(1) opacity(0.7);
  transition: filter 0.15s ease;
}
.school-banner:hover .school-banner-logos img {
  filter: none;
}
```

- [ ] **Step 3: Verify**

Manual check: with `npx wrangler dev` running, visit `/index.html`, confirm all 9 logos render below the breadcrumb strip (check for any broken-image icons — if any file fails to load, re-check the corresponding path under `public/images/schools/`), confirm they wrap to a second row rather than overflowing horizontally, and confirm hovering over the banner removes the grayscale filter.

Run: `for f in glion.jpg ehl.png les-roches.png shms.png shl.svg htmi.png caas.png ihtti.jpg isbm.png; do test -f "public/images/schools/$f" && echo "OK: $f" || echo "MISSING: $f"; done` — expect all 9 lines to say `OK`.

- [ ] **Step 4: Commit**

```bash
git add public/index.html public/css/style.css
git commit -m "feat: add Swiss hospitality school logo banner to homepage"
```

---

## Self-Review Notes

- **Spec coverage:** empty-state fix (Task 1), sort-toggle active state (Task 1), category icons (Task 2), intro strip (Task 2), responsive rules (Task 3), school-logo banner (Task 4) — all spec sections covered.
- **Type/class consistency:** `.table-scroll` (Task 3) wraps the exact two `<table>` elements Task 2 already touched contextually — verified the wrapping edit targets the same lines, no conflict between tasks.
- **No fake data:** intro strip and banner label are static UI copy, not data pretending to be dynamic; category icons come from a fixed developer-controlled map, not fabricated per-post/per-user content.
- **Asset dependency:** Task 4 depends only on already-committed image files (from the approved spec's asset-sourcing work), not on any earlier task in this plan — could technically run before Tasks 1–3, but is sequenced last to keep the diff review order matching the spec's own section order.
