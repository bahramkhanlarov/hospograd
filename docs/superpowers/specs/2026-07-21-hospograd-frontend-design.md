# HospoGrad Frontend MVP Design

**Date:** 2026-07-21
**Status:** Approved by founders, ready for implementation planning

## Purpose

Give HospoGrad's existing backend API (see `2026-07-21-hospograd-mvp-design.md` and
the backend implementation) a working, visual frontend so the community platform is
actually usable in a browser, not just via raw JSON responses.

## Scope (MVP)

In scope:
- Static multi-page HTML/CSS/JS frontend covering the full backend API surface:
  home feed, category feed, post detail + comments, create post, signup/login/
  OTP verification, alumni verification upload, public profile, admin
  verification queue.
- Restructuring the existing backend so API and frontend share one origin.

Out of scope (future):
- Any JS framework/bundler/build pipeline.
- Partner ad placements (still deferred per the backend design doc).
- Mobile app.
- Admin document viewer endpoint (deferred per the backend's final review).

## Architecture

Single Cloudflare Worker serves both the API and the static frontend on one
origin:

- All existing API routes move under an `/api/*` prefix (e.g. `/auth/login`
  becomes `/api/auth/login`). This is a mechanical restructuring of the
  already-built backend — route logic is unchanged, only the mount path and
  the corresponding test request paths change.
- `wrangler.toml` gains a Cloudflare Workers static assets binding (`ASSETS`)
  pointing at a new `public/` directory containing the frontend files.
- The Hono app's fallback route (anything not matched by `/api/*`) calls
  `c.env.ASSETS.fetch(c.req.raw)` to serve the static frontend.

This keeps the session cookie first-party (`SameSite=Lax`, as already built)
with no CORS configuration needed — the frontend and API are indistinguishable
from the browser's perspective.

## Pages

Static multi-page site, no client-side router. Dynamic content is addressed
via query parameters:

| Page | Purpose | Auth |
|---|---|---|
| `index.html` | Home feed: sidebar of 7 categories, combined post list, Hot/New/Top sort tabs | Public |
| `category.html?slug=...` | Single category feed | Public |
| `post.html?id=...` | Post detail, threaded comments, reply box, vote controls | Public (reply/vote require login) |
| `create-post.html` | New post form (category + title + body) | Verified users only |
| `signup.html` | School + student/alumni signup form | Public |
| `verify-otp.html` | 6-digit OTP entry (student path) | Public |
| `alumni-verify.html` | LinkedIn URL or document upload (alumni path) | Public |
| `login.html` | Username + password login | Public |
| `profile.html?username=...` | Public profile: username, school badge, post/comment history | Public |
| `admin.html` | Pending verification queue, approve/reject buttons | Admin only |

## Shared Frontend Code

- `public/js/api.js` — plain JS (no TypeScript, no bundler) fetch wrappers:
  `apiGet(path)`, `apiPost(path, body)`, `apiPostForm(path, formData)`. Each
  handles JSON parsing, non-2xx error surfacing, and `credentials: "same-origin"`
  so the session cookie is sent automatically.
- One small page-specific script per HTML page (e.g. `js/home.js`,
  `js/post.js`) that calls the shared helpers and renders results into the
  DOM. No shared component system — pages are simple enough not to need one.
- `public/css/style.css` — single shared stylesheet. Classic Reddit-style
  layout: left sidebar (categories), center feed (post cards with vote
  arrows, category badge, comment count, author badge), top sort tabs.
  Palette: deep charcoal/navy (`#1c2430`) for header/nav, warm off-white
  background, muted gold/amber accent (`#c9975a`) for links, buttons, and
  vote indicators. System font stack, no webfont dependency.

## Auth UX Flow

1. **Signup** (`signup.html`): user picks school + student/alumni status.
   - Student path → redirect to `verify-otp.html`, enter the 6-digit code
     from email.
   - Alumni path → redirect to `alumni-verify.html`, submit LinkedIn URL or
     upload a document, then show a "pending admin review" message (no OTP
     step).
2. **Login** (`login.html`): username + password, sets the session cookie,
   redirect to `index.html`.
3. **Protected pages** (`create-post.html`, `admin.html`) verify auth
   client-side by calling a lightweight authenticated endpoint on load and
   redirecting to `login.html` on a 401/403 — the session cookie is HttpOnly,
   so JS cannot check its presence directly and must not assume login state
   from local storage.
4. **Nav bar**: shows username + school badge (`u/username · School ·
   Student/Alumni`) when logged in, fetched once via the profile endpoint;
   shows Login/Signup links when not.

## Testing Approach

No unit-test framework for the frontend — it's static HTML/CSS/JS with no
build step. Verification is via `/qa` (gstack's browser-driven QA skill)
walking the golden path end-to-end against a running `wrangler dev`:
signup → verify-otp → login → browse categories → create post → comment →
vote → view profile → admin approve flow. This mirrors the API-level flow
already manually verified working during backend development.

Backend restructuring (the `/api/*` prefix move) is still covered by the
existing Vitest suite — all existing tests get their request paths updated
to include `/api`, and the full 55-test suite must stay green after the
restructuring.
