# HospoGrad → TheStudentRoom-style Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle HospoGrad's homepage, category, and thread pages into TheStudentRoom's dense forum format (navy/white/teal palette, system sans-serif, table-style rows) and add the backend data (post counts, comment counts, last-activity) those layouts need.

**Architecture:** Pure presentation change (CSS + 3 HTML files + their vanilla-JS controllers) plus two additive SQL aggregate queries in existing Hono routes. No new routes, no schema migrations, no changes to auth/vote/report logic. The shared `style.css` token swap cascades to every page (admin, profile, auth forms) automatically since they reuse the same `.post-card`/`.badge`/`.btn`/`.meta` classes.

**Tech Stack:** Cloudflare Workers (Hono), D1 (SQLite), vanilla HTML/CSS/JS frontend, Vitest + `@cloudflare/vitest-pool-workers` for tests.

## Global Constraints

- No schema migrations — all new fields come from `SELECT`-time aggregates (`COUNT`, `MAX`, `LEFT JOIN`), never new columns.
- No fake/placeholder data in the UI — a category or post with zero activity renders an explicit empty state (`0`, "—", or "No posts yet"), never invented numbers.
- Keep `escapeHtml()` on every user-controlled string rendered into `innerHTML` (existing pattern in `home.js`/`category.js`/`post.js`/`admin.js`) — do not introduce unescaped interpolation.
- `admin.html`, `alumni-verify.html`, `create-post.html`, `profile.html`, `login.html`, `signup.html`, `verify-otp.html` get the new CSS tokens automatically via `style.css` but their HTML/JS structure is untouched by this plan.
- Search input in the new header strip is visual-only (rendered `disabled`) — no backend search endpoint exists and none is added by this plan.

---

### Task 1: Add `post_count` / `last_post_at` to `GET /api/categories`

**Files:**
- Modify: `src/routes/categories.ts:8-11`
- Test: `test/routes/categories.test.ts`

**Interfaces:**
- Produces: `GET /api/categories` response shape becomes `{ categories: { id, slug, name, description, post_count: number, last_post_at: number | null }[] }`

- [ ] **Step 1: Write the failing test**

Add to `test/routes/categories.test.ts`:

```typescript
import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { createSessionToken } from "../../src/lib/session";
import { hashSecret } from "../../src/lib/crypto";

describe("GET /categories", () => {
  it("returns the 7 seeded categories", async () => {
    const res = await SELF.fetch("https://example.com/api/categories");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { categories: { slug: string }[] };
    expect(body.categories).toHaveLength(7);
  });

  it("returns post_count 0 and last_post_at null for a category with no posts", async () => {
    const res = await SELF.fetch("https://example.com/api/categories");
    const body = (await res.json()) as {
      categories: { slug: string; post_count: number; last_post_at: number | null }[];
    };
    const empty = body.categories.find((c) => c.slug === "general");
    expect(empty?.post_count).toBe(0);
    expect(empty?.last_post_at).toBeNull();
  });

  it("returns an accurate post_count and last_post_at after posts are created", async () => {
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
       VALUES (?, ?, ?, ?, 'EHL', 'student', 'verified', 0)`
    )
      .bind("cat-count-user", "cat-count-user", "cat-count-user@ehl.ch", await hashSecret("x"))
      .run();
    const token = createSessionToken("cat-count-user", env.SESSION_SECRET);
    const category = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'accommodation'").first<{
      id: number;
    }>();

    await SELF.fetch("https://example.com/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ categoryId: category!.id, title: "T1", body: "B1" }),
    });
    await SELF.fetch("https://example.com/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ categoryId: category!.id, title: "T2", body: "B2" }),
    });

    const res = await SELF.fetch("https://example.com/api/categories");
    const body = (await res.json()) as {
      categories: { slug: string; post_count: number; last_post_at: number | null }[];
    };
    const accommodation = body.categories.find((c) => c.slug === "accommodation");
    expect(accommodation?.post_count).toBeGreaterThanOrEqual(2);
    expect(accommodation?.last_post_at).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/routes/categories.test.ts`
Expected: FAIL — `post_count`/`last_post_at` are `undefined`, so the second and third assertions fail.

- [ ] **Step 3: Write minimal implementation**

In `src/routes/categories.ts`, replace the `categories.get("/", ...)` handler body:

```typescript
categories.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT c.id, c.slug, c.name, c.description,
            COUNT(p.id) AS post_count,
            MAX(p.created_at) AS last_post_at
     FROM categories c
     LEFT JOIN posts p ON p.category_id = c.id
     GROUP BY c.id
     ORDER BY c.id`
  ).all();
  return c.json({ categories: results });
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/routes/categories.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/routes/categories.ts test/routes/categories.test.ts
git commit -m "feat: add post_count and last_post_at to GET /api/categories"
```

---

### Task 2: Add `comment_count` to `GET /api/posts`

