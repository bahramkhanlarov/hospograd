# HospoGrad Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, vanilla HTML/CSS/JS frontend for HospoGrad, served from the same Cloudflare Worker as the API, covering the full backend surface: browsing, auth, posting, commenting, voting, profiles, and admin verification.

**Architecture:** The existing Hono API moves under `/api/*`. A Cloudflare Workers static assets binding (`ASSETS`) serves a new `public/` directory for everything else. No CORS, no cross-site cookies — frontend and API share one origin. Frontend is plain HTML pages with small per-page vanilla JS files calling a shared `api.js` fetch helper; no bundler, no framework.

**Tech Stack:** TypeScript (backend, unchanged), plain HTML/CSS/JS (frontend, no build step), Cloudflare Workers static assets, existing Hono/D1/R2 backend.

## Global Constraints

- All API routes live under `/api/*` after this plan (spec: Architecture). Frontend pages must call `/api/...` paths, never the old unprefixed paths.
- Session cookie stays `SameSite=Lax`, first-party only — no CORS headers, no `SameSite=None` (spec: Architecture).
- No JS framework, no bundler, no TypeScript on the frontend (spec: Shared Frontend Code).
- Categories are rendered from `GET /api/categories`, never hardcoded in HTML (avoids duplicating the fixed 7-category list across 10 pages).
- Protected pages (`create-post.html`, `admin.html`) verify auth via a live API call on load (`GET /api/auth/me`), never by trusting client-side/local storage state (spec: Auth UX Flow) — the session cookie is HttpOnly.
- Palette: `--color-bg: #faf7f2`, `--color-nav-bg: #1c2430`, `--color-nav-text: #f5f1e8`, `--color-accent: #c9975a`, `--color-text: #1c2430`, `--color-text-muted: #5b6472`, `--color-border: #e3ddd2` (spec: Shared Frontend Code).

---

### Task 1: Restructure API under `/api/*` and add static asset serving

**Files:**
- Modify: `src/index.ts`
- Modify: `wrangler.toml`
- Create: `public/index.html` (placeholder, replaced with real content in Task 5)
- Modify: `test/index.test.ts`, `test/routes/auth.test.ts`, `test/routes/auth-alumni.test.ts`, `test/routes/auth-login.test.ts`, `test/routes/admin.test.ts`, `test/routes/categories.test.ts`, `test/routes/posts.test.ts`, `test/routes/comments.test.ts`, `test/routes/votes.test.ts`, `test/routes/reports.test.ts`, `test/routes/users.test.ts`, `test/middleware/rateLimit.test.ts`

**Interfaces:**
- Consumes: nothing new — this is a mechanical restructuring of all 8 existing route modules (`auth`, `admin`, `categories`, `posts`, `comments`, `votes`, `reports`, `users`) from `src/routes/*.ts`, unchanged internally.
- Produces: every existing endpoint now lives at `/api/<original-path>` (e.g. `/auth/login` → `/api/auth/login`, `/health` → `/api/health`, `/categories` → `/api/categories`). `Bindings` type gains `ASSETS: Fetcher`, consumed by every later frontend task indirectly (they just hit `/api/*` from the browser, no direct binding use).

- [ ] **Step 1: Update `wrangler.toml`** — add an assets binding pointing at `public/`

Add this block (keep the existing `[[d1_databases]]` and `[[r2_buckets]]` sections and the secrets comment unchanged; add the new block after them):

```toml
[assets]
directory = "./public"
binding = "ASSETS"
```

- [ ] **Step 2: Create a placeholder `public/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>HospoGrad</title>
  </head>
  <body>
    <p>HospoGrad frontend under construction.</p>
  </body>
</html>
```

(This file is required for the assets binding to have something to serve; Task 5 replaces it with the real home feed page.)

- [ ] **Step 3: Restructure `src/index.ts`** to mount everything under `/api` and fall back to static assets

Replace the full contents of `src/index.ts` with:

```typescript
import { Hono } from "hono";
import { auth } from "./routes/auth";
import { admin } from "./routes/admin";
import { categories } from "./routes/categories";
import { posts } from "./routes/posts";
import { comments } from "./routes/comments";
import { votes } from "./routes/votes";
import { reports } from "./routes/reports";
import { users } from "./routes/users";

export type Bindings = {
  DB: D1Database;
  UPLOADS: R2Bucket;
  ASSETS: Fetcher;
  SESSION_SECRET: string;
  RESEND_API_KEY: string;
};

export const app = new Hono<{ Bindings: Bindings }>();

const api = new Hono<{ Bindings: Bindings }>();
api.get("/health", (c) => c.json({ ok: true }));
api.route("/auth", auth);
api.route("/admin", admin);
api.route("/categories", categories);
api.route("/posts", posts);
api.route("/posts", comments);
api.route("/votes", votes);
api.route("/reports", reports);
api.route("/users", users);

app.route("/api", api);

app.get("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
```

- [ ] **Step 4: Update every test file's request paths to include `/api`**

For each of these files, every `SELF.fetch("https://example.com/<path>", ...)` call must have `/api` inserted immediately after `https://example.com` (so `https://example.com/auth/signup` becomes `https://example.com/api/auth/signup`, `https://example.com/health` becomes `https://example.com/api/health`, etc.). Apply this to all `SELF.fetch` call sites in:

