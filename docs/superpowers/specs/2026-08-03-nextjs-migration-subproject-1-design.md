# Next.js migration — sub-project 1: toolchain, shared layout, homepage + Globe

## Context
HospoGrad's frontend is currently vanilla HTML/CSS/JS (`public/`) served as
static assets from a Cloudflare Worker (`wrangler.toml` `[assets]`), with a
Hono backend (`src/routes/*.ts`) providing the JSON API. This is the first
of five sub-projects migrating the frontend to Next.js/React/TypeScript/
Tailwind/shadcn, ending with a full replacement of the vanilla frontend.
This sub-project establishes the toolchain, backend integration strategy,
shared layout components, and rebuilds the homepage (including a new
Globe visual) — it does not touch the other 8 pages, which are later
sub-projects.

## Goal
- Stand up a working Next.js app in the same repo, deployed to Cloudflare
  Workers via `@opennextjs/cloudflare`, that can run alongside the
  existing vanilla site until cutover (sub-project 5).
- Reuse the entire existing Hono backend unmodified — zero changes to
  `src/routes/`, `src/lib/`, `src/middleware/`, or the 65 existing Vitest
  tests.
- Port the current design system (dark theme, Instrument Serif, teal
  accent, dense tables) into Tailwind/shadcn config, rather than adopting
  shadcn's default look.
- Rebuild the homepage as a React page with equivalent functionality to
  the current `index.html`/`home.js`, plus a new Globe visual.

## Scope

In scope:
- New Next.js App Router project at the repo root (`app/`, `components/`,
  `lib/` directories), TypeScript, Tailwind, shadcn initialized
- `@opennextjs/cloudflare` adapter and its build/deploy configuration
- `app/api/[[...route]]/route.ts` — catch-all mounting the existing Hono
  app
- `components/ui/globe.tsx` — the Globe component (copied per shadcn's
  standard copy-paste distribution model), `cobe` added as a dependency
- `components/layout/nav.tsx`, `components/layout/breadcrumb.tsx` —
  React ports of `layout.js`
- `lib/api.ts` — typed fetch wrapper replacing `api.js`
- `app/page.tsx` and its supporting components — React port of
  `index.html`/`home.js`, plus the new Globe section
- `app/globals.css` / Tailwind theme config — design tokens ported from
  `public/css/style.css`

Out of scope (later sub-projects): category, post/thread, login, signup,
verify-otp, profile, admin, alumni-verify, create-post, 404 pages. The
existing `public/` vanilla frontend and its Worker config are **not**
removed or modified in this sub-project — both apps coexist until
cutover. No changes to D1 schema, migrations, or any `src/routes/*.ts`
file.

## Toolchain setup

1. `npx create-next-app@latest` (or manual init) — App Router, TypeScript,
   Tailwind, `src/` directory **not** used for the Next.js app code (to
   avoid colliding with the existing `src/` which holds the Hono backend)
   — Next.js app code lives at the repo root in `app/`/`components/`/`lib/`
2. `npx shadcn@latest init` — configure with our existing tokens as the
   generated CSS variables (see Design Tokens below), default
   `/components/ui` path (no reason to deviate — this is exactly what the
   spec's own guidance flags as important to keep, since it's shadcn's
   conventional, tooling-expected location)
3. `npm install cobe`
4. `npm install @opennextjs/cloudflare` — add its Next.js config wrapper
   and `wrangler.toml` adjustments (OpenNext needs its own build output
   directory and a `wrangler.toml` `main` pointing at the OpenNext worker
   entry; this will need its own `wrangler.toml` or a separate config
   scoped to the Next.js app — exact mechanism decided during
   implementation planning, since OpenNext's Cloudflare adapter has a
   specific expected project layout)

## Design tokens → Tailwind

Port every custom property from `public/css/style.css`'s `:root` block
into `app/globals.css` as CSS variables consumed by Tailwind's `@theme`
(Tailwind v4) or `tailwind.config.ts` `extend.colors` (v3), whichever
version `shadcn init` scaffolds:

| Current token | Value | Tailwind mapping |
|---|---|---|
| `--color-bg` | `#0f1720` | `background` |
| `--color-surface` | `#171f2b` | `card` |
| `--color-surface-hover` | `#1c2532` | `card-hover` (custom) |
| `--color-text` | `#e8ecf0` | `foreground` |
| `--color-text-muted` | `#8b95a3` | `muted-foreground` |
| `--color-border` | `#2a3441` | `border` |
| `--color-nav-bg` / `--color-nav-bg-deep` | `#12202e` / `#0a1219` | custom `nav` scale |
| `--color-accent` | `#14b892` | `primary` |
| `--color-accent-hover` | `#0f9878` | `primary` hover variant |
| `--color-link` | `#5eb3ff` | custom `link` |
| `--color-danger` | `#e2694a` | `destructive` |

`--font-display` (self-hosted Instrument Serif) and `--font-ui` (system
sans) are configured as Tailwind font families via `next/font/local`
pointing at the already-committed `public/fonts/*.woff2` files — reused
as-is, not re-sourced.

Shadow tokens (`--shadow-sm`, `--shadow-md`, `--shadow-accent`) become
Tailwind `boxShadow` theme extensions with the same rgba values already
tuned for the dark background.

## Backend integration detail

`app/api/[[...route]]/route.ts`:

```typescript
import { app } from "@/src/index";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request: Request) {
  const { env, ctx } = getCloudflareContext();
  return app.fetch(request, env, ctx);
}
export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
```

(Exact export shape confirmed during implementation against Hono's
current Next.js integration docs — the above is the documented pattern
as of this spec's writing.) `src/index.ts` already exports the Hono
instance as a named export (`export const app = new Hono<...>()`,
`src/index.ts:19`), so the catch-all route imports it directly — no
change to `src/index.ts` is needed. Note that `src/index.ts`'s own
`app.get("*", (c) => c.env.ASSETS.fetch(c.req.raw))` fallback (serving
the vanilla static site) is irrelevant when `app` is mounted at
`/api/*` inside Next.js, since Next.js's own router handles all
non-`/api` paths — no conflict between the two.

## Homepage + Globe

`app/page.tsx` reproduces `index.html`'s structure: nav, breadcrumb,
school-logo banner, intro strip, forum-index table (with category icons
and empty-state handling), sort toggle, thread list — as React
components calling the same `/api/categories` and `/api/posts`
endpoints via `lib/api.ts`, with identical data shapes (no backend
changes, so no shape changes).

New: a Globe section using `components/ui/globe.tsx`, placed as a
homepage panel (exact position decided visually during implementation —
likely below the intro strip, above or beside the forum index). Copy
replaces the demo's default text with HospoGrad framing (e.g., "Hospitality
careers span the globe"). Markers are illustrative global hospitality-hub
cities (Dubai, Singapore, London, NYC, Geneva, Hong Kong, Bangkok) — not
a factual claim about real alumni locations, since the app doesn't
collect that data.

## Testing

Existing 65 Vitest tests must continue passing unmodified (they test the
Hono app directly via `SELF.fetch`, independent of how it's mounted for
serving). No new backend tests needed since no backend code changes.
Manual verification: `next dev` (or OpenNext local preview) loads the
new homepage, matches the current site's data (same categories, same
posts) via the same API, Globe renders and is interactive
(pointer-drag rotation), nav/breadcrumb behave identically to the
current vanilla versions (logged-in vs logged-out states,
admin link visibility). Confirm the existing vanilla site at its current
routes is completely unaffected — both must be independently reachable
during this coexistence period.
