# Next.js Migration Sub-project 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a Next.js/TypeScript/Tailwind/shadcn app in the same repo, deployed to Cloudflare Workers via `@opennextjs/cloudflare`, coexisting with the current vanilla site, with the existing Hono API mounted unmodified and a new React homepage (including a Globe visual) built against it.

**Architecture:** Next.js App Router at the repo root (`app/`, `components/`, `lib/`), separate `tsconfig.json` (Next) vs `tsconfig.worker.json` (existing Hono backend, unchanged in content, just renamed), Hono `app` mounted at `/api/*` via a catch-all route handler, Tailwind v4 CSS-based theme reusing the dark-theme tokens already in `public/css/style.css`.

**Tech Stack:** Next.js 16.x, React 19.x, TypeScript, Tailwind CSS v4, shadcn (Radix base), `cobe`, `@opennextjs/cloudflare`. Existing: Hono 4.x, Cloudflare Workers, D1, R2, Vitest.

## Global Constraints

- Zero changes to `src/routes/*.ts`, `src/lib/*.ts`, `src/middleware/*.ts` — the Hono app's business logic is reused verbatim.
- The 65 existing Vitest tests must keep passing unmodified throughout.
- The existing vanilla site (`public/*.html`, `public/js/*.js`, current `wrangler.toml` deploy) must remain fully functional and independently deployable — this sub-project adds the Next.js app alongside it, it does not remove or break anything existing.
- No fake data: the Globe's markers are illustrative hospitality-hub cities, and any copy near them must not claim to represent actual current alumni locations (the app doesn't collect that data).
- Design tokens (colors, shadows, fonts) are ported from `public/css/style.css` verbatim — no improvised values.

---

### Task 1: Scaffold Next.js app and reconcile TypeScript config with the existing Workers backend