- `test/index.test.ts` (`/health` → `/api/health`)
- `test/routes/auth.test.ts`
- `test/routes/auth-alumni.test.ts`
- `test/routes/auth-login.test.ts`
- `test/routes/admin.test.ts`
- `test/routes/categories.test.ts`
- `test/routes/posts.test.ts`
- `test/routes/comments.test.ts`
- `test/routes/votes.test.ts`
- `test/routes/reports.test.ts`
- `test/routes/users.test.ts`
- `test/middleware/rateLimit.test.ts`

Do NOT change `test/middleware/auth.test.ts` — it builds its own standalone Hono app directly from `requireAuth`/`requireVerified` in isolation and never routes through `src/index.ts`, so it has no `/api` prefix to update. Do NOT change `test/schema.test.ts`, `test/lib/*.test.ts` — they don't make HTTP requests through the app at all.

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: PASS, all 55 existing tests green with updated paths (no test count change — this task only relocates paths, adds no new behavior).

- [ ] **Step 6: Commit**

```bash
git add src/index.ts wrangler.toml public/index.html test/
git commit -m "refactor: move API under /api/* and add static asset serving for frontend"
```

---

### Task 2: Backend additions the frontend needs (combined feed, session whoami, logout)

**Files:**
- Modify: `src/routes/posts.ts`
- Modify: `src/routes/auth.ts`
- Test: `test/routes/posts.test.ts` (extend)
- Test: `test/routes/auth-me.test.ts` (new)

**Interfaces:**
- Consumes: `requireAuth` (existing), D1 schema (existing).
- Produces: `GET /api/posts?sort=new|top` (public, all-categories feed) — used by Task 5's home page. `GET /api/auth/me` (auth required) returning `{ userId, username, school, status, verificationState, isAdmin }` — used by Task 3's nav bar and every protected page's auth guard. `POST /api/auth/logout` (auth required) clears the session cookie — used by the nav bar's logout link.

- [ ] **Step 1: Write the failing test for the combined feed**

```typescript
// append to test/routes/posts.test.ts
describe("GET /posts (combined feed)", () => {
  it("returns posts from all categories, newest first by default", async () => {
    const token = await makeVerifiedUser("combined-feed-author");
    const catA = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'accommodation'").first<{
      id: number;
    }>();
    const catB = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'general'").first<{ id: number }>();

    await SELF.fetch("https://example.com/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ categoryId: catA!.id, title: "From accommodation", body: "b" }),
    });
    await SELF.fetch("https://example.com/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ categoryId: catB!.id, title: "From general", body: "b" }),
    });

    const res = await SELF.fetch("https://example.com/api/posts");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { posts: { title: string }[] };
    const titles = body.posts.map((p) => p.title);
    expect(titles).toContain("From accommodation");
    expect(titles).toContain("From general");
  });

  it("supports sort=top", async () => {
    const res = await SELF.fetch("https://example.com/api/posts?sort=top");
    expect(res.status).toBe(200);
  });
});
```

(This appends to the existing `test/routes/posts.test.ts` from the backend plan — `makeVerifiedUser` is already defined at the top of that file.)

- [ ] **Step 2: Add the route to `src/routes/posts.ts`** (append below the existing `GET /:id` route)

```typescript
posts.get("/", async (c) => {
  const sort = c.req.query("sort") === "top" ? "p.score DESC" : "p.created_at DESC";
  const { results } = await c.env.DB.prepare(
    `SELECT p.id, p.title, p.body, p.image_keys, p.score, p.created_at, p.category_id,
            u.username, u.school, u.status
     FROM posts p JOIN users u ON u.id = p.author_id
     ORDER BY ${sort}`
  ).all();
  return c.json({ posts: results });
});
```

**Important:** Hono matches routes in registration order and `GET /:id` is already registered before this point in the file — since `/` and `/:id` are distinct path shapes (`/` has no path segment, `/:id` requires one), there's no collision, but place this new route ABOVE the `GET /:id` handler in the file for readability (route order doesn't affect correctness here, only clarity).

- [ ] **Step 3: Run the combined-feed tests**

Run: `npm test -- routes/posts.test.ts`
Expected: PASS (all posts tests, prior + 2 new)

- [ ] **Step 4: Write the failing test for `/auth/me` and `/auth/logout`**

```typescript
// test/routes/auth-me.test.ts
import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { createSessionToken } from "../../src/lib/session";
import { hashSecret } from "../../src/lib/crypto";

async function makeUser(id: string, opts: { isAdmin?: boolean } = {}) {
  await env.DB.prepare(
    `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, is_admin, created_at)
     VALUES (?, ?, ?, ?, 'EHL', 'student', 'verified', ?, 0)`
  )
    .bind(id, `user-${id}`, `${id}@ehl.ch`, await hashSecret("x"), opts.isAdmin ? 1 : 0)
    .run();
  return createSessionToken(id, env.SESSION_SECRET);
}

describe("GET /api/auth/me", () => {
  it("returns the current user's public info when authenticated", async () => {
    const token = await makeUser("whoami-1");
    const res = await SELF.fetch("https://example.com/api/auth/me", { headers: { Cookie: `session=${token}` } });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { username: string; school: string; isAdmin: boolean };
    expect(body.username).toBe("user-whoami-1");
    expect(body.school).toBe("EHL");
    expect(body.isAdmin).toBe(false);
  });

  it("returns 401 when not authenticated", async () => {
    const res = await SELF.fetch("https://example.com/api/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the session cookie", async () => {
    const token = await makeUser("logout-1");
    const res = await SELF.fetch("https://example.com/api/auth/logout", {
      method: "POST",
      headers: { Cookie: `session=${token}` },
    });
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(/session=;/);
    expect(setCookie).toMatch(/Max-Age=0/);
  });
});
```

