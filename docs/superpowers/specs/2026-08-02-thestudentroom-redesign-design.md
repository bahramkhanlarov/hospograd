# HospoGrad → TheStudentRoom-style redesign

## Goal
Restyle HospoGrad's homepage, category, and thread pages to match TheStudentRoom's
dense forum format and visual identity (palette, typography, layout density),
replacing the current cream/gold editorial design.

## Scope
In scope:
- `public/css/style.css` — full token replacement (palette, typography, spacing/radius)
- `public/js/layout.js` — two-tier header (navy utility strip + breadcrumb/search strip)
- `public/index.html` + `public/js/home.js` — forum-index table + dense thread rows
- `public/category.html` + `public/js/category.js` — breadcrumb header + dense thread-row table
- `public/post.html` + `public/js/post.js` — byline-under-title OP, comments as bordered
  rows with left author rail
- `src/routes/categories.ts` — add `post_count` and `last_post_at` via aggregate query
- `src/routes/posts.ts` — add `comment_count` to `GET /` and reuse the same
  aggregate pattern for `GET /api/categories/:slug/posts` in `categories.ts`
  (needed for the "Replies" column in both the homepage post list and the
  category thread-row table)
- All HTML files — remove Google Fonts (Fraunces/Outfit) `<link>` tags; drop to
  system font stack

Out of scope (inherit new CSS tokens automatically via shared style.css, but no
structural/layout changes):
- `admin.html`, `alumni-verify.html`, `create-post.html`, `profile.html`,
  `login.html`, `signup.html`, `verify-otp.html`

No schema migrations. No changes to `posts.ts`, `comments.ts`, `votes.ts`,
`reports.ts`, `users.ts`, `admin.ts` route logic — this is a frontend
presentation change plus one additive backend query.

## Visual system

Replace current tokens in `style.css`:
- Header: dark navy (`#1e3a5f`-ish)
- Page background: light grey (`#f0f2f4`); content panels white (`#ffffff`)
- Links: TSR-standard blue (`#0060a8`-ish)
- Body text: near-black; meta text (views/replies/timestamps): muted grey
- Typography: system stack (`-apple-system, "Segoe UI", Arial, sans-serif`),
  13–14px base — no serif display font
- Borders: 1px light grey, replacing box-shadow cards
- Corner radius: sharp/minimal (2–4px), down from current 8–18px
- Accent/CTA color: single teal (`#0b8a6c`-ish) for buttons and active states,
  replacing gold

## Header (`layout.js`)

Two-tier header:
1. Top strip (navy, small text): brand wordmark left; right side keeps existing
   links — `u/username · school · status`, `New post`, `Admin` (conditional),
   `Log out` — same behavior as today, restyled denser
2. Second strip (white): breadcrumb trail (`Home > Category name` on
   category/post pages); search input is visual-only (no backend search exists
   yet) — render as a disabled/placeholder input, not wired to any endpoint

No changes to nav logic/API calls in `initNav()` — purely markup/CSS restructure.

## Homepage (`index.html`, `home.js`)

Two sections, both dense/table-styled (no big padded cards):
1. **Forum index**: one row per category — name + description (left), post
   count (middle), last-activity timestamp (right). Sourced from the updated
   `/api/categories` response. No fake/placeholder data — if a category has
   zero posts, `post_count` is 0 and `last_post_at` is null (render as "—" or
   "No posts yet").
2. **Recent/top posts list**: existing New/Top sort toggle retained; posts
   render as dense rows (title, author byline, reply count, vote score,
   last-activity) instead of cards.

Sidebar category nav (`renderSidebar`) is removed from the homepage layout —
superseded by the forum-index table. (Category pages keep their own
breadcrumb-based navigation instead of the sidebar.)

## Category page (`category.html`, `category.js`)

- Breadcrumb (`Home > {Category name}`) replaces the `<h2>` + `<p>` heading
  block; category description renders as small grey text under the breadcrumb
- Thread list as a bordered table: header row (Thread / Replies / Votes / Last
  activity), one row per post — title + byline underneath in small grey text,
  tabular-number reply/vote columns, right-aligned last-activity

## Thread detail (`post.html`, `post.js`)

- Original post: title as page heading, byline row (author · school · status ·
  timestamp) directly under title, body text, vote controls
- Comments: each comment is a bordered row with a left rail (~90px) showing
  avatar placeholder + username + school/status stacked, comment body and vote
  controls to the right
- Reply form: compact bordered box at the bottom; submit button uses the teal
  accent color, label "Post reply"

## Backend: `src/routes/categories.ts`

Replace the categories list query with an aggregate:

```sql
SELECT c.id, c.slug, c.name, c.description,
       COUNT(p.id) AS post_count,
       MAX(p.created_at) AS last_post_at
FROM categories c
LEFT JOIN posts p ON p.category_id = c.id
GROUP BY c.id
ORDER BY c.id
```

`GET /api/categories/:slug/posts` gains a `comment_count` column via the same
join pattern used in `posts.ts` below.

## Backend: `src/routes/posts.ts`

Both `GET /` and the query backing `GET /api/categories/:slug/posts` need a
per-post comment count for the "Replies" column. Add a `LEFT JOIN` against
`comments` grouped by post, e.g. for `GET /`:

```sql
SELECT p.id, p.title, p.body, p.image_keys, p.score, p.created_at, p.category_id,
       u.username, u.school, u.status,
       COUNT(cm.id) AS comment_count
FROM posts p
JOIN users u ON u.id = p.author_id
LEFT JOIN comments cm ON cm.post_id = p.id
GROUP BY p.id
ORDER BY ${sort}
```

The same `LEFT JOIN comments ... GROUP BY p.id` addition applies to the
`categories.ts` posts-by-slug query. `GET /:id` (single post) does not need
`comment_count` — the thread page already renders the full comment list.

## Testing

- Existing test suite (`test/`) covers route behavior; the categories query
  change needs a test asserting `post_count`/`last_post_at` appear correctly
  (including the zero-posts case) in the `GET /api/categories` response.
- `posts.ts` query change needs a test asserting `comment_count` appears
  correctly (including the zero-comments case) in both `GET /api/posts` and
  `GET /api/categories/:slug/posts` responses.
- No new routes, so no new route tests beyond those assertion updates.
- Manual verification: load index/category/post pages in a browser and confirm
  layout renders correctly with real seeded data, including zero-post and
  zero-comment states.
