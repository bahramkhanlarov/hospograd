# HospoGrad

A community forum and directory for Swiss hospitality students and alumni — schools, careers, jobs and medical care in Switzerland, all verified against official sources.

## Stack

- **Frontend**: Next.js (App Router) + Tailwind CSS
- **Backend**: Cloudflare Workers (Hono) + D1 + R2, deployed via OpenNext
- **Auth/Security**: cookie sessions, Cloudflare Turnstile
- **Email**: Resend
- **CI**: GitHub Actions (typecheck + tests on push/PR)

## Local development

```bash
npm install
npm run dev:next     # Next.js app on http://localhost:3000
npm run dev          # API worker (wrangler)
```

Secrets (`SESSION_SECRET`, `RESEND_API_KEY`) live in the gitignored `.dev.vars`.

## Checks

```bash
npx tsc --noEmit     # typecheck (what CI runs)
npm test             # vitest suite
npm run build:next   # Next.js production build
```

## Deploy

```bash
npm run deploy:next  # content/app worker (hospograd-web)
npm run deploy       # API worker (hospograd-api)
```

## Content conventions

- Directory data lives in typed `lib/*.ts` files (`Record<string, Info>`).
- Facts are verified against official websites; unverifiable details use "Contact the clinic/school directly".
- Detail pages follow the `/schools/[slug]` and `/clinics/[slug]` brochure pattern.
- A section-content-builder agent (`.opencode/agent/`) researches and fills in sections on request via `/build-section`.