- [ ] **Step 5: Add both routes to `src/routes/auth.ts`** (append at the end of the file; both use `requireVerified` since only verified users have a meaningful profile to return — an unverified user hitting `/me` should also work for the frontend's "pending verification" banner, so use `requireAuth` instead, which only checks the session is valid, not verification state)

```typescript
import { requireAuth } from "../middleware/auth";

auth.get("/me", requireAuth, async (c) => {
  const user = await c.env.DB.prepare(
    "SELECT username, school, status, verification_state, is_admin FROM users WHERE id = ?"
  )
    .bind(c.get("userId"))
    .first<{ username: string; school: string; status: string; verification_state: string; is_admin: number }>();

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({
    username: user.username,
    school: user.school,
    status: user.status,
    verificationState: user.verification_state,
    isAdmin: user.is_admin === 1,
  });
});

auth.post("/logout", requireAuth, (c) => {
  c.header("Set-Cookie", "session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
  return c.json({ message: "Logged out" });
});
```

Note: `src/routes/auth.ts` doesn't currently import `requireAuth` (only `requireVerified` is used elsewhere in the codebase, in `posts.ts`/`comments.ts`/`votes.ts`/`admin.ts`). Add the import alongside this file's existing imports at the top.

- [ ] **Step 6: Run the new tests, then the full suite**

Run: `npm test -- routes/auth-me.test.ts`
Expected: PASS (3 tests)

Run: `npm test`
Expected: PASS, full suite green (55 prior + 2 combined-feed + 3 auth-me/logout = 60 tests)

- [ ] **Step 7: Commit**

```bash
git add src/routes/posts.ts src/routes/auth.ts test/routes/posts.test.ts test/routes/auth-me.test.ts
git commit -m "feat: add combined post feed, session whoami, and logout endpoints for frontend"
```

---

### Task 3: Shared design system and API helper

**Files:**
- Create: `public/css/style.css`
- Create: `public/js/api.js`
- Create: `public/js/layout.js`

**Interfaces:**
- Produces: CSS custom properties and shared component classes (`.nav`, `.sidebar`, `.post-card`, `.vote-controls`, `.btn`, `.badge`, `.form-field`) used by every page's HTML. `apiGet(path)`, `apiPost(path, body)`, `apiPostForm(path, formData)` from `public/js/api.js` — thrown errors carry `.status` and `.data`. `initNav()` and `renderSidebar(activeSlug)` from `public/js/layout.js` — every later page task calls these on load.

- [ ] **Step 1: Create `public/css/style.css`**

```css
:root {
  --color-bg: #faf7f2;
  --color-surface: #ffffff;
  --color-text: #1c2430;
  --color-text-muted: #5b6472;
  --color-border: #e3ddd2;
  --color-nav-bg: #1c2430;
  --color-nav-text: #f5f1e8;
  --color-accent: #c9975a;
  --color-accent-hover: #b8834a;
  --color-danger: #b3452c;
  --radius: 6px;
  --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: var(--font);
  background: var(--color-bg);
  color: var(--color-text);
}

a { color: var(--color-accent); text-decoration: none; }
a:hover { color: var(--color-accent-hover); }

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-nav-bg);
  color: var(--color-nav-text);
  padding: 0.75rem 1.5rem;
}
.nav a { color: var(--color-nav-text); margin-left: 1rem; }
.nav .nav-brand { font-weight: 700; font-size: 1.1rem; color: var(--color-nav-text); margin-left: 0; }

.layout {
  display: flex;
  max-width: 960px;
  margin: 1.5rem auto;
  gap: 1.5rem;
  padding: 0 1rem;
}

.sidebar {
  flex: 0 0 220px;
}
.sidebar h3 { font-size: 0.85rem; text-transform: uppercase; color: var(--color-text-muted); }
.sidebar ul { list-style: none; padding: 0; margin: 0; }
.sidebar li { margin-bottom: 0.4rem; }
.sidebar a.active { color: var(--color-text); font-weight: 700; }

.main { flex: 1; min-width: 0; }

.post-card {
  display: flex;
  gap: 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 0.9rem 1rem;
  margin-bottom: 0.75rem;
}
.post-card h3 { margin: 0 0 0.25rem 0; }
.post-card .meta { color: var(--color-text-muted); font-size: 0.85rem; }
.post-card .badge { color: var(--color-text-muted); }

.vote-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  min-width: 2rem;
}
.vote-controls button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: var(--color-text-muted);
}
.vote-controls button:hover { color: var(--color-accent); }
.vote-controls .score { font-weight: 700; }

.btn {
  display: inline-block;
  background: var(--color-accent);
  color: #1c2430;
  border: none;
  border-radius: var(--radius);
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
}
.btn:hover { background: var(--color-accent-hover); }
.btn-secondary { background: transparent; border: 1px solid var(--color-border); color: var(--color-text); }

.badge {
  display: inline-block;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.1rem 0.6rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.form-field { margin-bottom: 1rem; }
.form-field label { display: block; margin-bottom: 0.3rem; font-weight: 600; }
.form-field input, .form-field textarea, .form-field select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-family: var(--font);
}

.error-message { color: var(--color-danger); margin: 0.5rem 0; }
.form-card {
  max-width: 420px;
  margin: 2rem auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.5rem;
}
```

- [ ] **Step 2: Create `public/js/api.js`**

```javascript
async function apiRequest(method, path, body, isForm) {
  const opts = { method, credentials: "same-origin" };
  if (body !== undefined) {
    if (isForm) {
      opts.body = body;
    } else {
      opts.headers = { "Content-Type": "application/json" };
      opts.body = JSON.stringify(body);
    }
  }
  const res = await fetch(path, opts);
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function apiGet(path) {
  return apiRequest("GET", path, undefined, false);
}

function apiPost(path, body) {
  return apiRequest("POST", path, body, false);
}

function apiPostForm(path, formData) {
  return apiRequest("POST", path, formData, true);
}
```

- [ ] **Step 3: Create `public/js/layout.js`**

```javascript
async function initNav() {
  const nav = document.getElementById("site-nav");
  if (!nav) return;
  try {
    const me = await apiGet("/api/auth/me");
    nav.innerHTML =
      '<a href="/index.html" class="nav-brand">HospoGrad</a>' +
      '<span>' +
      '<a href="/profile.html?username=' + encodeURIComponent(me.username) + '">u/' + me.username +
      ' &middot; ' + me.school + ' &middot; ' + me.status + '</a>' +
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

async function renderSidebar(activeSlug) {
  const sidebar = document.getElementById("category-sidebar");
  if (!sidebar) return;
  const data = await apiGet("/api/categories");
  const items = data.categories
    .map((c) => {
      const activeClass = c.slug === activeSlug ? " class=\"active\"" : "";
      return '<li><a href="/category.html?slug=' + encodeURIComponent(c.slug) + '"' + activeClass + '>' + c.name + "</a></li>";
    })
    .join("");
  sidebar.innerHTML = "<h3>Categories</h3><ul>" + items + "</ul>";
}

async function requireAuthOrRedirect() {
  try {
    return await apiGet("/api/auth/me");
  } catch (e) {
    window.location.href = "/login.html";
    return null;
  }
}

async function requireAdminOrRedirect() {
  const me = await requireAuthOrRedirect();
  if (me && !me.isAdmin) {
    window.location.href = "/index.html";
    return null;
  }
  return me;
}
```

- [ ] **Step 4: Verify by eye** — these are static assets with no test runner; there is nothing to execute yet since no HTML page includes them until Task 4. Confirm the files are syntactically valid JS by running:

Run: `node --check public/js/api.js && node --check public/js/layout.js`
Expected: no output (success) from both `node --check` invocations.

- [ ] **Step 5: Commit**

```bash
git add public/css/style.css public/js/api.js public/js/layout.js
git commit -m "feat: add shared frontend design system and API/auth helper scripts"
```

---

### Task 4: Auth pages (signup, verify-otp, alumni-verify, login)

**Files:**
- Create: `public/signup.html`, `public/js/signup.js`
- Create: `public/verify-otp.html`, `public/js/verify-otp.js`
- Create: `public/alumni-verify.html`, `public/js/alumni-verify.js`
- Create: `public/login.html`, `public/js/login.js`

**Interfaces:**
- Consumes: `apiPost`, `apiPostForm` from Task 3's `public/js/api.js`; `initNav` from `public/js/layout.js`.
- Produces: working signup → verify/alumni-verify → login flow, reachable by any later page's "Log in"/"Sign up" links.

- [ ] **Step 1: Create `public/signup.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Sign up · HospoGrad</title>
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <nav class="nav" id="site-nav"></nav>
    <div class="form-card">
      <h2>Create your account</h2>
      <form id="signup-form">
        <div class="form-field">
          <label for="username">Username</label>
          <input type="text" id="username" required />
        </div>
        <div class="form-field">
          <label for="email">Email</label>
          <input type="email" id="email" required />
        </div>
        <div class="form-field">
          <label for="password">Password</label>
          <input type="password" id="password" required minlength="8" />
        </div>
        <div class="form-field">
          <label for="school">School</label>
          <input type="text" id="school" required placeholder="e.g. EHL" />
        </div>
        <div class="form-field">
          <label for="status">I am a...</label>
          <select id="status">
            <option value="student">Current student</option>
            <option value="alumni">Alumni</option>
          </select>
        </div>
        <p class="error-message" id="error" hidden></p>
        <button type="submit" class="btn">Sign up</button>
      </form>
      <p>Already have an account? <a href="/login.html">Log in</a></p>
    </div>
    <script src="/js/api.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/signup.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Create `public/js/signup.js`**

```javascript
initNav();

document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("error");
  errorEl.hidden = true;

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const school = document.getElementById("school").value;
  const status = document.getElementById("status").value;

  try {
    await apiPost("/api/auth/signup", { username, email, password, school, status });
    if (status === "student") {
      window.location.href = "/verify-otp.html?email=" + encodeURIComponent(email);
    } else {
      window.location.href = "/alumni-verify.html?email=" + encodeURIComponent(email);
    }
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  }
});
```

- [ ] **Step 3: Create `public/verify-otp.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Verify your email · HospoGrad</title>
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <nav class="nav" id="site-nav"></nav>
    <div class="form-card">
      <h2>Check your email</h2>
      <p>Enter the 6-digit code we sent you.</p>
      <form id="verify-form">
        <div class="form-field">
          <label for="code">Verification code</label>
          <input type="text" id="code" required maxlength="6" pattern="[0-9]{6}" />
        </div>
        <p class="error-message" id="error" hidden></p>
        <button type="submit" class="btn">Verify</button>
      </form>
    </div>
    <script src="/js/api.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/verify-otp.js"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `public/js/verify-otp.js`**