**Files:**
- Modify: `src/routes/posts.ts:29-36`
- Test: `test/routes/posts.test.ts`

**Interfaces:**
- Consumes: nothing new
- Produces: `GET /api/posts` response items gain `comment_count: number`

- [ ] **Step 1: Write the failing test**

Add to `test/routes/posts.test.ts` (append to the `describe("GET /posts (combined feed)", ...)` block):

```typescript
  it("includes comment_count, 0 for posts with no comments", async () => {
    const res = await SELF.fetch("https://example.com/api/posts");
    const body = (await res.json()) as { posts: { title: string; comment_count: number }[] };
    const noComments = body.posts.find((p) => p.title === "From accommodation");
    expect(noComments?.comment_count).toBe(0);
  });

  it("counts comments accurately", async () => {
    const token = await makeVerifiedUser("comment-count-author");
    const category = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'general'").first<{
      id: number;
    }>();
    const postRes = await SELF.fetch("https://example.com/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ categoryId: category!.id, title: "Counted post", body: "b" }),
    });
    const { post } = (await postRes.json()) as { post: { id: string } };

    await SELF.fetch(`https://example.com/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ body: "c1" }),
    });
    await SELF.fetch(`https://example.com/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ body: "c2" }),
    });

    const res = await SELF.fetch("https://example.com/api/posts");
    const body = (await res.json()) as { posts: { title: string; comment_count: number }[] };
    const counted = body.posts.find((p) => p.title === "Counted post");
    expect(counted?.comment_count).toBe(2);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/routes/posts.test.ts`
Expected: FAIL — `comment_count` is `undefined`.

- [ ] **Step 3: Write minimal implementation**

In `src/routes/posts.ts`, replace the `posts.get("/", ...)` handler body:

```typescript
posts.get("/", async (c) => {
  const sort = c.req.query("sort") === "top" ? "p.score DESC" : "p.created_at DESC";
  const { results } = await c.env.DB.prepare(
    `SELECT p.id, p.title, p.body, p.image_keys, p.score, p.created_at, p.category_id,
            u.username, u.school, u.status,
            COUNT(cm.id) AS comment_count
     FROM posts p
     JOIN users u ON u.id = p.author_id
     LEFT JOIN comments cm ON cm.post_id = p.id
     GROUP BY p.id
     ORDER BY ${sort}`
  ).all();
  return c.json({ posts: results });
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/routes/posts.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/routes/posts.ts test/routes/posts.test.ts
git commit -m "feat: add comment_count to GET /api/posts"
```

---

### Task 3: Add `comment_count` to `GET /api/categories/:slug/posts`

**Files:**
- Modify: `src/routes/categories.ts` (the `categories.get("/:slug/posts", ...)` handler)
- Test: `test/routes/categories.test.ts`

**Interfaces:**
- Produces: `GET /api/categories/:slug/posts` response items gain `comment_count: number`

- [ ] **Step 1: Write the failing test**

Add to `test/routes/categories.test.ts`:

```typescript
describe("GET /categories/:slug/posts", () => {
  it("includes comment_count per post", async () => {
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
       VALUES (?, ?, ?, ?, 'EHL', 'student', 'verified', 0)`
    )
      .bind("slug-count-user", "slug-count-user", "slug-count-user@ehl.ch", await hashSecret("x"))
      .run();
    const token = createSessionToken("slug-count-user", env.SESSION_SECRET);
    const category = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'jobs'").first<{ id: number }>();

    const postRes = await SELF.fetch("https://example.com/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ categoryId: category!.id, title: "Job post", body: "b" }),
    });
    const { post } = (await postRes.json()) as { post: { id: string } };
    await SELF.fetch(`https://example.com/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ body: "one comment" }),
    });

    const res = await SELF.fetch("https://example.com/api/categories/jobs/posts");
    const body = (await res.json()) as { posts: { title: string; comment_count: number }[] };
    const found = body.posts.find((p) => p.title === "Job post");
    expect(found?.comment_count).toBe(1);
  });
});
```

Check `migrations/` for the actual seeded category slugs before running — if `jobs` doesn't exist, use one of the 7 seeded slugs (`general` and `accommodation` are already used elsewhere in this file, so pick an unused one to avoid cross-test interference).

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/routes/categories.test.ts`
Expected: FAIL — `comment_count` is `undefined`.

- [ ] **Step 3: Write minimal implementation**

In `src/routes/categories.ts`, replace the `categories.get("/:slug/posts", ...)` query:

```typescript
  const { results } = await c.env.DB.prepare(
    `SELECT p.id, p.title, p.body, p.image_keys, p.score, p.created_at,
            u.username, u.school, u.status,
            COUNT(cm.id) AS comment_count
     FROM posts p
     JOIN users u ON u.id = p.author_id
     LEFT JOIN comments cm ON cm.post_id = p.id
     WHERE p.category_id = ?
     GROUP BY p.id
     ORDER BY ${sort}`
  )
    .bind(category.id)
    .all();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/routes/categories.test.ts`
Expected: PASS

- [ ] **Step 5: Run the full backend test suite**

Run: `npx vitest run`
Expected: All tests PASS (confirms Tasks 1–3 didn't break `posts.test.ts`, `comments.test.ts`, or anything else touching these queries).

- [ ] **Step 6: Commit**

```bash
git add src/routes/categories.ts test/routes/categories.test.ts
git commit -m "feat: add comment_count to GET /api/categories/:slug/posts"
```

---

### Task 4: Retheme `style.css` to the TheStudentRoom palette

**Files:**
- Modify: `public/css/style.css` (entire file)

**Interfaces:**
- Produces: CSS custom properties consumed by every HTML page — class names (`.nav`, `.layout`, `.sidebar`, `.post-card`, `.vote-controls`, `.btn`, `.btn-secondary`, `.badge`, `.form-field`, `.error-message`, `.form-card`) are preserved so no HTML/JS in `admin.html`, `profile.html`, `login.html`, `signup.html`, `create-post.html`, `alumni-verify.html`, `verify-otp.html` needs to change.
- New classes this task adds for later tasks to consume: `.forum-index` (table wrapper), `.forum-index-row`, `.thread-table`, `.thread-row`, `.thread-meta-col`, `.header-strip-top`, `.header-strip-breadcrumb`, `.breadcrumb`, `.comment-row`, `.comment-rail`, `.search-input` (all defined in this task even though only used starting Task 5).

- [ ] **Step 1: Replace the `:root` token block**

In `public/css/style.css`, replace lines 1–27 (the `:root { ... }` block):

```css
:root {
  --color-bg: #f0f2f4;
  --color-surface: #ffffff;
  --color-surface-hover: #f7f9fa;
  --color-text: #1a1a1a;
  --color-text-muted: #6b7378;
  --color-border: #d5dadf;
  --color-nav-bg: #1e3a5f;
  --color-nav-text: #ffffff;
  --color-accent: #0b8a6c;
  --color-accent-hover: #096e56;
  --color-accent-soft: rgba(11, 138, 108, 0.1);
  --color-accent-soft-strong: rgba(11, 138, 108, 0.2);
  --color-link: #0060a8;
  --color-danger: #b3452c;
  --color-danger-soft: rgba(179, 69, 44, 0.08);

  --radius-sm: 3px;
  --radius-md: 4px;
  --radius-lg: 6px;

  --shadow-sm: none;
  --shadow-md: none;
  --shadow-accent: none;

  --font-display: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
  --font-ui: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
}
```

- [ ] **Step 2: Update base typography and link color**

Replace lines 35–62 (`body { ... }` through `a:hover { ... }`):

```css
body {
  margin: 0;
  font-family: var(--font-ui);
  font-size: 13px;
  line-height: 1.45;
  background: var(--color-bg);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

::selection {
  background: var(--color-accent-soft-strong);
  color: var(--color-text);
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 2px;
}

a {
  color: var(--color-link);
  text-decoration: none;
  transition: color 0.15s ease;
}
a:hover { color: var(--color-accent-hover); text-decoration: underline; }
```

- [ ] **Step 3: Simplify heading styles**

Replace lines 64–71 (`h1, h2, h3 { ... }`):

```css
h1, h2, h3 {
  font-family: var(--font-ui);
  font-weight: 700;
  letter-spacing: normal;
  line-height: 1.25;
  color: var(--color-text);
}
```

- [ ] **Step 4: Rewrite `.nav` as the two-tier header base + add breadcrumb/search classes**

Replace lines 73–98 (the whole `.nav` block) with:

```css
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-nav-bg);
  color: var(--color-nav-text);
  padding: 0.5rem 1.25rem;
  font-size: 0.82rem;
}
.nav a {
  color: var(--color-nav-text);
  margin-left: 1rem;
  opacity: 0.9;
  font-weight: 500;
}
.nav a:hover { opacity: 1; color: var(--color-nav-text); text-decoration: underline; }
.nav .nav-brand {
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--color-nav-text);
  margin-left: 0;
  opacity: 1;
}