**Files:**
- Create: `app/layout.tsx`, `app/page.tsx` (initial placeholder), `app/globals.css`, `next.config.ts`, `postcss.config.mjs`, `next-env.d.ts`, `.gitignore` additions for `.next/`
- Create: `tsconfig.worker.json` (existing `tsconfig.json` content, renamed)
- Modify: `tsconfig.json` (replaced with Next.js's generated config, scoped to exclude `src`/`test`)
- Modify: `package.json` (merge dependencies/scripts)

**Interfaces:**
- Produces: `next dev` runs the Next.js app on its own port; `wrangler dev` continues to run the existing vanilla site + API unaffected. Both read from the same `package.json`/`node_modules`.

- [ ] **Step 1: Move the existing tsconfig.json content to tsconfig.worker.json**

Copy the current `tsconfig.json` verbatim to a new file `tsconfig.worker.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "types": ["@cloudflare/workers-types", "@cloudflare/vitest-pool-workers"],
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "esModuleInterop": true
  },
  "include": ["src", "test"]
}
```

This file is not read automatically by `wrangler`/`vitest` (neither tool requires a tsconfig for building — they use esbuild), but it preserves the settings for editor type-checking and any future explicit `tsc -p tsconfig.worker.json --noEmit` check. Do not delete the original `tsconfig.json` yet — it gets overwritten in Step 3.

- [ ] **Step 2: Run create-next-app to scaffold into a temp directory, then copy generated files in**

Because `create-next-app` refuses to run in a non-empty directory, scaffold into a temp location and copy the relevant output in:

```bash
rm -rf /tmp/hospograd-next-scaffold
npx --yes create-next-app@latest /tmp/hospograd-next-scaffold \
  --typescript --tailwind --app --no-eslint \
  --import-alias "@/*" --use-npm --yes
```

Then copy these generated files/directories into the repo root (overwriting nothing that already exists in `src`/`public`/`test`/etc. — these are new top-level files/directories that don't currently exist in the repo):

```bash
cp -r /tmp/hospograd-next-scaffold/app ./app
cp /tmp/hospograd-next-scaffold/next.config.ts ./next.config.ts
cp /tmp/hospograd-next-scaffold/postcss.config.mjs ./postcss.config.mjs
cp /tmp/hospograd-next-scaffold/next-env.d.ts ./next-env.d.ts
```

Do NOT copy `/tmp/hospograd-next-scaffold/tsconfig.json` or `package.json` directly — those are handled in Steps 3–4. Do NOT copy `/tmp/hospograd-next-scaffold/public` — it would collide with the existing `public/` directory (the vanilla site's assets); Next.js's own static files aren't needed for this sub-project (no favicon/svg placeholders required).

- [ ] **Step 3: Write the new root tsconfig.json, scoped to exclude the Workers backend**

Replace `tsconfig.json` with:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": [
    "next-env.d.ts",
    "app/**/*.ts",
    "app/**/*.tsx",
    "components/**/*.ts",
    "components/**/*.tsx",
    "lib/**/*.ts",
    "lib/**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules", "src", "test", "migrations"]
}
```

The `exclude` of `src`/`test` is what prevents this Next.js-oriented tsconfig from trying to type-check the Workers backend (which uses different `lib`/`types`/`module` settings, incompatible with this config).

- [ ] **Step 4: Merge package.json dependencies and scripts**

Add to `dependencies`: `next`, `react`, `react-dom` (versions from the scaffold's generated `package.json` — read `/tmp/hospograd-next-scaffold/package.json` for exact pinned versions before editing, since Next.js releases frequently and the plan was written against a point-in-time scaffold).

Add to `devDependencies`: `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom`, `tailwindcss` (same approach — copy exact versions from the scaffold output). Note: `typescript` is already a devDependency in the existing `package.json` — do not duplicate, just confirm the version satisfies both toolchains (it will, TypeScript itself doesn't differ between the two tsconfigs).

Update `scripts` — keep every existing script unchanged (`dev`, `test`, `deploy`, `db:migrate:local`, `db:migrate:remote`) and add:

```json
"dev:next": "next dev",
"build:next": "next build"
```

- [ ] **Step 5: Verify both toolchains run independently**

Run: `npm install`

Run: `npx vitest run` — expect all 65 tests still passing (confirms the Workers backend is untouched).

Run: `npm run dev:next` in the background, confirm `http://localhost:3000` serves the default Next.js placeholder page without errors, then stop it.

Run: `npm run dev &` (wrangler dev), confirm the existing vanilla site at its usual local port still serves `/index.html` correctly, then stop it.

- [ ] **Step 6: Commit**

```bash
git add app/ next.config.ts postcss.config.mjs next-env.d.ts tsconfig.json tsconfig.worker.json package.json package-lock.json .gitignore
git commit -m "feat: scaffold Next.js app alongside existing Hono backend"
```

---

### Task 2: Initialize shadcn and port the dark-theme design tokens into Tailwind

**Files:**
- Create: `components.json` (shadcn config)
- Create: `lib/utils.ts` (shadcn's `cn()` helper)
- Modify: `app/globals.css` (design tokens)

**Interfaces:**
- Consumes: nothing from Task 1 beyond the scaffolded `app/` directory existing
- Produces: `cn()` utility at `lib/utils.ts`, importable as `@/lib/utils` — used by every subsequent shadcn/custom component

- [ ] **Step 1: Run shadcn init non-interactively**

```bash
npx --yes shadcn@latest init -b radix -p nova -y
```

(`-b radix` selects the Radix UI primitive base — the most mature, widely-documented option, appropriate for a production app. `-p nova` picks a starting preset; its default icon/font/color choices are irrelevant since Step 2 overrides every color token with our own values.)

This generates `components.json`, `lib/utils.ts`, and adds its own token scaffolding to `app/globals.css` — inspect the actual output before Step 2, since exact generated content depends on the shadcn version at implementation time.

- [ ] **Step 2: Replace the generated color tokens in app/globals.css with HospoGrad's dark-theme tokens**

Locate the `:root` (or `@theme`) block shadcn generated and replace its color values with (verbatim from `public/css/style.css`'s current dark-theme tokens):

```css
:root {
  --background: #0f1720;
  --card: #171f2b;
  --card-hover: #1c2532;
  --foreground: #e8ecf0;
  --muted-foreground: #8b95a3;
  --border: #2a3441;
  --nav-bg: #12202e;
  --nav-bg-deep: #0a1219;
  --primary: #14b892;
  --primary-hover: #0f9878;
  --link: #5eb3ff;
  --destructive: #e2694a;
}
```

Map these into the `@theme inline { ... }` block (Tailwind v4's CSS-based theme config) shadcn generated, following the same `--color-<name>: var(--<name>)` pattern already present for its own defaults — inspect the actual generated block structure at implementation time and follow its existing convention rather than guessing the exact syntax, since this depends on the shadcn/Tailwind versions scaffolded in Task 1/this task's Step 1.

Add shadow values as Tailwind arbitrary values or a `--shadow-*` theme extension, ported from `public/css/style.css`:
`--shadow-sm: 0 1px 2px rgba(0,0,0,0.35), 0 1px 1px rgba(0,0,0,0.25);`
`--shadow-md: 0 10px 24px -10px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.3);`

- [ ] **Step 3: Verify**

Run: `npm run dev:next` in the background, load `http://localhost:3000`, confirm the page background is now the dark navy (`#0f1720`) instead of shadcn's default, confirm no console errors. Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add components.json lib/utils.ts app/globals.css package.json package-lock.json
git commit -m "feat: initialize shadcn and port dark-theme design tokens to Tailwind"
```

---

### Task 3: Self-host Instrument Serif via next/font/local

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: a `--font-display` CSS variable available to every component, matching the existing `public/fonts/*.woff2` files already committed to the repo

- [ ] **Step 1: Replace the scaffold's Geist font setup with Instrument Serif via next/font/local**

Replace `app/layout.tsx`'s font-loading code (the `Geist`/`Geist_Mono` imports and usage from `next/font/google`) with:

```typescript
import localFont from "next/font/local";

const instrumentSerif = localFont({
  src: [
    { path: "../public/fonts/InstrumentSerif-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/InstrumentSerif-Italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-display",
});
```

Apply `instrumentSerif.variable` on the `<html>` element's `className`, alongside `antialiased` (keep whatever base classes the scaffold already applied, per Task 1's output — just add the font variable to that existing class list rather than replacing it).

Add a `--font-ui` system-sans stack directly in `app/globals.css` (no font-loading needed, it's already available):

```css
:root {
  --font-ui: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
}
```

- [ ] **Step 2: Verify and commit**

Run: `npm run dev:next` in the background, confirm no 404s for the font files in network tab / no console errors, stop the server.

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: self-host Instrument Serif display font via next/font/local"
```

---

### Task 4: Add the Globe component

**Files:**
- Create: `components/ui/globe.tsx`
- Modify: `package.json` (add `cobe` dependency)

**Interfaces:**
- Produces: `Globe` component at `@/components/ui/globe`, accepting `className` and optional `config: COBEOptions` props — consumed by Task 6 (homepage)

- [ ] **Step 1: Install cobe**

```bash
npm install cobe
```

- [ ] **Step 2: Create components/ui/globe.tsx**

Use the standard shadcn-ecosystem Globe component implementation (a `"use client"` component wrapping the `cobe` library via `createGlobe`, with a canvas ref, pointer-drag rotation state, and a `COBEOptions`-typed `config` prop with sensible defaults). Implement per `cobe`'s documented API (`createGlobe(canvas, options)` returning an object with a `.destroy()` method), following the component's standard shape: a `GLOBE_CONFIG` default export object, a `Globe({ className, config })` function component managing rotation via `useRef`/`useState`/`useCallback`, pointer/touch event handlers for drag-to-rotate, and a `useEffect` that creates the globe on mount and calls `.destroy()` on unmount. Reference `cobe`'s README/type definitions (installed in Step 1) for the exact `COBEOptions` shape and `createGlobe` signature at implementation time.

- [ ] **Step 3: Verify**

Run: `node --check` is not applicable (TypeScript/JSX) — instead run `npx tsc --noEmit -p tsconfig.json` and confirm no type errors in `components/ui/globe.tsx`.

- [ ] **Step 4: Commit**

```bash
git add components/ui/globe.tsx package.json package-lock.json
git commit -m "feat: add Globe component (cobe-based)"
```

---

### Task 5: Mount the existing Hono API inside Next.js

**Files:**
- Create: `app/api/[[...route]]/route.ts`
- Modify: `package.json` (add `@opennextjs/cloudflare`)

**Interfaces:**
- Consumes: `app` named export from `src/index.ts` (already exists, no changes needed there)
- Produces: every existing API route (`/api/auth/*`, `/api/categories`, `/api/posts`, etc.) reachable through the Next.js dev/prod server, identical behavior to the current Worker

- [ ] **Step 1: Install the OpenNext Cloudflare adapter**

```bash
npm install @opennextjs/cloudflare
```

- [ ] **Step 2: Create the catch-all API route**

```typescript
import { app } from "@/src/index";
import { getCloudflareContext } from "@opennextjs/cloudflare";

async function handler(request: Request) {
  const { env, ctx } = getCloudflareContext();
  return app.fetch(request, env, ctx);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
```

Verify `getCloudflareContext`'s exact import path and signature against `@opennextjs/cloudflare`'s installed version's type definitions before finalizing — the adapter's API has evolved across versions, so confirm this matches what Step 1 actually installed rather than assuming the signature above is exact.

- [ ] **Step 3: Verify**

This can only be fully verified once the OpenNext build/preview pipeline works end-to-end (Cloudflare bindings aren't available under plain `next dev`, only under `opennextjs-cloudflare` preview). For now, confirm: `npx tsc --noEmit -p tsconfig.json` passes with no type errors on the new route file, and the import `import { app } from "@/src/index"` resolves correctly (no "cannot find module" error) — this confirms the path alias and export are wired correctly even before a full OpenNext preview run, which the next task sets up.

- [ ] **Step 4: Commit**

```bash
git add app/api package.json package-lock.json
git commit -m "feat: mount existing Hono API inside Next.js via catch-all route"
```

---

### Task 6: Configure OpenNext build/deploy and verify end-to-end against real Cloudflare bindings

**Files:**
- Create: `open-next.config.ts` (or the filename `@opennextjs/cloudflare` expects — confirm via its scaffolding/docs at implementation time)
- Modify: `wrangler.toml` or create a Next.js-specific wrangler config (exact mechanism TBD by OpenNext's current documented setup — this is the one area of this plan most likely to need adjustment against the adapter's real current setup instructions, since Cloudflare's Next.js tooling has changed shape multiple times)
- Modify: `package.json` (add `deploy:next`/`preview:next` scripts)

**Interfaces:**
- Produces: a working local preview command that runs the Next.js app with real D1/R2 bindings (not `next dev`, which can't access Cloudflare bindings), and a deploy command that ships it as a **separate, non-production** Cloudflare Workers deployment (a different Worker name, so it doesn't touch or replace the existing live `hospograd-api` deployment — cutover to production is explicitly out of scope, deferred to sub-project 5)

- [ ] **Step 1: Follow @opennextjs/cloudflare's current setup instructions**

Run whatever init/scaffolding command the installed `@opennextjs/cloudflare` version provides (check its README/`npx opennextjs-cloudflare --help` — this adapter has historically included a config-generation step). Configure it to bind to the same D1 database (`hospograd`, same `database_id` already in the existing `wrangler.toml`) and R2 bucket (`hospograd-uploads`), but under a **different Worker name** (e.g. `hospograd-web`) so this is a separate deployment from the existing `hospograd-api` Worker serving the vanilla site — both can be deployed independently without conflict.

- [ ] **Step 2: Add npm scripts**

```json
"preview:next": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
"deploy:next": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
```

(Exact CLI command names confirmed against the installed adapter version's actual bin/help output at implementation time.)

- [ ] **Step 3: Verify end-to-end**

Run: `npm run preview:next`, confirm the Next.js placeholder homepage loads via this preview command (which runs against real Workers runtime + bindings, unlike `next dev`), confirm `GET /api/categories` (through the Task 5 catch-all route) returns the same JSON the existing vanilla site's `/api/categories` returns — this is the critical proof that the Hono mount from Task 5 actually works against real bindings, not just type-checks.

Run: `npx vitest run` again — confirm still 65/65 passing (nothing in this task touches backend code).

- [ ] **Step 4: Commit**

```bash
git add open-next.config.ts wrangler.toml package.json package-lock.json
git commit -m "feat: configure OpenNext Cloudflare build/deploy as a separate Worker"
```

---

### Task 7: Shared layout components (nav, breadcrumb) and API client

**Files:**
- Create: `lib/api.ts`
- Create: `components/layout/nav.tsx`
- Create: `components/layout/breadcrumb.tsx`

**Interfaces:**
- Produces: `apiGet<T>(path: string): Promise<T>`, `apiPost<T>(path: string, body?: unknown): Promise<T>` in `lib/api.ts` — consumed by Task 8's homepage and every later sub-project's pages. `<Nav />` and `<Breadcrumb items={...} />` components — consumed by Task 8 and every later page.

- [ ] **Step 1: Write lib/api.ts**

Port `public/js/api.js`'s `apiRequest`/`apiGet`/`apiPost` logic to TypeScript, same `credentials: "same-origin"` behavior, same error-throwing-on-non-ok-response behavior (throw an `Error` with the API's `error` field as the message, matching the existing `err.status`/`err.data` attachment pattern from `api.js`). No `escapeHtml()` port needed — JSX escapes text content by default, eliminating that entire concern.

- [ ] **Step 2: Write components/layout/nav.tsx**

Port `layout.js`'s `initNav()` to a client component: fetch `/api/auth/me` on mount via `lib/api.ts`, render the two-tier header (brand link, logged-in state with username/school/status/New-post/Admin-link/Log-out, or logged-out state with Log-in/Sign-up), same conditional logic as the existing `initNav()`.

- [ ] **Step 3: Write components/layout/breadcrumb.tsx**

Port `layout.js`'s `renderBreadcrumb(items)` to a component taking `items: { label: string; href?: string }[]` as a prop — no manual escaping needed (JSX handles it), which also resolves the earlier-identified `escapeAttr`/attribute-escaping concern from the vanilla version's `href` handling, since React's JSX `href={...}` prop assignment isn't raw HTML string concatenation.

- [ ] **Step 4: Verify and commit**

Run: `npx tsc --noEmit -p tsconfig.json` — no type errors.

```bash
git add lib/api.ts components/layout
git commit -m "feat: add shared API client, nav, and breadcrumb components"
```

---

### Task 8: Homepage rebuild with Globe

**Files:**
- Modify: `app/page.tsx`
- Create: `components/home/forum-index.tsx`, `components/home/thread-list.tsx`, `components/home/school-banner.tsx`, `components/home/globe-section.tsx`

**Interfaces:**
- Consumes: `apiGet` from `lib/api.ts`, `<Nav />`/`<Breadcrumb />` from Task 7, `<Globe />` from Task 4

- [ ] **Step 1: Port the forum-index table**

`components/home/forum-index.tsx` — client component fetching `/api/categories`, rendering the same category-icon-mapped table as `home.js`'s `renderForumIndex`, including the empty-state (`colspan={3}`, "No categories yet.") and the same 7-category icon map ported verbatim from `home.js`.

- [ ] **Step 2: Port the thread list**

`components/home/thread-list.tsx` — client component fetching `/api/posts?sort=<new|top>` (sort read from a URL search param via `useSearchParams`), rendering the same dense table as `home.js`'s `renderPostList`, including empty state (`colspan={4}`) and the New/Top sort toggle with active-state styling.

- [ ] **Step 3: Port the school-logo banner**

`components/home/school-banner.tsx` — same 9 logos (`next/image` with the already-known intrinsic `width`/`height` for each, ported from the current `index.html`), same disclaimer text, same light-chip styling ported from `public/css/style.css`'s `.school-banner-logos img` rule.

- [ ] **Step 4: Add the Globe section**

`components/home/globe-section.tsx` — renders `<Globe />` from Task 4 with the illustrative hospitality-hub-cities markers (Dubai, Singapore, London, NYC, Geneva, Hong Kong, Bangkok — approximate `[lat, lng]` pairs for each), and copy framing it as illustrative ("Hospitality careers span the globe" or similar — not a factual claim about actual alumni locations).

- [ ] **Step 5: Assemble app/page.tsx**

Compose `<Nav />`, `<Breadcrumb items={[{ label: "Home" }]} />`, `<SchoolBanner />`, the homepage intro paragraph, `<GlobeSection />`, `<ForumIndex />`, `<ThreadList />` in the same overall order as the current `index.html`, with the Globe section positioned per the spec (below the intro strip).

- [ ] **Step 6: Verify**

Run: `npm run preview:next` (from Task 6), load the homepage, confirm: categories render with real data matching the vanilla site's `/api/categories` response, posts render, sort toggle works, school banner shows all 9 logos correctly, Globe renders and responds to pointer drag, nav shows correct logged-in/out state. Confirm the existing vanilla site (`wrangler dev` or its live deployment) is completely unaffected — same data, unchanged behavior.

Run: `npx vitest run` — 65/65 still passing.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx components/home
git commit -m "feat: rebuild homepage in Next.js with Globe visual"
```

---

## Self-Review Notes

- **Spec coverage:** toolchain setup (Task 1), shadcn + design tokens (Task 2), font (Task 3), Globe component (Task 4), backend mount (Task 5), OpenNext deploy (Task 6), shared layout (Task 7), homepage (Task 8) — all spec sections covered.
- **Honest uncertainty flagged, not hidden:** several steps (shadcn's generated `@theme` block shape, OpenNext's exact config filename/CLI commands, `getCloudflareContext`'s precise signature) explicitly say "confirm against the installed version at implementation time" rather than presenting guessed syntax as fact — these are third-party tool surfaces that shift between versions, and the plan is honest about that rather than fabricating precision it can't have. This differs from a placeholder: the *what* and *why* are fully specified; only exact third-party API syntax is deferred to implementation-time verification.
- **No fake data:** Globe markers are explicitly illustrative, framed as such in copy, not claimed as real alumni data.
- **Coexistence verified at each stage:** every task's verification step includes confirming the existing vanilla site and its 65 tests are unaffected.