```javascript
initNav();

const params = new URLSearchParams(window.location.search);
const email = params.get("email");

document.getElementById("verify-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("error");
  errorEl.hidden = true;
  const code = document.getElementById("code").value;

  try {
    await apiPost("/api/auth/verify-otp", { email, code });
    window.location.href = "/login.html";
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  }
});
```

- [ ] **Step 5: Create `public/alumni-verify.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Verify your alumni status · HospoGrad</title>
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <nav class="nav" id="site-nav"></nav>
    <div class="form-card">
      <h2>Verify your alumni status</h2>
      <p>Submit a LinkedIn profile URL or upload proof (diploma photo, alumni card).</p>
      <form id="alumni-form">
        <div class="form-field">
          <label for="linkedinUrl">LinkedIn URL (optional if uploading a document)</label>
          <input type="url" id="linkedinUrl" />
        </div>
        <div class="form-field">
          <label for="document">Document (optional if providing a LinkedIn URL)</label>
          <input type="file" id="document" />
        </div>
        <p class="error-message" id="error" hidden></p>
        <button type="submit" class="btn">Submit for review</button>
      </form>
    </div>
    <script src="/js/api.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/alumni-verify.js"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `public/js/alumni-verify.js`**

```javascript
initNav();

const params = new URLSearchParams(window.location.search);
const email = params.get("email");

