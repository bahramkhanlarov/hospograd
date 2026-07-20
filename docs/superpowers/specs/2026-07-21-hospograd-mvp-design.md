# HospoGrad MVP Design

**Working title:** HospoGrad
**Date:** 2026-07-21
**Status:** Approved by founders, ready for implementation planning

## Purpose

A Reddit-style community platform for current students and alumni of Swiss hotel
management schools. Members discuss accommodation, health insurance, visas/legal,
jobs, money/taxes, and school life. The platform's core value is peer-verified
advice from people who actually attended these schools, not generic internet
opinions.

Monetization (partner banners, premium membership) is deliberately out of scope
for this MVP — the priority is building an active, trustworthy community first.

## Scope (MVP)

In scope:
- Account signup with school + status verification (student/alumni)
- Fixed set of admin-created categories
- Text + image posts within categories
- Threaded comments with voting
- Pseudonymous usernames with a visible school/status credibility badge
- Basic moderation (report queue, rate limiting)

Out of scope (future):
- Partner ad placements / affiliate monetization
- Premium membership tier
- User-created categories
- Video/link post types
- Mobile app

## Tech Stack

- **Hosting:** Cloudflare Pages (frontend) + Cloudflare Workers (API/backend logic)
- **Database:** Cloudflare D1
- **File storage:** Cloudflare R2 (post images, alumni verification uploads)
- **CI/CD:** GitHub
- **Auth:** custom, built on Workers (no third-party auth provider) — school-email
  OTP for students, manual admin review for alumni verification uploads

All free-tier eligible at MVP scale (D1: 5GB storage / 5M reads / 100K writes per
day; R2: 10GB storage / 1M reads / 10M writes per month, no egress fees; Workers:
100K requests/day).

## Categories (fixed, admin-managed)

1. Accommodation & Housing
2. Health & Insurance
3. Visa & Legal
4. Jobs & Internships
5. Money & Taxes
6. School Life & Courses
7. General Discussion

Each category has its own feed page with a short description at the top.

## Verification Flow

1. User signs up, selects their school and status (Student / Alumni).
2. **Student path:** enters school email, receives OTP, verified instantly on
   confirmation.
3. **Alumni path:** submits a LinkedIn profile URL or a diploma/alumni-card photo
   (stored in a private R2 bucket). Account shows "pending verification" badge
   until an admin approves or rejects it via a simple admin review queue.
4. Verified users get a visible badge next to their username, e.g.
   `u/mountainchef92 · EHL · Alumni '22`. Real name and verification documents are
   never shown publicly — only visible to admins reviewing the queue.

## Page Layout

- **Home feed:** left sidebar (category list + "Create post" button), center
  column of post cards (title, preview text, category badge, vote arrows + score,
  comment count, author badge), top tabs to sort Hot / New / Top.
- **Category page:** same layout filtered to one category, with category
  description at top.
- **Post detail page:** full post body + images, vote controls, threaded/nested
  comments each with their own vote controls, reply box for logged-in users.
- **Profile page:** username, school badge, join date, verification status,
  post/comment history.

## Data Model (Cloudflare D1)

- `users`: id, username, password_hash, school, status (student/alumni),
  verification_state (pending/verified/rejected), verification_doc_url
  (R2 pointer, alumni only), created_at
- `categories`: id, name, slug, description
- `posts`: id, author_id, category_id, title, body, image_urls (R2 pointers),
  score, created_at
- `comments`: id, post_id, parent_comment_id (nullable, for threading),
  author_id, body, score, created_at
- `votes`: id, user_id, target_type (post/comment), target_id, value (+1/-1) —
  unique per (user_id, target_type, target_id) to prevent double-voting

## Moderation & Trust

- Report button on posts/comments feeds into an admin review queue (manually
  reviewed by the two founders at MVP scale)
- New accounts are rate-limited (max N posts/comments per hour) to deter spam
- No real name or email is ever shown publicly — only school/status badge and
  chosen username

## Future Monetization Hook (not built now)

Category pages are the intended slot for a single contextual partner banner
later (e.g. an insurance partner banner on the Health & Insurance category).
No schema changes are needed now — this will be added as an ad-slot component
on the category page template when the community has enough active users to
make partnerships worthwhile.