.header-strip-breadcrumb {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 0.5rem 1.25rem;
  font-size: 0.82rem;
}
.breadcrumb { color: var(--color-text-muted); }
.breadcrumb a { color: var(--color-link); }
.breadcrumb .current { color: var(--color-text); font-weight: 600; }
.search-input {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.3rem 0.6rem;
  font-size: 0.82rem;
  width: 220px;
  color: var(--color-text-muted);
  background: var(--color-surface);
}
```

- [ ] **Step 5: Update `.layout` and `.sidebar` spacing (sidebar kept for pages that still use it, e.g. none after Task 6, but the class stays for safety)**

Replace lines 100–107 (`.layout { ... }`):

```css
.layout {
  display: flex;
  max-width: 960px;
  margin: 1.25rem auto;
  gap: 1.25rem;
  padding: 0 1rem;
  align-items: flex-start;
}
```

Leave the `.sidebar` rule block (lines 109–142) as-is — it becomes dead CSS after Task 6 removes the sidebar from `index.html`/`category.html`, but no other page references `#category-sidebar`, so removing the rules is unnecessary cleanup outside this task's purpose. Do not delete it.

- [ ] **Step 6: Restyle `.post-card` (used by `admin.js`, `profile.js`, and any leftover feed markup) to the flat/bordered look**