document.getElementById("alumni-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("error");
  errorEl.hidden = true;

  const linkedinUrl = document.getElementById("linkedinUrl").value;
  const documentInput = document.getElementById("document");

  const formData = new FormData();
  formData.set("email", email);
  if (linkedinUrl) formData.set("linkedinUrl", linkedinUrl);
  if (documentInput.files.length > 0) formData.set("document", documentInput.files[0]);

  try {
    await apiPostForm("/api/auth/alumni-verification", formData);
    document.querySelector(".form-card").innerHTML =
      "<h2>Submitted</h2><p>Your alumni verification is pending admin review. You can log in once approved.</p>" +
      '<a class="btn" href="/login.html">Go to login</a>';
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  }
});
```

- [ ] **Step 7: Create `public/login.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Log in · HospoGrad</title>
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <nav class="nav" id="site-nav"></nav>
    <div class="form-card">
      <h2>Log in</h2>
      <form id="login-form">
        <div class="form-field">
          <label for="username">Username</label>
          <input type="text" id="username" required />
        </div>
        <div class="form-field">
          <label for="password">Password</label>
          <input type="password" id="password" required />
        </div>
        <p class="error-message" id="error" hidden></p>
        <button type="submit" class="btn">Log in</button>
      </form>
      <p>New here? <a href="/signup.html">Sign up</a></p>
    </div>
    <script src="/js/api.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/login.js"></script>
  </body>
</html>
```

- [ ] **Step 8: Create `public/js/login.js`**

```javascript
initNav();

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("error");
  errorEl.hidden = true;

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    await apiPost("/api/auth/login", { username, password });
    window.location.href = "/index.html";
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  }
});
```

- [ ] **Step 9: Syntax-check all new JS files**

Run: `node --check public/js/signup.js && node --check public/js/verify-otp.js && node --check public/js/alumni-verify.js && node --check public/js/login.js`
Expected: no output (success).

- [ ] **Step 10: Commit**

```bash
git add public/signup.html public/js/signup.js public/verify-otp.html public/js/verify-otp.js public/alumni-verify.html public/js/alumni-verify.js public/login.html public/js/login.js
git commit -m "feat: add signup, OTP verification, alumni verification, and login pages"
```

---

### Task 5: Home feed page

**Files:**
- Modify: `public/index.html` (replace Task 1's placeholder)
- Create: `public/js/home.js`

**Interfaces:**
- Consumes: `apiGet` (Task 3), `initNav`/`renderSidebar` (Task 3), `GET /api/posts` and `GET /api/categories` (Task 2/existing).
- Produces: the site's front page, linked from every page's nav brand.

- [ ] **Step 1: Replace `public/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>HospoGrad</title>
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <nav class="nav" id="site-nav"></nav>
    <div class="layout">
      <aside class="sidebar" id="category-sidebar"></aside>
      <main class="main">
        <div>
          <a href="?sort=new" class="btn-secondary btn" id="sort-new">New</a>
          <a href="?sort=top" class="btn-secondary btn" id="sort-top">Top</a>
        </div>
        <div id="post-list"></div>
      </main>
    </div>
    <script src="/js/api.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/home.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Create `public/js/home.js`**

