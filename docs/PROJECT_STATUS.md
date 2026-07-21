# HospoGrad — Project Status

HospoGrad is a forum-style web app for hospitality-school students/alumni: categorized posts,
threaded comments, voting, alumni verification, and admin moderation. Backend runs on Cloudflare
Workers (Hono) with D1 (SQLite) and R2 (file storage); frontend is server-rendered static HTML/JS
served from the same Worker.

_Last updated: 2026-07-21_

## Stack

| Layer | Choice |
|---|---|
| Compute | Cloudflare Workers |
| Framework | Hono |
| Database | Cloudflare D1 (`hospograd`) |
| File storage | Cloudflare R2 (`hospograd-uploads`) — verification docs |
| Static assets | Cloudflare Workers Assets (`public/`) |
| Email | Resend API (OTP codes) |
| Tests | Vitest + `@cloudflare/vitest-pool-workers` |

## What's been done

### Backend (`src/`)
- **Auth** (`routes/auth.ts`): signup, email OTP verification, login/logout, session cookie (`lib/session.ts`, `lib/crypto.ts`), `GET /api/auth/me`.
- **Alumni verification**: `POST /api/auth/alumni-verification` accepts a document upload (stored in R2) or a LinkedIn URL; sets `verification_state = pending`.
- **Admin queue** (`routes/admin.ts`): list pending verifications, approve/reject, list open reports. Gated by `isAdmin` middleware.
- **Categories** (`routes/categories.ts`): list categories, list posts by category slug. Seeded with 7 categories (accommodation, health-insurance, visa-legal, jobs-internships, money-taxes, school-life, general).
- **Posts** (`routes/posts.ts`): create (verified users only, rate-limited), list/feed, get by id.
- **Comments** (`routes/comments.ts`): threaded via `parent_comment_id`, create (verified + rate-limited) and list per post.
- **Votes** (`routes/votes.ts`): upsert-on-change voting on posts/comments, recomputes `score`.
- **Reports** (`routes/reports.ts`): verified users can report a post/comment; feeds the admin queue.
- **Users** (`routes/users.ts`): public profile lookup by username with post/comment history.
- **Middleware** (`src/middleware/`): `requireAuth`/`requireVerified` session gating, per-user rate limiting (`rateLimitPosts`, `rateLimitComments`).
- **Schema** (`migrations/0001_init.sql`): `users`, `categories`, `posts`, `comments`, `votes`, `reports`, plus indexes on `posts.category_id`, `comments.post_id`, `votes(target_type, target_id)`.

### Frontend (`public/`)
Vanilla HTML/CSS/JS, no framework. Pages: `index` (home feed, New/Top sort), `category`, `post` (detail + threaded comments/voting), `create-post`, `signup`, `verify-otp`, `alumni-verify`, `login`, `profile` (public), `admin` (verification queue), `404`. Shared design system and API/auth helpers factored into `public/js` and `public/css`. Latest commit (`c28f6ee`) redid the visual system across all pages.

### Security fixes already applied
- User-controlled fields (username, school, status, category name) are now escaped in shared nav/sidebar rendering (`d4b0283`) — closes a stored-XSS path.
- Rate-limit boundary verified via test (requests 1–5 succeed, 6th blocked).
- Comment `parentCommentId` validated to reference an existing comment on the *same post*.

### Testing
19 test files, 60 tests, **all passing** (`npm test`). Coverage spans lib (crypto, encoding, OTP, session), middleware (auth, rate limit), every route file, and schema.

### Planning docs already on disk
- `docs/superpowers/specs/2026-07-21-hospograd-mvp-design.md`
- `docs/superpowers/specs/2026-07-21-hospograd-frontend-design.md`
- `docs/superpowers/plans/2026-07-21-hospograd-backend-api.md`
- `docs/superpowers/plans/2026-07-21-hospograd-frontend.md`

## What still needs to happen

### Manual deploy steps (not automatable by tests — from the backend plan doc)
1. `npx wrangler d1 create hospograd` → paste real `database_id` into `wrangler.toml` (currently `REPLACE_WITH_REAL_D1_ID`).
2. `npx wrangler r2 bucket create hospograd-uploads`.
3. `npx wrangler secret put SESSION_SECRET` and `npx wrangler secret put RESEND_API_KEY` (production secrets — currently only in gitignored `.dev.vars` for local dev/tests).
4. `npm run db:migrate:remote` to apply `migrations/0001_init.sql` against the real D1 instance.
5. Promote the first admin manually: `npx wrangler d1 execute hospograd --remote --command "UPDATE users SET is_admin = 1 WHERE username = 'YOUR_USERNAME'"`.

### Known gaps
- **No custom domain / route config** in `wrangler.toml` — only default `workers.dev` will serve it until a route/zone is added.
- **Email sending degrades silently**: `sendOtpEmail` no-ops if `RESEND_API_KEY` is unset (fine for dev, but confirm the key is set in prod or signups will complete without ever sending the OTP).
- **No image upload endpoint for posts**: schema has `posts.image_keys`, but no route currently writes to it — post creation always passes through whatever `imageKeys` the client sends, unvalidated against R2.
- **No pagination** on feed/category/user history endpoints — fine at current scale, will need it before content volume grows.
- **No CI workflow** in the repo (no `.github/workflows`) — tests only run locally today.
- **Admin surface is minimal**: verification approve/reject and reports listing exist, but there's no report-resolution action (mark resolved) or content takedown (delete post/comment) yet.
- **Mobile navigation**: not explicitly audited since the visual redesign in `c28f6ee` — worth a manual pass.

### Suggested next steps
1. Wire up the manual deploy steps above in a staging environment and smoke-test signup → OTP → login → post → comment → vote end-to-end.
2. Add a report-resolution action and content moderation (delete/hide) to the admin page.
3. Add pagination to `GET /api/posts`, `GET /api/categories/:slug/posts`, and `GET /api/users/:username`.
4. Decide on an image upload flow for posts (currently only alumni-verification docs use R2).
5. Add a CI workflow (`vitest run` + `tsc --noEmit`) so tests gate merges.