Replace lines 144–168 (`.main { ... }` through `.post-card .badge { ... }`):

```css
.main { flex: 1; min-width: 0; }
.main > div:first-child { margin-bottom: 0.75rem; }

.post-card {
  display: flex;
  gap: 0.85rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem;
  margin-bottom: 0.5rem;
}
.post-card h2, .post-card h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}
.post-card p { margin: 0 0 0.4rem 0; color: var(--color-text); }
.post-card .meta { color: var(--color-text-muted); font-size: 0.78rem; }
.post-card .badge { color: var(--color-text-muted); }
```

- [ ] **Step 7: Add forum-index and thread-table classes (new, consumed by Tasks 6–7)**

Add after the `.post-card` block:

```css
.forum-index {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  margin-bottom: 1.25rem;
  font-size: 0.85rem;
}
.forum-index th {
  text-align: left;
  background: var(--color-bg);
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}
.forum-index td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: top;
}
.forum-index tr:last-child td { border-bottom: none; }
.forum-index tr:hover td { background: var(--color-surface-hover); }
.forum-index .category-name { font-weight: 600; }
.forum-index .category-name a { color: var(--color-text); }
.forum-index .category-description { color: var(--color-text-muted); font-size: 0.8rem; margin-top: 0.1rem; }
.forum-index .num-col { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }

.thread-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  font-size: 0.85rem;
}
.thread-table th {
  text-align: left;
  background: var(--color-bg);
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}
.thread-table th.num-col, .thread-table td.num-col { text-align: right; }
.thread-table td {
  padding: 0.55rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: top;
}
.thread-table tr:last-child td { border-bottom: none; }
.thread-table tr:hover td { background: var(--color-surface-hover); }
.thread-table .thread-title { font-weight: 600; }
.thread-table .thread-title a { color: var(--color-text); }
.thread-table .thread-byline { color: var(--color-text-muted); font-size: 0.78rem; margin-top: 0.1rem; }
.thread-table .num-col { font-variant-numeric: tabular-nums; white-space: nowrap; color: var(--color-text-muted); }
```

- [ ] **Step 8: Restyle `.vote-controls`, `.btn`, `.badge` for the flat/dense look**

Replace lines 180–243 (from `.vote-controls {` through the end of `.badge { ... }`):

```css
.vote-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  min-width: 2rem;
}
.vote-controls button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1;
  color: var(--color-text-muted);
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}
.vote-controls button:hover { color: var(--color-accent); background: var(--color-accent-soft); }
.vote-controls button:active { transform: scale(0.9); }
.vote-controls .score {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  margin: 0.1rem 0;
  font-size: 0.85rem;
}

.btn {
  display: inline-block;
  background: var(--color-accent);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 0.4rem 0.9rem;
  font-family: var(--font-ui);
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
}
.btn:hover { background: var(--color-accent-hover); }
.btn:active { transform: scale(0.97); }
.btn-secondary {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}
.btn-secondary:hover { background: var(--color-accent-soft); border-color: var(--color-accent); }

.badge {
  display: inline-block;
  background: var(--color-accent-soft);
  border: none;
  border-radius: var(--radius-sm);
  padding: 0.15rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--color-text-muted);
}
```

- [ ] **Step 9: Add comment-row/comment-rail classes (new, consumed by Task 8)**

Add at the end of the file:

```css
.comment-row {
  display: flex;
  gap: 0.85rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
}
.comment-rail {
  flex: 0 0 90px;
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
.comment-rail .avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.35rem;
  font-size: 0.9rem;
}
.comment-rail .comment-username { font-weight: 600; color: var(--color-text); }
.comment-body { flex: 1; min-width: 0; }
```

- [ ] **Step 10: Manual smoke check**

Run: `npx wrangler dev` (or the project's existing dev command from `package.json`), open `http://localhost:8787/index.html` and confirm the page loads without console errors and the new navy header/white body renders (layout will look broken until Tasks 5–8 restructure the markup — that's expected at this point; this step is only checking the CSS itself parses and loads without 404s).

- [ ] **Step 11: Commit**

```bash
git add public/css/style.css
git commit -m "style: retheme style.css to TheStudentRoom palette and density"
```

---

### Task 5: Two-tier header in `layout.js` with breadcrumb support