```javascript
initNav();
renderSidebar(null);

function renderPostList(posts) {
  const list = document.getElementById("post-list");
  if (posts.length === 0) {
    list.innerHTML = "<p>No posts yet. Be the first to post!</p>";
    return;
  }
  list.innerHTML = posts
    .map(
      (p) =>
        '<div class="post-card">' +
        '<div class="vote-controls"><span class="score">' + p.score + "</span></div>" +
        "<div>" +
        '<h3><a href="/post.html?id=' + encodeURIComponent(p.id) + '">' + escapeHtml(p.title) + "</a></h3>" +
        '<div class="meta">' +
        '<span class="badge">u/' + escapeHtml(p.username) + " &middot; " + escapeHtml(p.school) + " &middot; " + escapeHtml(p.status) + "</span>" +
        "</div>" +
        "</div>" +
        "</div>"
    )
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function loadFeed() {
  const params = new URLSearchParams(window.location.search);
  const sort = params.get("sort") === "top" ? "top" : "new";
  const data = await apiGet("/api/posts?sort=" + sort);
  renderPostList(data.posts);
}

loadFeed();
```

- [ ] **Step 3: Syntax-check**

Run: `node --check public/js/home.js`
Expected: no output (success).

- [ ] **Step 4: Commit**

```bash
git add public/index.html public/js/home.js
git commit -m "feat: add home feed page with New/Top sort"
```

---

### Task 6: Category feed page

**Files:**
- Create: `public/category.html`
- Create: `public/js/category.js`

**Interfaces:**
- Consumes: `apiGet`, `initNav`, `renderSidebar` (Task 3), `GET /api/categories/:slug/posts` (existing backend).
- Produces: category feed, linked from the sidebar on every page.

- [ ] **Step 1: Create `public/category.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Category · HospoGrad</title>
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <nav class="nav" id="site-nav"></nav>
    <div class="layout">
      <aside class="sidebar" id="category-sidebar"></aside>
      <main class="main">
        <h2 id="category-name"></h2>
        <p id="category-description" class="meta"></p>
        <div id="post-list"></div>
      </main>
    </div>
    <script src="/js/api.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/category.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Create `public/js/category.js`**

```javascript
initNav();

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

renderSidebar(slug);

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderPostList(posts) {
  const list = document.getElementById("post-list");
  if (posts.length === 0) {
    list.innerHTML = "<p>No posts in this category yet.</p>";
    return;
  }
  list.innerHTML = posts
    .map(
      (p) =>
        '<div class="post-card">' +
        '<div class="vote-controls"><span class="score">' + p.score + "</span></div>" +
        "<div>" +
        '<h3><a href="/post.html?id=' + encodeURIComponent(p.id) + '">' + escapeHtml(p.title) + "</a></h3>" +
        '<div class="meta">' +
        '<span class="badge">u/' + escapeHtml(p.username) + " &middot; " + escapeHtml(p.school) + " &middot; " + escapeHtml(p.status) + "</span>" +
        "</div>" +
        "</div>" +
        "</div>"
    )
    .join("");
}

async function loadCategory() {
  const catData = await apiGet("/api/categories");
  const category = catData.categories.find((c) => c.slug === slug);
  if (category) {
    document.getElementById("category-name").textContent = category.name;
    document.getElementById("category-description").textContent = category.description;
  }
  const feedData = await apiGet("/api/categories/" + encodeURIComponent(slug) + "/posts");
  renderPostList(feedData.posts);
}

loadCategory();
```

- [ ] **Step 3: Syntax-check**

Run: `node --check public/js/category.js`
Expected: no output (success).

- [ ] **Step 4: Commit**

```bash
git add public/category.html public/js/category.js
git commit -m "feat: add category feed page"
```

---

### Task 7: Post detail, comments, and voting

**Files:**
- Create: `public/post.html`
- Create: `public/js/post.js`

**Interfaces:**
- Consumes: `apiGet`, `apiPost`, `initNav`, `requireAuthOrRedirect` (Task 3, used only for the reply/vote actions, not page load — the page itself is public), `GET /api/posts/:id`, `GET /api/posts/:postId/comments`, `POST /api/posts/:postId/comments`, `POST /api/votes` (existing/Task 2 backend).
- Produces: the post detail page, linked from every post card across the home/category feeds.

- [ ] **Step 1: Create `public/post.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Post · HospoGrad</title>
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <nav class="nav" id="site-nav"></nav>
    <div class="layout">
      <main class="main" style="flex: 1 1 100%;">
        <div id="post-detail"></div>
        <hr />
        <h3>Comments</h3>
        <form id="comment-form">
          <div class="form-field">
            <textarea id="comment-body" placeholder="Add a comment" required></textarea>
          </div>
          <p class="error-message" id="comment-error" hidden></p>
          <button type="submit" class="btn">Comment</button>
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

- [ ] **Step 2: Create `public/js/post.js`**

```javascript
initNav();

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
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
  document.getElementById("post-detail").innerHTML =
    '<div class="post-card">' +
    '<div class="vote-controls">' +
    '<button type="button" id="upvote">&#9650;</button>' +
    '<span class="score">' + p.score + "</span>" +
    '<button type="button" id="downvote">&#9660;</button>' +
    "</div>" +
    "<div>" +
    "<h2>" + escapeHtml(p.title) + "</h2>" +
    "<p>" + escapeHtml(p.body) + "</p>" +
    '<div class="meta"><span class="badge">u/' + escapeHtml(p.username) + " &middot; " + escapeHtml(p.school) + " &middot; " + escapeHtml(p.status) + "</span></div>" +
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
    '<div class="post-card" style="margin-left: 0;">' +
    "<div><p>" + escapeHtml(c.body) + "</p>" +
    '<div class="meta"><span class="badge">u/' + escapeHtml(c.username) + " &middot; " + escapeHtml(c.school) + "</span></div>" +
    '<div style="margin-left: 1.5rem;">' + childrenHtml + "</div>" +
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

- [ ] **Step 3: Syntax-check**

Run: `node --check public/js/post.js`
Expected: no output (success).

- [ ] **Step 4: Commit**

```bash
git add public/post.html public/js/post.js
git commit -m "feat: add post detail page with threaded comments and voting"
```

---

### Task 8: Create post page

**Files:**
- Create: `public/create-post.html`
- Create: `public/js/create-post.js`

**Interfaces:**
- Consumes: `apiGet`, `apiPost`, `initNav`, `requireAuthOrRedirect` (Task 3), `GET /api/categories`, `POST /api/posts` (existing backend).
- Produces: the new-post form, linked from the nav bar's "New post" link (only shown when logged in, per Task 3's `initNav`).

- [ ] **Step 1: Create `public/create-post.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>New post · HospoGrad</title>
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <nav class="nav" id="site-nav"></nav>
    <div class="form-card">
      <h2>Create a post</h2>
      <form id="create-post-form">
        <div class="form-field">
          <label for="category">Category</label>
          <select id="category"></select>
        </div>
        <div class="form-field">
          <label for="title">Title</label>
          <input type="text" id="title" required />
        </div>
        <div class="form-field">
          <label for="body">Body</label>
          <textarea id="body" required rows="6"></textarea>
        </div>
        <p class="error-message" id="error" hidden></p>
        <button type="submit" class="btn">Post</button>
      </form>
    </div>
    <script src="/js/api.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/create-post.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Create `public/js/create-post.js`**

```javascript
initNav();

async function init() {
  await requireAuthOrRedirect();
  const data = await apiGet("/api/categories");
  const select = document.getElementById("category");
  select.innerHTML = data.categories
    .map((c) => '<option value="' + c.id + '">' + c.name + "</option>")
    .join("");
}

document.getElementById("create-post-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("error");
  errorEl.hidden = true;

  const categoryId = parseInt(document.getElementById("category").value, 10);
  const title = document.getElementById("title").value;
  const body = document.getElementById("body").value;

  try {
    const result = await apiPost("/api/posts", { categoryId, title, body });
    window.location.href = "/post.html?id=" + encodeURIComponent(result.post.id);
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  }
});

init();
```

- [ ] **Step 3: Syntax-check**

Run: `node --check public/js/create-post.js`
Expected: no output (success).

- [ ] **Step 4: Commit**

```bash
git add public/create-post.html public/js/create-post.js
git commit -m "feat: add create-post page"
```

---

### Task 9: Public profile page

**Files:**
- Create: `public/profile.html`
- Create: `public/js/profile.js`

**Interfaces:**
- Consumes: `apiGet`, `initNav` (Task 3), `GET /api/users/:username` (existing backend).
- Produces: the profile page, linked from the nav bar and from every post/comment's author badge.

- [ ] **Step 1: Create `public/profile.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Profile · HospoGrad</title>
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <nav class="nav" id="site-nav"></nav>
    <div class="layout">
      <main class="main" style="flex: 1 1 100%;">
        <div id="profile-header"></div>
        <h3>Posts</h3>
        <div id="profile-posts"></div>
        <h3>Comments</h3>
        <div id="profile-comments"></div>
      </main>
    </div>
    <script src="/js/api.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/profile.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Create `public/js/profile.js`**

```javascript
initNav();

const params = new URLSearchParams(window.location.search);
const username = params.get("username");

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function loadProfile() {
  const errorTarget = document.getElementById("profile-header");
  try {
    const data = await apiGet("/api/users/" + encodeURIComponent(username));
    errorTarget.innerHTML =
      "<h2>u/" + escapeHtml(data.user.username) + "</h2>" +
      '<p class="badge">' + escapeHtml(data.user.school) + " &middot; " + escapeHtml(data.user.status) +
      " &middot; " + escapeHtml(data.user.verification_state) + "</p>";

    document.getElementById("profile-posts").innerHTML = data.posts.length
      ? data.posts
          .map(
            (p) =>
              '<div class="post-card"><a href="/post.html?id=' + encodeURIComponent(p.id) + '">' +
              escapeHtml(p.title) + "</a></div>"
          )
          .join("")
      : "<p>No posts yet.</p>";

    document.getElementById("profile-comments").innerHTML = data.comments.length
      ? data.comments
          .map(
            (c) =>
              '<div class="post-card"><a href="/post.html?id=' + encodeURIComponent(c.post_id) + '">' +
              escapeHtml(c.body) + "</a></div>"
          )
          .join("")
      : "<p>No comments yet.</p>";
  } catch (err) {
    errorTarget.innerHTML = "<p>User not found.</p>";
  }
}