**Files:**
- Modify: `public/js/layout.js`

**Interfaces:**
- Consumes: `.header-strip-breadcrumb`, `.breadcrumb`, `.search-input` CSS classes (Task 4)
- Produces: `renderBreadcrumb(items)` function — `items` is an array of `{ label: string, href?: string }`; the last item renders as the current (non-link) page. Exported implicitly as a global function (matches this codebase's no-module-bundler pattern — every function in every `/js/*.js` file is a plain global, loaded via `<script>` tags in order).
- `initNav()` keeps its existing signature and behavior (same links, same `me` object shape from `/api/auth/me`) — only the HTML it writes into `#site-nav` changes structurally, and it now also renders an empty breadcrumb strip into a new `#breadcrumb-strip` element if present on the page.

- [ ] **Step 1: Rewrite `initNav()` to build the two-tier header markup**

Replace `public/js/layout.js` lines 1–26 (`async function initNav() { ... }`):

```javascript
async function initNav() {
  const nav = document.getElementById("site-nav");
  if (!nav) return;
  try {
    const me = await apiGet("/api/auth/me");
    nav.innerHTML =
      '<a href="/index.html" class="nav-brand">HospoGrad</a>' +
      '<span>' +
      '<a href="/profile.html?username=' + encodeURIComponent(me.username) + '">u/' + escapeHtml(me.username) +
      ' &middot; ' + escapeHtml(me.school) + ' &middot; ' + escapeHtml(me.status) + '</a>' +
      '<a href="/create-post.html">New post</a>' +
      (me.isAdmin ? '<a href="/admin.html">Admin</a>' : '') +
      '<a href="#" id="logout-link">Log out</a>' +
      '</span>';
    const logoutLink = document.getElementById("logout-link");
    logoutLink.addEventListener("click", async (e) => {
      e.preventDefault();
      await apiPost("/api/auth/logout");
      window.location.href = "/index.html";
    });
  } catch (e) {
    nav.innerHTML =
      '<a href="/index.html" class="nav-brand">HospoGrad</a>' +
      '<span><a href="/login.html">Log in</a><a href="/signup.html">Sign up</a></span>';
  }
}

function renderBreadcrumb(items) {
  const strip = document.getElementById("breadcrumb-strip");
  if (!strip) return;
  const trail = items
    .map((item, i) => {
      const isLast = i === items.length - 1;
      if (isLast || !item.href) {
        return '<span class="current">' + escapeHtml(item.label) + "</span>";
      }
      return '<a href="' + item.href + '">' + escapeHtml(item.label) + "</a>";
    })
    .join(" <span>&rsaquo;</span> ");
  strip.innerHTML =
    '<div class="breadcrumb">' + trail + "</div>" +
    '<input class="search-input" type="text" placeholder="Search HospoGrad" disabled />';
}
```

- [ ] **Step 2: Manual verification — no automated test for this file**

This project has no frontend unit test setup (only backend Vitest tests under `test/`). Verify by loading any page with `#site-nav` in a browser (`npx wrangler dev`, visit `/index.html`) and confirming the header renders both logged-out (`Log in`/`Sign up`) and, after logging in via `/login.html`, logged-in (`u/username · school · status`, `New post`, `Log out`) states, matching current behavior exactly — only styling/structure should differ, not functionality.

- [ ] **Step 3: Commit**

```bash
git add public/js/layout.js
git commit -m "feat: two-tier header with breadcrumb helper in layout.js"
```

---

### Task 6: Homepage forum index + dense post list (`index.html`, `home.js`)

**Files:**
- Modify: `public/index.html`
- Modify: `public/js/home.js`

**Interfaces:**
- Consumes: `renderBreadcrumb(items)` (Task 5), `.forum-index`/`.thread-table` CSS (Task 4), `/api/categories` now returning `post_count`/`last_post_at` (Task 1), `/api/posts` now returning `comment_count` (Task 2)

- [ ] **Step 1: Rewrite `public/index.html`**

Replace the whole file:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="HospoGrad is a community for Swiss hotel management students and alumni to discuss housing, insurance, visas, jobs, and school life." />
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%231c2430'/%3E%3Ctext x='16' y='23' font-family='Georgia,serif' font-size='19' font-weight='700' fill='%23c9975a' text-anchor='middle'%3EH%3C/text%3E%3C/svg%3E" />
    <title>HospoGrad</title>
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <nav class="nav" id="site-nav"></nav>
    <div class="header-strip-breadcrumb" id="breadcrumb-strip"></div>
    <div class="layout">
      <main class="main" style="flex: 1 1 100%;">
        <table class="forum-index" id="forum-index"></table>
        <div>
          <a href="?sort=new" class="btn-secondary btn" id="sort-new">New</a>
          <a href="?sort=top" class="btn-secondary btn" id="sort-top">Top</a>
        </div>
        <table class="thread-table" id="post-list"></table>
      </main>
    </div>
    <script src="/js/api.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/home.js"></script>
  </body>
</html>
```

Note: the Google Fonts `<link>` tags (`preconnect` x2 + the `Fraunces`/`Outfit` stylesheet link) are removed here since `style.css` no longer references those font families (Task 4, Step 1).

- [ ] **Step 2: Rewrite `public/js/home.js`**

Replace the whole file:

```javascript
initNav();
renderBreadcrumb([{ label: "Home" }]);

function formatTimestamp(ms) {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function renderForumIndex(categories) {
  const table = document.getElementById("forum-index");
  const rows = categories
    .map(
      (c) =>
        "<tr>" +
        '<td class="category-name">' +
        '<a href="/category.html?slug=' + encodeURIComponent(c.slug) + '">' + escapeHtml(c.name) + "</a>" +
        '<div class="category-description">' + escapeHtml(c.description || "") + "</div>" +
        "</td>" +
        '<td class="num-col">' + c.post_count + "</td>" +
        '<td class="num-col">' + formatTimestamp(c.last_post_at) + "</td>" +
        "</tr>"
    )
    .join("");
  table.innerHTML =
    "<thead><tr><th>Category</th><th class=\"num-col\">Threads</th><th class=\"num-col\">Last activity</th></tr></thead>" +
    "<tbody>" + rows + "</tbody>";
}

function renderPostList(posts) {
  const table = document.getElementById("post-list");
  if (posts.length === 0) {
    table.innerHTML = "<tbody><tr><td>No posts yet. Be the first to post!</td></tr></tbody>";
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
    "<thead><tr><th>Thread</th><th class=\"num-col\">Replies</th><th class=\"num-col\">Votes</th><th class=\"num-col\">Last activity</th></tr></thead>" +
    "<tbody>" + rows + "</tbody>";
}

async function loadForumIndex() {
  const data = await apiGet("/api/categories");
  renderForumIndex(data.categories);
}

async function loadFeed() {
  const params = new URLSearchParams(window.location.search);
  const sort = params.get("sort") === "top" ? "top" : "new";
  const data = await apiGet("/api/posts?sort=" + sort);
  renderPostList(data.posts);
}

loadForumIndex();
loadFeed();
```

- [ ] **Step 3: Manual verification**

Run: `npx wrangler dev`, visit `/index.html`. Confirm: forum index table shows all 7 seeded categories with `0` threads and `—` last activity (fresh DB), `New`/`Top` toggle still switches sort, post list renders as a table with correct columns, no console errors, `escapeHtml` still applied to every user-controlled field (title, username, school, status, description).

- [ ] **Step 4: Commit**

```bash
git add public/index.html public/js/home.js
git commit -m "feat: forum-index table and dense thread list on homepage"
```

---

### Task 7: Category page breadcrumb + dense thread table (`category.html`, `category.js`)

**Files:**
- Modify: `public/category.html`
- Modify: `public/js/category.js`

**Interfaces:**
- Consumes: `renderBreadcrumb(items)` (Task 5), `.thread-table` CSS (Task 4), `/api/categories/:slug/posts` now returning `comment_count` (Task 3)

- [ ] **Step 1: Rewrite `public/category.html`**

Replace the whole file:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Browse HospoGrad discussions by category." />
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%231c2430'/%3E%3Ctext x='16' y='23' font-family='Georgia,serif' font-size='19' font-weight='700' fill='%23c9975a' text-anchor='middle'%3EH%3C/text%3E%3C/svg%3E" />
    <title>Category &middot; HospoGrad</title>
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <nav class="nav" id="site-nav"></nav>
    <div class="header-strip-breadcrumb" id="breadcrumb-strip"></div>
    <div class="layout">
      <main class="main" style="flex: 1 1 100%;">
        <table class="thread-table" id="post-list"></table>
      </main>
    </div>
    <script src="/js/api.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/category.js"></script>
  </body>
</html>
```

Note: `<aside class="sidebar" id="category-sidebar">` is removed (superseded by the homepage forum index + breadcrumb navigation, per the approved design). The `<h2 id="category-name">` / `<p id="category-description">` elements are also removed — that content now goes into the breadcrumb trail.

- [ ] **Step 2: Rewrite `public/js/category.js`**

Replace the whole file:

```javascript
initNav();

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

function formatTimestamp(ms) {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function renderPostList(posts) {
  const table = document.getElementById("post-list");
  if (posts.length === 0) {
    table.innerHTML = "<tbody><tr><td>No posts in this category yet.</td></tr></tbody>";
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
    "<thead><tr><th>Thread</th><th class=\"num-col\">Replies</th><th class=\"num-col\">Votes</th><th class=\"num-col\">Last activity</th></tr></thead>" +
    "<tbody>" + rows + "</tbody>";
}

async function loadCategory() {
  const catData = await apiGet("/api/categories");
  const category = catData.categories.find((c) => c.slug === slug);
  renderBreadcrumb([
    { label: "Home", href: "/index.html" },
    { label: category ? category.name : slug },
  ]);
  const feedData = await apiGet("/api/categories/" + encodeURIComponent(slug) + "/posts");
  renderPostList(feedData.posts);
}

loadCategory();
```

- [ ] **Step 3: Manual verification**

Run: `npx wrangler dev`, visit `/category.html?slug=accommodation` (or any seeded slug). Confirm: breadcrumb shows `Home > {Category name}`, thread table renders with correct columns, empty category shows "No posts in this category yet.", no console errors.

- [ ] **Step 4: Commit**

```bash
git add public/category.html public/js/category.js
git commit -m "feat: breadcrumb header and dense thread table on category page"
```

---

### Task 8: Thread detail — OP layout + comment rail rows (`post.html`, `post.js`)

**Files:**
- Modify: `public/post.html`
- Modify: `public/js/post.js`

**Interfaces:**
- Consumes: `renderBreadcrumb(items)` (Task 5), `.comment-row`/`.comment-rail` CSS (Task 4)
- Note: comments don't need `comment_count` (that's per-post, used on list pages) — `post.js` renders the actual comment tree it fetches, so no backend change needed here beyond what Task 1–3 already did.

- [ ] **Step 1: Rewrite `public/post.html`**

Replace the whole file:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="A discussion on HospoGrad, the community for Swiss hotel management students and alumni." />
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%231c2430'/%3E%3Ctext x='16' y='23' font-family='Georgia,serif' font-size='19' font-weight='700' fill='%23c9975a' text-anchor='middle'%3EH%3C/text%3E%3C/svg%3E" />
    <title>Post &middot; HospoGrad</title>
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <nav class="nav" id="site-nav"></nav>
    <div class="header-strip-breadcrumb" id="breadcrumb-strip"></div>
    <div class="layout">
      <main class="main" style="flex: 1 1 100%;">
        <div id="post-detail"></div>
        <h3>Comments</h3>
        <form id="comment-form">
          <div class="form-field">
            <textarea id="comment-body" placeholder="Add a comment" required></textarea>
          </div>
          <p class="error-message" id="comment-error" hidden></p>
          <button type="submit" class="btn">Post reply</button>
        </form>
        <div id="comment-list"></div>
      </main>
    </div>
    <script src="/js/api.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/post.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Rewrite `public/js/post.js`**

Replace the whole file:

```javascript
initNav();

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

function initials(username) {
  return (username || "?").slice(0, 2).toUpperCase();
}

function formatTimestamp(ms) {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

async function vote(targetType, targetId, value) {
  try {
    await apiPost("/api/votes", { targetType, targetId, value });
    await loadPost();
    await loadComments();
  } catch (err) {
    window.location.href = "/login.html";
  }
}

async function loadPost() {
  const data = await apiGet("/api/posts/" + encodeURIComponent(postId));
  const p = data.post;
  renderBreadcrumb([{ label: "Home", href: "/index.html" }, { label: p.title }]);
  document.getElementById("post-detail").innerHTML =
    '<div class="post-card">' +
    '<div class="vote-controls">' +
    '<button type="button" id="upvote">&#9650;</button>' +
    '<span class="score">' + p.score + "</span>" +
    '<button type="button" id="downvote">&#9660;</button>' +
    "</div>" +
    "<div>" +
    "<h2>" + escapeHtml(p.title) + "</h2>" +
    '<div class="meta">u/' + escapeHtml(p.username) + " &middot; " + escapeHtml(p.school) + " &middot; " + escapeHtml(p.status) + " &middot; " + formatTimestamp(p.created_at) + "</div>" +
    "<p>" + escapeHtml(p.body) + "</p>" +
    "</div>" +
    "</div>";
  document.getElementById("upvote").addEventListener("click", () => vote("post", postId, 1));
  document.getElementById("downvote").addEventListener("click", () => vote("post", postId, -1));
}

function buildCommentTree(comments) {
  const byId = {};
  comments.forEach((c) => (byId[c.id] = Object.assign({}, c, { children: [] })));
  const roots = [];
  comments.forEach((c) => {
    if (c.parent_comment_id && byId[c.parent_comment_id]) {
      byId[c.parent_comment_id].children.push(byId[c.id]);
    } else {
      roots.push(byId[c.id]);
    }
  });
  return roots;
}

function renderComment(c) {
  const childrenHtml = c.children.map(renderComment).join("");
  return (
    '<div class="comment-row">' +
    '<div class="comment-rail">' +
    '<div class="avatar-placeholder">' + escapeHtml(initials(c.username)) + "</div>" +
    '<div class="comment-username">u/' + escapeHtml(c.username) + "</div>" +
    "<div>" + escapeHtml(c.school) + "</div>" +
    "<div>" + escapeHtml(c.status) + "</div>" +
    "</div>" +
    '<div class="comment-body">' +
    "<p>" + escapeHtml(c.body) + "</p>" +
    '<div class="meta">' + formatTimestamp(c.created_at) + "</div>" +
    '<div style="margin-left: 1.25rem;">' + childrenHtml + "</div>" +
    "</div>" +
    "</div>"
  );
}

async function loadComments() {
  const data = await apiGet("/api/posts/" + encodeURIComponent(postId) + "/comments");
  const tree = buildCommentTree(data.comments);
  document.getElementById("comment-list").innerHTML = tree.map(renderComment).join("");
}

document.getElementById("comment-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("comment-error");
  errorEl.hidden = true;
  const body = document.getElementById("comment-body").value;
  try {
    await apiPost("/api/posts/" + encodeURIComponent(postId) + "/comments", { body });
    document.getElementById("comment-body").value = "";
    await loadComments();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  }
});

loadPost();
loadComments();
```

- [ ] **Step 3: Manual verification**

Run: `npx wrangler dev`, visit a thread (`/post.html?id=<id>` for a post created via the app). Confirm: breadcrumb shows `Home > {Post title}`, OP renders title/byline/body/votes, comments render as bordered rows with the left rail (initials avatar, username, school, status), nested replies still indent correctly, posting a new comment refreshes the list, voting still works (redirects to login when logged out, updates score when logged in).

- [ ] **Step 4: Commit**

```bash
git add public/post.html public/js/post.js
git commit -m "feat: OP layout and comment-rail rows on thread page"
```

---

### Task 9: Remove leftover Google Fonts references from remaining HTML files

**Files:**
- Modify: `public/admin.html`, `public/alumni-verify.html`, `public/create-post.html`, `public/profile.html`, `public/login.html`, `public/signup.html`, `public/verify-otp.html`, `public/404.html`

**Interfaces:**
- None — pure markup cleanup, no behavior change.

- [ ] **Step 1: Find every remaining Google Fonts reference**

Run: `grep -rl "fonts.g" public/*.html`
Expected output: the 8 files listed above (index.html, category.html, post.html already cleaned in Tasks 6–8).

- [ ] **Step 2: Remove the font `<link>` tags from each file**

In each file, delete these three lines (they're always adjacent, right after the favicon `<link>`):

```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

- [ ] **Step 3: Verify removal**

Run: `grep -rl "fonts.g" public/*.html`
Expected: no output (empty — every reference removed).

- [ ] **Step 4: Manual verification**

Run: `npx wrangler dev`, spot-check `/admin.html`, `/login.html`, and `/profile.html` load without console 404s for font requests and render with the new system-font stack (inherited from Task 4's `style.css` change).

- [ ] **Step 5: Commit**

```bash
git add public/admin.html public/alumni-verify.html public/create-post.html public/profile.html public/login.html public/signup.html public/verify-otp.html public/404.html
git commit -m "chore: remove unused Google Fonts references from remaining pages"
```

---

### Task 10: Full-suite regression check

**Files:** none (verification only)

- [ ] **Step 1: Run the full backend test suite**

Run: `npx vitest run`
Expected: All tests pass (Tasks 1–3 changes plus every pre-existing route/middleware/lib test).

- [ ] **Step 2: Full manual walkthrough**

Run: `npx wrangler dev`. As a logged-out visitor: load `/index.html` (forum index + thread list render), click into a category (`/category.html?slug=...`), click into a thread (`/post.html?id=...`). Sign up a test user via `/signup.html`, verify OTP, log in, confirm the header shows the logged-in state on every page, create a post via `/create-post.html`, confirm it now appears in both the homepage thread list and its category's thread table with `comment_count: 0`, post a comment, confirm `comment_count` increments on the list pages after navigating back.

- [ ] **Step 3: No commit for this task** — it's verification only. If any issue is found, fix it in the relevant earlier task's files and amend that task's commit conventions (new commit, not amend, per repo convention) with a `fix:` commit.

---

## Self-Review Notes

- **Spec coverage:** Visual system (Task 4), header/breadcrumb (Task 5), homepage forum index + thread list (Task 6), category thread table (Task 7), thread detail OP + comment rail (Task 8), `categories.ts` aggregate (Task 1), `posts.ts` aggregate (Task 2), category-posts aggregate (Task 3), font cleanup (Task 9) — all spec sections covered.
- **Shared CSS safety:** Task 4 confirmed to preserve every class name (`.post-card`, `.badge`, `.btn`, `.meta`, `.form-field`, `.error-message`, `.form-card`) still used by `admin.js`, `profile.js`, and the auth/create-post pages, so Task 9 is pure font cleanup with no risk to those pages' functionality.
- **No fake data:** empty categories/posts render `0` / `—` / explicit empty-state text — never invented values.