loadProfile();
```

- [ ] **Step 3: Syntax-check**

Run: `node --check public/js/profile.js`
Expected: no output (success).

- [ ] **Step 4: Commit**

```bash
git add public/profile.html public/js/profile.js
git commit -m "feat: add public profile page"
```

---

### Task 10: Admin verification queue page

**Files:**
- Create: `public/admin.html`
- Create: `public/js/admin.js`

**Interfaces:**
- Consumes: `apiGet`, `apiPost`, `initNav`, `requireAdminOrRedirect` (Task 3), `GET /api/admin/verifications`, `POST /api/admin/verifications/:userId/approve`, `POST /api/admin/verifications/:userId/reject` (existing backend).
- Produces: the admin queue page, linked from the nav bar's "Admin" link (only shown when `isAdmin`, per Task 3's `initNav`).

- [ ] **Step 1: Create `public/admin.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Admin · HospoGrad</title>
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <nav class="nav" id="site-nav"></nav>
    <div class="layout">
      <main class="main" style="flex: 1 1 100%;">
        <h2>Pending verifications</h2>
        <div id="verification-list"></div>
      </main>
    </div>
    <script src="/js/api.js"></script>
    <script src="/js/layout.js"></script>
    <script src="/js/admin.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Create `public/js/admin.js`**

```javascript
initNav();

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function act(userId, action) {
  await apiPost("/api/admin/verifications/" + encodeURIComponent(userId) + "/" + action);
  await loadQueue();
}

async function loadQueue() {
  const data = await apiGet("/api/admin/verifications");
  const list = document.getElementById("verification-list");
  if (data.users.length === 0) {
    list.innerHTML = "<p>No pending verifications.</p>";
    return;
  }
  list.innerHTML = data.users
    .map(
      (u) =>
        '<div class="post-card">' +
        "<div>" +
        "<strong>" + escapeHtml(u.username) + "</strong> &middot; " + escapeHtml(u.school) + " &middot; " + escapeHtml(u.status) +
        (u.verification_doc_key ? '<p class="meta">Doc key: ' + escapeHtml(u.verification_doc_key) + "</p>" : "") +
        "</div>" +
        '<div style="margin-left: auto;">' +
        '<button type="button" class="btn" data-action="approve" data-id="' + escapeHtml(u.id) + '">Approve</button> ' +
        '<button type="button" class="btn btn-secondary" data-action="reject" data-id="' + escapeHtml(u.id) + '">Reject</button>' +
        "</div>" +
        "</div>"
    )
    .join("");

  list.querySelectorAll("button[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => act(btn.getAttribute("data-id"), btn.getAttribute("data-action")));
  });
}

async function init() {
  const me = await requireAdminOrRedirect();
  if (!me) return;
  await loadQueue();
}

init();
```

- [ ] **Step 3: Syntax-check**

Run: `node --check public/js/admin.js`
Expected: no output (success).

- [ ] **Step 4: Commit**

```bash
git add public/admin.html public/js/admin.js
git commit -m "feat: add admin verification queue page"
```

---

### Task 11: End-to-end QA pass

**Files:** none (verification only — no code changes expected unless QA finds a bug, in which case fix it in the relevant file from Tasks 1-10 and note the fix in the commit).

**Interfaces:** none — this task exercises the full stack built by Tasks 1-10 through a real browser against `wrangler dev`.

- [ ] **Step 1: Start the dev server**

Run: `npm run db:migrate:local` (idempotent, safe to re-run), then `npm run dev` in the background.

- [ ] **Step 2: Walk the golden path using the `/qa` skill (or manual `browse` commands) against `http://localhost:8787`**

Verify, in order:
1. `goto /index.html` — page loads, shows empty feed or existing posts, sidebar shows 7 categories, nav shows Login/Signup.
2. `goto /signup.html` — sign up a new student account. Redirects to `/verify-otp.html`.
3. Read the OTP hash from local D1 is not possible from the browser — for this QA pass, verify the signup API call succeeded (network tab / response) and separately confirm via `wrangler d1 execute --local` that the user row was created with `verification_state = 'pending'`. Manually flip it to `'verified'` via `wrangler d1 execute` for the purposes of continuing the walkthrough (same approach used to manually verify the backend earlier), then proceed.
4. `goto /login.html` — log in with the new account. Redirects to `/index.html`, nav now shows the username badge.
5. Click "New post" — `create-post.html` loads, category dropdown populated. Submit a post. Redirects to `/post.html?id=...` showing the new post.
6. On the post page, submit a comment — appears in the comment list without a page reload.
7. Click upvote — score increments, no page reload.
8. Click the category link in the sidebar — `category.html` loads filtered to that category, shows the post.
9. Click the username badge — `profile.html` loads showing the post and comment just created.
10. Click "Log out" — nav reverts to Login/Signup; `create-post.html` now redirects to `/login.html` when visited directly.
11. Promote the test user to admin via `wrangler d1 execute --local` (`UPDATE users SET is_admin = 1 WHERE username = '...'`), log back in, confirm "Admin" link appears in nav and `/admin.html` loads (will show no pending verifications unless a second alumni account is created first — create one via `/signup.html` with the alumni path and confirm it appears in the queue, then approve it and confirm the list updates).

Expected: every step above completes without a console error (`browse console --errors` should be empty at each checkpoint) and without a broken redirect.

- [ ] **Step 3: Fix any bugs found**, re-run the specific failing step, and confirm the full backend test suite (`npm test`) still passes after any backend-side fixes.

- [ ] **Step 4: Stop the dev server** and commit any fixes made during this pass (skip this commit if no fixes were needed).

```bash
git add -A
git commit -m "fix: address issues found during end-to-end QA pass"
```

(Omit this commit entirely if Step 3 required no changes.)
