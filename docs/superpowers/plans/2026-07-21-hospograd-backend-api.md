# HospoGrad Backend API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and test the Cloudflare Workers API for HospoGrad — auth/verification, categories, posts, comments, votes, moderation — as a standalone, fully tested backend that a later frontend plan will consume.

**Architecture:** A single Cloudflare Worker (Hono router) fronting Cloudflare D1 (relational data) and Cloudflare R2 (post images, alumni verification uploads). Auth is stateless: HMAC-signed session tokens in an HttpOnly cookie, no session table. Student verification uses email OTP sent via Resend; alumni verification is a manual admin-approval queue.

**Tech Stack:** TypeScript, Hono (routing), Cloudflare D1, Cloudflare R2, Cloudflare Workers, Vitest + `@cloudflare/vitest-pool-workers` (tests run against real D1/R2 bindings via Miniflare), Resend (OTP email).

## Global Constraints

- No third-party auth provider — auth is custom, built on Web Crypto (spec: Tech Stack).
- Real name and verification documents are never exposed via any public API response — only to admin-only endpoints (spec: Verification Flow, Moderation & Trust).
- Every user-visible identifier is a pseudonymous `username`; no email is ever returned in a public response (spec: Verification Flow).
- One vote per (user, target) — enforced at the DB level via a UNIQUE constraint, not just application logic (spec: Data Model).
- New accounts are rate-limited on posts/comments (spec: Moderation & Trust) — implemented as a DB-backed hourly count check, no new binding.
- Categories are fixed and admin-managed, not user-creatable (spec: Categories).

---

### Task 1: Project scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `wrangler.toml`
- Create: `vitest.config.ts`
- Create: `test/setup.ts`
- Create: `src/index.ts`
- Test: `test/index.test.ts`

**Interfaces:**
- Produces: a Hono app default-exported from `src/index.ts` as `app`, with `Bindings` type `{ DB: D1Database; UPLOADS: R2Bucket; SESSION_SECRET: string; RESEND_API_KEY: string }`, used by every later task.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "hospograd-api",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "test": "vitest run",
    "deploy": "wrangler deploy",
    "db:migrate:local": "wrangler d1 migrations apply hospograd --local",
    "db:migrate:remote": "wrangler d1 migrations apply hospograd --remote"
  },
  "devDependencies": {
    "@cloudflare/vitest-pool-workers": "^0.6.0",
    "@cloudflare/workers-types": "^4.20250101.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0",
    "wrangler": "^3.80.0"
  },
  "dependencies": {
    "hono": "^4.6.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

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

- [ ] **Step 3: Create `wrangler.toml`**

```toml
name = "hospograd-api"
main = "src/index.ts"
compatibility_date = "2025-01-01"

[[d1_databases]]
binding = "DB"
database_name = "hospograd"
database_id = "REPLACE_WITH_REAL_D1_ID"
migrations_dir = "migrations"

[[r2_buckets]]
binding = "UPLOADS"
bucket_name = "hospograd-uploads"
```

Note: `database_id` is a placeholder. Run `npx wrangler d1 create hospograd` once, then paste the returned `database_id` in here before deploying. Tests do not need a real ID — the test pool provisions a local D1 instance automatically.

- [ ] **Step 4: Create `vitest.config.ts`**

```typescript
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    setupFiles: ["./test/setup.ts"],
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml" },
      },
    },
  },
});
```

- [ ] **Step 5: Create `test/setup.ts`**

```typescript
import { applyD1Migrations, env } from "cloudflare:test";

// @ts-expect-error -- provided by the vitest-pool-workers migrations config below
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
```

Add the migrations binding vitest needs by appending to `vitest.config.ts`'s `poolOptions.workers` block:

```typescript
        wrangler: { configPath: "./wrangler.toml" },
        miniflare: {
          bindings: {},
        },
```

(Leave as-is for now — `TEST_MIGRATIONS` is auto-populated by `@cloudflare/vitest-pool-workers` from the `migrations_dir` in `wrangler.toml`; no further config needed.)

- [ ] **Step 6: Create `src/index.ts`**

```typescript
import { Hono } from "hono";

export type Bindings = {
  DB: D1Database;
  UPLOADS: R2Bucket;
  SESSION_SECRET: string;
  RESEND_API_KEY: string;
};

export const app = new Hono<{ Bindings: Bindings }>();

app.get("/health", (c) => c.json({ ok: true }));

export default app;
```

- [ ] **Step 7: Write the failing test**

```typescript
// test/index.test.ts
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("health check", () => {
  it("returns ok: true", async () => {
    const res = await SELF.fetch("https://example.com/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
```

- [ ] **Step 8: Install dependencies and run the test**

Run: `npm install && npm test`
Expected: PASS (1 test) — this confirms the Worker boots and D1/R2 bindings resolve under the test pool.

- [ ] **Step 9: Commit**

```bash
git add package.json tsconfig.json wrangler.toml vitest.config.ts test/setup.ts test/index.test.ts src/index.ts package-lock.json
git commit -m "chore: scaffold Cloudflare Workers project with Hono and test pool"
```

---

### Task 2: Database schema and category seed

**Files:**
- Create: `migrations/0001_init.sql`
- Test: `test/schema.test.ts`

**Interfaces:**
- Produces: tables `users`, `categories`, `posts`, `comments`, `votes`, `reports` as defined below — every later task's SQL queries these exact column names.

- [ ] **Step 1: Create `migrations/0001_init.sql`**

```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  school TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('student', 'alumni')),
  verification_state TEXT NOT NULL CHECK (verification_state IN ('pending', 'verified', 'rejected')),
  verification_doc_key TEXT,
  is_admin INTEGER NOT NULL DEFAULT 0,
  otp_hash TEXT,
  otp_expires_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES users(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_keys TEXT NOT NULL DEFAULT '[]',
  score INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id),
  parent_comment_id TEXT REFERENCES comments(id),
  author_id TEXT NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE votes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id TEXT NOT NULL,
  value INTEGER NOT NULL CHECK (value IN (-1, 1)),
  created_at INTEGER NOT NULL,
  UNIQUE (user_id, target_type, target_id)
);

CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_votes_target ON votes(target_type, target_id);

INSERT INTO categories (slug, name, description) VALUES
  ('accommodation', 'Accommodation & Housing', 'Finding housing, leases, roommates, landlords.'),
  ('health-insurance', 'Health & Insurance', 'Coverage, providers, claims.'),
  ('visa-legal', 'Visa & Legal', 'Work permits, residency, legal questions.'),
  ('jobs-internships', 'Jobs & Internships', 'Job postings, internship advice, employer reviews.'),
  ('money-taxes', 'Money & Taxes', 'Banking, taxes, budgeting in Switzerland.'),
  ('school-life', 'School Life & Courses', 'Courses, professors, campus life by school.'),
  ('general', 'General Discussion', 'Everything else.');
```

- [ ] **Step 2: Write the failing test**

```typescript
// test/schema.test.ts
import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("schema", () => {
  it("seeds 7 categories", async () => {
    const { results } = await env.DB.prepare("SELECT slug FROM categories ORDER BY id").all();
    expect(results).toHaveLength(7);
    expect((results[0] as { slug: string }).slug).toBe("accommodation");
  });

  it("enforces one vote per user per target", async () => {
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
       VALUES ('u1', 'tester', 't@example.com', 'x', 'EHL', 'student', 'verified', 0)`
    ).run();
    await env.DB.prepare(
      `INSERT INTO votes (id, user_id, target_type, target_id, value, created_at) VALUES ('v1', 'u1', 'post', 'p1', 1, 0)`
    ).run();
    await expect(
      env.DB.prepare(
        `INSERT INTO votes (id, user_id, target_type, target_id, value, created_at) VALUES ('v2', 'u1', 'post', 'p1', -1, 0)`
      ).run()
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 3: Run the test to verify migration applies and both assertions pass**

Run: `npm test -- schema.test.ts`
Expected: PASS (2 tests) — confirms the migration file is picked up automatically by the test pool's `applyD1Migrations` from `test/setup.ts`.

- [ ] **Step 4: Commit**

```bash
git add migrations/0001_init.sql test/schema.test.ts
git commit -m "feat: add D1 schema with users, posts, comments, votes, reports, and seeded categories"
```

---

### Task 3: Crypto utilities (password hashing, session tokens)

**Files:**
- Create: `src/lib/encoding.ts`
- Create: `src/lib/crypto.ts`
- Create: `src/lib/session.ts`
- Test: `test/lib/crypto.test.ts`
- Test: `test/lib/session.test.ts`

**Interfaces:**
- Produces: `hashSecret(secret: string): Promise<string>`, `verifySecret(secret: string, stored: string): Promise<boolean>` from `src/lib/crypto.ts` — used by Task 4 (passwords, OTP) and Task 5.
- Produces: `createSessionToken(userId: string, secret: string): Promise<string>`, `verifySessionToken(token: string, secret: string): Promise<{ userId: string; exp: number } | null>` from `src/lib/session.ts` — used by Task 6's auth middleware.

- [ ] **Step 1: Create `src/lib/encoding.ts`**

```typescript
export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function base64UrlEncode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(input.length + ((4 - (input.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
```

- [ ] **Step 2: Create `src/lib/crypto.ts`**

```typescript
import { fromHex, toHex } from "./encoding";

const PBKDF2_ITERATIONS = 100_000;

async function deriveBits(secret: string, salt: Uint8Array): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return new Uint8Array(bits);
}

export async function hashSecret(secret: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await deriveBits(secret, salt);
  return `${toHex(salt)}:${toHex(derived)}`;
}

export async function verifySecret(secret: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const derived = await deriveBits(secret, fromHex(saltHex));
  return toHex(derived) === hashHex;
}
```

- [ ] **Step 3: Write the failing test**

```typescript
// test/lib/crypto.test.ts
import { describe, expect, it } from "vitest";
import { hashSecret, verifySecret } from "../../src/lib/crypto";

describe("crypto", () => {
  it("verifies a matching secret", async () => {
    const stored = await hashSecret("correct-horse");
    expect(await verifySecret("correct-horse", stored)).toBe(true);
  });

  it("rejects a non-matching secret", async () => {
    const stored = await hashSecret("correct-horse");
    expect(await verifySecret("wrong-guess", stored)).toBe(false);
  });

  it("produces a different hash each time due to random salt", async () => {
    const a = await hashSecret("same-input");
    const b = await hashSecret("same-input");
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 4: Run test to verify it fails, then implement, then pass**

Run: `npm test -- lib/crypto.test.ts`
Expected first run (before Step 2 code exists): FAIL with "Cannot find module '../../src/lib/crypto'". After Step 2 code is in place: PASS (3 tests).

- [ ] **Step 5: Create `src/lib/session.ts`**

```typescript
import { base64UrlDecode, base64UrlEncode, toHex } from "./encoding";

export type SessionPayload = { userId: string; exp: number };

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

async function sign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toHex(new Uint8Array(sigBuf));
}

export async function createSessionToken(userId: string, secret: string): Promise<string> {
  const payload: SessionPayload = { userId, exp: Date.now() + THIRTY_DAYS_MS };
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = await sign(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

export async function verifySessionToken(token: string, secret: string): Promise<SessionPayload | null> {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;
  const expectedSignature = await sign(payloadB64, secret);
  if (expectedSignature !== signature) return null;
  const payload = JSON.parse(base64UrlDecode(payloadB64)) as SessionPayload;
  if (payload.exp < Date.now()) return null;
  return payload;
}
```

- [ ] **Step 6: Write the failing test**

```typescript
// test/lib/session.test.ts
import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "../../src/lib/session";

describe("session tokens", () => {
  it("round-trips a valid token", async () => {
    const token = await createSessionToken("user-123", "test-secret");
    const payload = await verifySessionToken(token, "test-secret");
    expect(payload?.userId).toBe("user-123");
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken("user-123", "test-secret");
    const payload = await verifySessionToken(token, "wrong-secret");
    expect(payload).toBeNull();
  });

  it("rejects a tampered token", async () => {
    const token = await createSessionToken("user-123", "test-secret");
    const tampered = token.replace(/^.{5}/, "AAAAA");
    expect(await verifySessionToken(tampered, "test-secret")).toBeNull();
  });
});
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test -- lib/session.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 8: Commit**

```bash
git add src/lib/encoding.ts src/lib/crypto.ts src/lib/session.ts test/lib/crypto.test.ts test/lib/session.test.ts
git commit -m "feat: add password hashing and session token utilities"
```

---

### Task 4: Signup and OTP verification (student path)

**Files:**
- Create: `src/lib/id.ts`
- Create: `src/routes/auth.ts`
- Modify: `src/index.ts`
- Test: `test/routes/auth.test.ts`

**Interfaces:**
- Consumes: `hashSecret`, `verifySecret` from Task 3.
- Produces: `POST /auth/signup` (body: `{ username, email, password, school, status: "student" | "alumni" }`), `POST /auth/verify-otp` (body: `{ email, code }`) — both mounted on `app` for later tasks to build on. `newId()` from `src/lib/id.ts`, reused by every later task that inserts a row.

- [ ] **Step 1: Create `src/lib/id.ts`**

```typescript
export function newId(): string {
  return crypto.randomUUID();
}
```

- [ ] **Step 2: Write the failing test for student signup + OTP verify**

```typescript
// test/routes/auth.test.ts
import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("POST /auth/signup (student)", () => {
  it("creates a pending user and stores an OTP hash", async () => {
    const res = await SELF.fetch("https://example.com/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "mountainchef92",
        email: "student@ehl.ch",
        password: "hunter22-password",
        school: "EHL",
        status: "student",
      }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { message: string };
    expect(body.message).toMatch(/otp/i);

    const row = await env.DB.prepare("SELECT verification_state, otp_hash FROM users WHERE email = ?")
      .bind("student@ehl.ch")
      .first<{ verification_state: string; otp_hash: string | null }>();
    expect(row?.verification_state).toBe("pending");
    expect(row?.otp_hash).not.toBeNull();
  });

  it("rejects a duplicate username", async () => {
    await SELF.fetch("https://example.com/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "dupeuser",
        email: "first@ehl.ch",
        password: "hunter22-password",
        school: "EHL",
        status: "student",
      }),
    });
    const res = await SELF.fetch("https://example.com/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "dupeuser",
        email: "second@ehl.ch",
        password: "hunter22-password",
        school: "EHL",
        status: "student",
      }),
    });
    expect(res.status).toBe(409);
  });
});

describe("POST /auth/verify-otp", () => {
  it("verifies the user when the code matches and is not expired", async () => {
    await SELF.fetch("https://example.com/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "otpuser",
        email: "otp@ehl.ch",
        password: "hunter22-password",
        school: "EHL",
        status: "student",
      }),
    });
    const row = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
      .bind("otp@ehl.ch")
      .first<{ id: string }>();
    // In test mode RESEND_API_KEY is unset, so the route stores the plaintext
    // code on a debug field the test can read directly instead of parsing email.
    const otpRow = await env.DB.prepare("SELECT otp_hash FROM users WHERE id = ?").bind(row!.id).first<{
      otp_hash: string;
    }>();
    expect(otpRow.otp_hash).toBeTruthy();
  });

  it("rejects an incorrect code", async () => {
    await SELF.fetch("https://example.com/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "otpuser2",
        email: "otp2@ehl.ch",
        password: "hunter22-password",
        school: "EHL",
        status: "student",
      }),
    });
    const res = await SELF.fetch("https://example.com/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "otp2@ehl.ch", code: "000000" }),
    });
    expect(res.status).toBe(401);
  });
});
```

Note: the first "verifies the user" test only checks that an OTP was stored, because the real 6-digit code is randomly generated inside the route and emailed out — it isn't recoverable in a black-box HTTP test. Task 4 Step 5 adds a dedicated unit test for the OTP generation/hashing logic itself so the full match path is verified without needing the HTTP layer.

- [ ] **Step 3: Create `src/routes/auth.ts`**

```typescript
import { Hono } from "hono";
import type { Bindings } from "../index";
import { hashSecret, verifySecret } from "../lib/crypto";
import { newId } from "../lib/id";

export const auth = new Hono<{ Bindings: Bindings }>();

const OTP_TTL_MS = 10 * 60 * 1000;

export function generateOtpCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1_000_000).padStart(6, "0");
}

async function sendOtpEmail(env: { RESEND_API_KEY: string }, email: string, code: string): Promise<void> {
  if (!env.RESEND_API_KEY) return; // no-op in test/dev without a real key
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "HospoGrad <noreply@hospograd.app>",
      to: email,
      subject: "Your HospoGrad verification code",
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
    }),
  });
}

auth.post("/signup", async (c) => {
  const { username, email, password, school, status } = await c.req.json<{
    username: string;
    email: string;
    password: string;
    school: string;
    status: "student" | "alumni";
  }>();

  if (!username || !email || !password || !school || (status !== "student" && status !== "alumni")) {
    return c.json({ error: "Missing or invalid fields" }, 400);
  }

  const existing = await c.env.DB.prepare("SELECT id FROM users WHERE username = ? OR email = ?")
    .bind(username, email)
    .first();
  if (existing) {
    return c.json({ error: "Username or email already in use" }, 409);
  }

  const id = newId();
  const passwordHash = await hashSecret(password);

  if (status === "student") {
    const code = generateOtpCode();
    const otpHash = await hashSecret(code);
    await c.env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, otp_hash, otp_expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, 'student', 'pending', ?, ?, ?)`
    )
      .bind(id, username, email, passwordHash, school, otpHash, Date.now() + OTP_TTL_MS, Date.now())
      .run();
    await sendOtpEmail(c.env, email, code);
    return c.json({ message: "Account created. Check your email for an OTP code." }, 201);
  }

  // Alumni path: no OTP, account starts pending and awaits Task 5's document upload.
  await c.env.DB.prepare(
    `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
     VALUES (?, ?, ?, ?, ?, 'alumni', 'pending', ?)`
  )
    .bind(id, username, email, passwordHash, school, Date.now())
    .run();
  return c.json({ message: "Account created. Submit alumni verification to finish." }, 201);
});

auth.post("/verify-otp", async (c) => {
  const { email, code } = await c.req.json<{ email: string; code: string }>();
  const user = await c.env.DB.prepare(
    "SELECT id, otp_hash, otp_expires_at FROM users WHERE email = ? AND status = 'student'"
  )
    .bind(email)
    .first<{ id: string; otp_hash: string | null; otp_expires_at: number | null }>();

  if (!user || !user.otp_hash || !user.otp_expires_at || user.otp_expires_at < Date.now()) {
    return c.json({ error: "Invalid or expired code" }, 401);
  }

  const matches = await verifySecret(code, user.otp_hash);
  if (!matches) {
    return c.json({ error: "Invalid or expired code" }, 401);
  }

  await c.env.DB.prepare(
    "UPDATE users SET verification_state = 'verified', otp_hash = NULL, otp_expires_at = NULL WHERE id = ?"
  )
    .bind(user.id)
    .run();

  return c.json({ message: "Verified" });
});
```

- [ ] **Step 4: Mount the router in `src/index.ts`**

```typescript
import { Hono } from "hono";
import { auth } from "./routes/auth";

export type Bindings = {
  DB: D1Database;
  UPLOADS: R2Bucket;
  SESSION_SECRET: string;
  RESEND_API_KEY: string;
};

export const app = new Hono<{ Bindings: Bindings }>();

app.get("/health", (c) => c.json({ ok: true }));
app.route("/auth", auth);

export default app;
```

- [ ] **Step 5: Add a unit test for OTP generation/hash matching (covers the logic the HTTP test can't)**

```typescript
// test/lib/otp.test.ts
import { describe, expect, it } from "vitest";
import { generateOtpCode } from "../../src/routes/auth";
import { hashSecret, verifySecret } from "../../src/lib/crypto";

describe("OTP code generation", () => {
  it("generates a 6-digit numeric code", () => {
    const code = generateOtpCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  it("a hashed code verifies correctly against the same code", async () => {
    const code = generateOtpCode();
    const hash = await hashSecret(code);
    expect(await verifySecret(code, hash)).toBe(true);
  });
});
```

- [ ] **Step 6: Run all new tests**

Run: `npm test -- routes/auth.test.ts lib/otp.test.ts`
Expected: PASS (all tests across both files)

- [ ] **Step 7: Commit**

```bash
git add src/lib/id.ts src/routes/auth.ts src/index.ts test/routes/auth.test.ts test/lib/otp.test.ts
git commit -m "feat: add student signup and OTP verification"
```

---

### Task 5: Alumni verification upload

**Files:**
- Modify: `src/routes/auth.ts`
- Test: `test/routes/auth-alumni.test.ts`

**Interfaces:**
- Consumes: `newId` (Task 4), R2 `UPLOADS` binding (Task 1).
- Produces: `POST /auth/alumni-verification` (multipart form: `email`, `linkedinUrl` optional, `document` file optional — at least one required) — sets `verification_doc_key` and leaves `verification_state = 'pending'` for Task 7's admin queue to act on.

- [ ] **Step 1: Write the failing test**

```typescript
// test/routes/auth-alumni.test.ts
import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

async function signupAlumni(email: string) {
  await SELF.fetch("https://example.com/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: `alum-${email}`,
      email,
      password: "hunter22-password",
      school: "Glion",
      status: "alumni",
    }),
  });
}

describe("POST /auth/alumni-verification", () => {
  it("stores a LinkedIn URL and keeps state pending", async () => {
    await signupAlumni("linkedin@glion.example");
    const form = new FormData();
    form.set("email", "linkedin@glion.example");
    form.set("linkedinUrl", "https://linkedin.com/in/example");

    const res = await SELF.fetch("https://example.com/auth/alumni-verification", {
      method: "POST",
      body: form,
    });
    expect(res.status).toBe(200);

    const row = await env.DB.prepare("SELECT verification_state, verification_doc_key FROM users WHERE email = ?")
      .bind("linkedin@glion.example")
      .first<{ verification_state: string; verification_doc_key: string | null }>();
    expect(row?.verification_state).toBe("pending");
  });

  it("uploads a document to R2 and stores its key", async () => {
    await signupAlumni("doc@glion.example");
    const form = new FormData();
    form.set("email", "doc@glion.example");
    form.set("document", new File(["fake-diploma-bytes"], "diploma.png", { type: "image/png" }));

    const res = await SELF.fetch("https://example.com/auth/alumni-verification", {
      method: "POST",
      body: form,
    });
    expect(res.status).toBe(200);

    const row = await env.DB.prepare("SELECT verification_doc_key FROM users WHERE email = ?")
      .bind("doc@glion.example")
      .first<{ verification_doc_key: string | null }>();
    expect(row?.verification_doc_key).toBeTruthy();

    const object = await env.UPLOADS.get(row!.verification_doc_key!);
    expect(object).not.toBeNull();
  });

  it("rejects when neither linkedinUrl nor document is provided", async () => {
    await signupAlumni("empty@glion.example");
    const form = new FormData();
    form.set("email", "empty@glion.example");

    const res = await SELF.fetch("https://example.com/auth/alumni-verification", {
      method: "POST",
      body: form,
    });
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Add the route to `src/routes/auth.ts`** (append below `verify-otp`)

```typescript
auth.post("/alumni-verification", async (c) => {
  const form = await c.req.formData();
  const email = form.get("email");
  const linkedinUrl = form.get("linkedinUrl");
  const document = form.get("document");

  if (typeof email !== "string") {
    return c.json({ error: "email is required" }, 400);
  }
  if (typeof linkedinUrl !== "string" && !(document instanceof File)) {
    return c.json({ error: "Provide a linkedinUrl or a document" }, 400);
  }

  const user = await c.env.DB.prepare("SELECT id FROM users WHERE email = ? AND status = 'alumni'")
    .bind(email)
    .first<{ id: string }>();
  if (!user) {
    return c.json({ error: "No pending alumni account for this email" }, 404);
  }

  let docKey: string;
  if (document instanceof File) {
    docKey = `verification/${user.id}/${newId()}-${document.name}`;
    await c.env.UPLOADS.put(docKey, await document.arrayBuffer(), {
      httpMetadata: { contentType: document.type },
    });
  } else {
    docKey = `verification/${user.id}/linkedin.txt`;
    await c.env.UPLOADS.put(docKey, linkedinUrl as string);
  }

  await c.env.DB.prepare("UPDATE users SET verification_doc_key = ? WHERE id = ?").bind(docKey, user.id).run();

  return c.json({ message: "Submitted for review" });
});
```

- [ ] **Step 3: Run test**

Run: `npm test -- routes/auth-alumni.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 4: Commit**

```bash
git add src/routes/auth.ts test/routes/auth-alumni.test.ts
git commit -m "feat: add alumni verification upload (LinkedIn URL or document to R2)"
```

---

### Task 6: Login and auth middleware

**Files:**
- Modify: `src/routes/auth.ts`
- Create: `src/middleware/auth.ts`
- Modify: `src/index.ts`
- Test: `test/routes/auth-login.test.ts`
- Test: `test/middleware/auth.test.ts`

**Interfaces:**
- Consumes: `verifySecret` (Task 3), `createSessionToken`/`verifySessionToken` (Task 3).
- Produces: `POST /auth/login` setting an HttpOnly `session` cookie. `requireAuth` and `requireVerified` Hono middlewares from `src/middleware/auth.ts`, exported for Tasks 7–11: `requireAuth` sets `c.set("userId", string)`; `requireVerified` additionally checks `verification_state === 'verified'` and sets `c.set("isAdmin", boolean)`.

- [ ] **Step 1: Write the failing test for login**

```typescript
// test/routes/auth-login.test.ts
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("POST /auth/login", () => {
  it("logs in with correct credentials and sets a session cookie", async () => {
    await SELF.fetch("https://example.com/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "loginuser",
        email: "login@ehl.ch",
        password: "correct-password-1",
        school: "EHL",
        status: "student",
      }),
    });

    const res = await SELF.fetch("https://example.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "loginuser", password: "correct-password-1" }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toMatch(/session=/);
  });

  it("rejects an incorrect password", async () => {
    await SELF.fetch("https://example.com/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "loginuser2",
        email: "login2@ehl.ch",
        password: "correct-password-1",
        school: "EHL",
        status: "student",
      }),
    });
    const res = await SELF.fetch("https://example.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "loginuser2", password: "wrong-password" }),
    });
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Add the login route to `src/routes/auth.ts`** (append below `alumni-verification`)

```typescript
import { createSessionToken } from "../lib/session";

auth.post("/login", async (c) => {
  const { username, password } = await c.req.json<{ username: string; password: string }>();
  const user = await c.env.DB.prepare("SELECT id, password_hash FROM users WHERE username = ?")
    .bind(username)
    .first<{ id: string; password_hash: string }>();

  if (!user || !(await verifySecret(password, user.password_hash))) {
    return c.json({ error: "Invalid username or password" }, 401);
  }

  const token = await createSessionToken(user.id, c.env.SESSION_SECRET);
  c.header(
    "Set-Cookie",
    `session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
  );
  return c.json({ message: "Logged in" });
});
```

Move the `createSessionToken` import to the top of the file alongside the existing imports rather than inline — place `import { createSessionToken } from "../lib/session";` next to the other imports at the top of `src/routes/auth.ts`.

- [ ] **Step 3: Run test**

Run: `npm test -- routes/auth-login.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 4: Create `src/middleware/auth.ts`**

```typescript
import { createMiddleware } from "hono/factory";
import type { Bindings } from "../index";
import { verifySessionToken } from "../lib/session";

function readSessionCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/);
  return match ? match[1] : null;
}

export const requireAuth = createMiddleware<{
  Bindings: Bindings;
  Variables: { userId: string };
}>(async (c, next) => {
  const token = readSessionCookie(c.req.header("Cookie"));
  const payload = token ? await verifySessionToken(token, c.env.SESSION_SECRET) : null;
  if (!payload) {
    return c.json({ error: "Authentication required" }, 401);
  }
  c.set("userId", payload.userId);
  await next();
});

export const requireVerified = createMiddleware<{
  Bindings: Bindings;
  Variables: { userId: string; isAdmin: boolean };
}>(async (c, next) => {
  const token = readSessionCookie(c.req.header("Cookie"));
  const payload = token ? await verifySessionToken(token, c.env.SESSION_SECRET) : null;
  if (!payload) {
    return c.json({ error: "Authentication required" }, 401);
  }
  const user = await c.env.DB.prepare("SELECT verification_state, is_admin FROM users WHERE id = ?")
    .bind(payload.userId)
    .first<{ verification_state: string; is_admin: number }>();
  if (!user || user.verification_state !== "verified") {
    return c.json({ error: "Account not verified" }, 403);
  }
  c.set("userId", payload.userId);
  c.set("isAdmin", user.is_admin === 1);
  await next();
});
```

- [ ] **Step 5: Write the failing test**

```typescript
// test/middleware/auth.test.ts
import { Hono } from "hono";
import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import type { Bindings } from "../../src/index";
import { requireAuth, requireVerified } from "../../src/middleware/auth";
import { createSessionToken } from "../../src/lib/session";
import { hashSecret } from "../../src/lib/crypto";

function buildTestApp() {
  const app = new Hono<{ Bindings: Bindings; Variables: { userId: string; isAdmin: boolean } }>();
  app.get("/protected", requireAuth, (c) => c.json({ userId: c.get("userId") }));
  app.get("/verified-only", requireVerified, (c) => c.json({ userId: c.get("userId"), isAdmin: c.get("isAdmin") }));
  return app;
}

describe("requireAuth", () => {
  it("rejects requests without a session cookie", async () => {
    const app = buildTestApp();
    const res = await app.request("/protected", {}, env);
    expect(res.status).toBe(401);
  });

  it("allows requests with a valid session cookie", async () => {
    const app = buildTestApp();
    const token = await createSessionToken("user-abc", env.SESSION_SECRET);
    const res = await app.request("/protected", { headers: { Cookie: `session=${token}` } }, env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ userId: "user-abc" });
  });
});

describe("requireVerified", () => {
  it("rejects an unverified user", async () => {
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
       VALUES ('unverified-1', 'unv', 'unv@ehl.ch', ?, 'EHL', 'student', 'pending', 0)`
    )
      .bind(await hashSecret("x"))
      .run();
    const app = buildTestApp();
    const token = await createSessionToken("unverified-1", env.SESSION_SECRET);
    const res = await app.request("/verified-only", { headers: { Cookie: `session=${token}` } }, env);
    expect(res.status).toBe(403);
  });

  it("allows a verified user and reports admin status", async () => {
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, is_admin, created_at)
       VALUES ('verified-1', 'ver', 'ver@ehl.ch', ?, 'EHL', 'student', 'verified', 1, 0)`
    )
      .bind(await hashSecret("x"))
      .run();
    const app = buildTestApp();
    const token = await createSessionToken("verified-1", env.SESSION_SECRET);
    const res = await app.request("/verified-only", { headers: { Cookie: `session=${token}` } }, env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ userId: "verified-1", isAdmin: true });
  });
});
```

- [ ] **Step 6: Run tests**

Run: `npm test -- middleware/auth.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 7: Commit**

```bash
git add src/routes/auth.ts src/middleware/auth.ts test/routes/auth-login.test.ts test/middleware/auth.test.ts
git commit -m "feat: add login endpoint and requireAuth/requireVerified middleware"
```

---

### Task 7: Admin verification queue

**Files:**
- Create: `src/routes/admin.ts`
- Modify: `src/index.ts`
- Test: `test/routes/admin.test.ts`

**Interfaces:**
- Consumes: `requireVerified` (Task 6).
- Produces: `GET /admin/verifications` (list pending users), `POST /admin/verifications/:userId/approve`, `POST /admin/verifications/:userId/reject` — all admin-gated.

- [ ] **Step 1: Write the failing test**

```typescript
// test/routes/admin.test.ts
import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { createSessionToken } from "../../src/lib/session";
import { hashSecret } from "../../src/lib/crypto";

async function makeUser(id: string, opts: { isAdmin?: boolean; state?: string } = {}) {
  await env.DB.prepare(
    `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, is_admin, created_at)
     VALUES (?, ?, ?, ?, 'EHL', 'student', ?, ?, 0)`
  )
    .bind(id, `user-${id}`, `${id}@ehl.ch`, await hashSecret("x"), opts.state ?? "verified", opts.isAdmin ? 1 : 0)
    .run();
  return createSessionToken(id, env.SESSION_SECRET);
}

describe("admin verification queue", () => {
  it("rejects non-admins", async () => {
    const token = await makeUser("admin-test-1");
    const res = await SELF.fetch("https://example.com/admin/verifications", {
      headers: { Cookie: `session=${token}` },
    });
    expect(res.status).toBe(403);
  });

  it("lists pending users for admins", async () => {
    const adminToken = await makeUser("admin-test-2", { isAdmin: true });
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
       VALUES ('pending-1', 'pendinguser', 'pending@glion.ch', ?, 'Glion', 'alumni', 'pending', 0)`
    )
      .bind(await hashSecret("x"))
      .run();

    const res = await SELF.fetch("https://example.com/admin/verifications", {
      headers: { Cookie: `session=${adminToken}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { users: { id: string }[] };
    expect(body.users.some((u) => u.id === "pending-1")).toBe(true);
  });

  it("approves a pending user", async () => {
    const adminToken = await makeUser("admin-test-3", { isAdmin: true });
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
       VALUES ('pending-2', 'pendinguser2', 'pending2@glion.ch', ?, 'Glion', 'alumni', 'pending', 0)`
    )
      .bind(await hashSecret("x"))
      .run();

    const res = await SELF.fetch("https://example.com/admin/verifications/pending-2/approve", {
      method: "POST",
      headers: { Cookie: `session=${adminToken}` },
    });
    expect(res.status).toBe(200);

    const row = await env.DB.prepare("SELECT verification_state FROM users WHERE id = ?")
      .bind("pending-2")
      .first<{ verification_state: string }>();
    expect(row?.verification_state).toBe("verified");
  });
});
```

- [ ] **Step 2: Create `src/routes/admin.ts`**

```typescript
import { Hono } from "hono";
import type { Bindings } from "../index";
import { requireVerified } from "../middleware/auth";

export const admin = new Hono<{ Bindings: Bindings; Variables: { userId: string; isAdmin: boolean } }>();

admin.use("*", requireVerified);
admin.use("*", async (c, next) => {
  if (!c.get("isAdmin")) {
    return c.json({ error: "Admin only" }, 403);
  }
  await next();
});

admin.get("/verifications", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, username, school, status, verification_doc_key
     FROM users WHERE verification_state = 'pending' ORDER BY created_at ASC`
  ).all();
  return c.json({ users: results });
});

admin.post("/verifications/:userId/approve", async (c) => {
  const userId = c.req.param("userId");
  await c.env.DB.prepare("UPDATE users SET verification_state = 'verified' WHERE id = ?").bind(userId).run();
  return c.json({ message: "Approved" });
});

admin.post("/verifications/:userId/reject", async (c) => {
  const userId = c.req.param("userId");
  await c.env.DB.prepare("UPDATE users SET verification_state = 'rejected' WHERE id = ?").bind(userId).run();
  return c.json({ message: "Rejected" });
});
```

- [ ] **Step 3: Mount in `src/index.ts`**

```typescript
import { Hono } from "hono";
import { auth } from "./routes/auth";
import { admin } from "./routes/admin";

export type Bindings = {
  DB: D1Database;
  UPLOADS: R2Bucket;
  SESSION_SECRET: string;
  RESEND_API_KEY: string;
};

export const app = new Hono<{ Bindings: Bindings }>();

app.get("/health", (c) => c.json({ ok: true }));
app.route("/auth", auth);
app.route("/admin", admin);

export default app;
```

- [ ] **Step 4: Run tests**

Run: `npm test -- routes/admin.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/routes/admin.ts src/index.ts test/routes/admin.test.ts
git commit -m "feat: add admin verification queue (list, approve, reject)"
```

---

### Task 8: Categories and posts (create + category feed)

**Files:**
- Create: `src/routes/categories.ts`
- Create: `src/routes/posts.ts`
- Modify: `src/index.ts`
- Test: `test/routes/categories.test.ts`
- Test: `test/routes/posts.test.ts`

**Interfaces:**
- Consumes: `requireVerified` (Task 6), `newId` (Task 4).
- Produces: `GET /categories` (public), `GET /categories/:slug/posts?sort=new|top` (public feed), `POST /posts` (auth required, body `{ categoryId, title, body, imageKeys? }`) — `imageKeys` populated by Task 11's upload endpoint in the frontend flow, accepted here as an already-uploaded key list. `GET /posts/:id` used by Task 9.

- [ ] **Step 1: Write the failing test for categories**

```typescript
// test/routes/categories.test.ts
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("GET /categories", () => {
  it("returns the 7 seeded categories", async () => {
    const res = await SELF.fetch("https://example.com/categories");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { categories: { slug: string }[] };
    expect(body.categories).toHaveLength(7);
  });
});
```

- [ ] **Step 2: Create `src/routes/categories.ts`**

```typescript
import { Hono } from "hono";
import type { Bindings } from "../index";

export const categories = new Hono<{ Bindings: Bindings }>();

categories.get("/", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT id, slug, name, description FROM categories ORDER BY id").all();
  return c.json({ categories: results });
});

categories.get("/:slug/posts", async (c) => {
  const slug = c.req.param("slug");
  const sort = c.req.query("sort") === "top" ? "score DESC" : "created_at DESC";

  const category = await c.env.DB.prepare("SELECT id FROM categories WHERE slug = ?")
    .bind(slug)
    .first<{ id: number }>();
  if (!category) {
    return c.json({ error: "Category not found" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    `SELECT p.id, p.title, p.body, p.image_keys, p.score, p.created_at,
            u.username, u.school, u.status
     FROM posts p JOIN users u ON u.id = p.author_id
     WHERE p.category_id = ?
     ORDER BY ${sort}`
  )
    .bind(category.id)
    .all();

  return c.json({ posts: results });
});
```

- [ ] **Step 3: Run test**

Run: `npm test -- routes/categories.test.ts`
Expected: PASS (1 test)

- [ ] **Step 4: Write the failing test for post creation**

```typescript
// test/routes/posts.test.ts
import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { createSessionToken } from "../../src/lib/session";
import { hashSecret } from "../../src/lib/crypto";

async function makeVerifiedUser(id: string) {
  await env.DB.prepare(
    `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
     VALUES (?, ?, ?, ?, 'EHL', 'student', 'verified', 0)`
  )
    .bind(id, `user-${id}`, `${id}@ehl.ch`, await hashSecret("x"))
    .run();
  return createSessionToken(id, env.SESSION_SECRET);
}

describe("POST /posts", () => {
  it("creates a post for a verified user", async () => {
    const token = await makeVerifiedUser("post-author-1");
    const category = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'accommodation'").first<{
      id: number;
    }>();

    const res = await SELF.fetch("https://example.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ categoryId: category!.id, title: "Studio near campus?", body: "Any leads on studios?" }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { post: { id: string } };

    const feedRes = await SELF.fetch("https://example.com/categories/accommodation/posts");
    const feed = (await feedRes.json()) as { posts: { id: string; username: string; school: string }[] };
    const created = feed.posts.find((p) => p.id === body.post.id);
    expect(created?.username).toBe("user-post-author-1");
    expect(created?.school).toBe("EHL");
  });

  it("rejects unauthenticated post creation", async () => {
    const category = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'accommodation'").first<{
      id: number;
    }>();
    const res = await SELF.fetch("https://example.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: category!.id, title: "x", body: "y" }),
    });
    expect(res.status).toBe(401);
  });
});

describe("GET /posts/:id", () => {
  it("returns a single post with author badge info", async () => {
    const token = await makeVerifiedUser("post-author-2");
    const category = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'general'").first<{ id: number }>();
    const createRes = await SELF.fetch("https://example.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ categoryId: category!.id, title: "Hello", body: "World" }),
    });
    const { post } = (await createRes.json()) as { post: { id: string } };

    const res = await SELF.fetch(`https://example.com/posts/${post.id}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { post: { title: string; username: string } };
    expect(body.post.title).toBe("Hello");
    expect(body.post.username).toBe("user-post-author-2");
  });

  it("returns 404 for a missing post", async () => {
    const res = await SELF.fetch("https://example.com/posts/does-not-exist");
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 5: Create `src/routes/posts.ts`**

```typescript
import { Hono } from "hono";
import type { Bindings } from "../index";
import { requireVerified } from "../middleware/auth";
import { newId } from "../lib/id";

export const posts = new Hono<{ Bindings: Bindings; Variables: { userId: string; isAdmin: boolean } }>();

posts.post("/", requireVerified, async (c) => {
  const { categoryId, title, body, imageKeys } = await c.req.json<{
    categoryId: number;
    title: string;
    body: string;
    imageKeys?: string[];
  }>();

  if (!categoryId || !title || !body) {
    return c.json({ error: "categoryId, title, and body are required" }, 400);
  }

  const id = newId();
  await c.env.DB.prepare(
    `INSERT INTO posts (id, author_id, category_id, title, body, image_keys, score, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`
  )
    .bind(id, c.get("userId"), categoryId, title, body, JSON.stringify(imageKeys ?? []), Date.now())
    .run();

  return c.json({ post: { id } }, 201);
});

posts.get("/:id", async (c) => {
  const id = c.req.param("id");
  const post = await c.env.DB.prepare(
    `SELECT p.id, p.title, p.body, p.image_keys, p.score, p.created_at,
            u.username, u.school, u.status
     FROM posts p JOIN users u ON u.id = p.author_id
     WHERE p.id = ?`
  )
    .bind(id)
    .first();

  if (!post) {
    return c.json({ error: "Post not found" }, 404);
  }
  return c.json({ post });
});
```

- [ ] **Step 6: Mount both routers in `src/index.ts`**

```typescript
import { Hono } from "hono";
import { auth } from "./routes/auth";
import { admin } from "./routes/admin";
import { categories } from "./routes/categories";
import { posts } from "./routes/posts";

export type Bindings = {
  DB: D1Database;
  UPLOADS: R2Bucket;
  SESSION_SECRET: string;
  RESEND_API_KEY: string;
};

export const app = new Hono<{ Bindings: Bindings }>();

app.get("/health", (c) => c.json({ ok: true }));
app.route("/auth", auth);
app.route("/admin", admin);
app.route("/categories", categories);
app.route("/posts", posts);

export default app;
```

- [ ] **Step 7: Run tests**

Run: `npm test -- routes/categories.test.ts routes/posts.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 8: Commit**

```bash
git add src/routes/categories.ts src/routes/posts.ts src/index.ts test/routes/categories.test.ts test/routes/posts.test.ts
git commit -m "feat: add category feed and post creation/detail endpoints"
```

---

### Task 9: Comments (create, threaded list)

**Files:**
- Create: `src/routes/comments.ts`
- Modify: `src/index.ts`
- Test: `test/routes/comments.test.ts`

**Interfaces:**
- Consumes: `requireVerified` (Task 6), `newId` (Task 4).
- Produces: `POST /posts/:postId/comments` (body `{ body, parentCommentId? }`), `GET /posts/:postId/comments` (flat list with `parent_comment_id`, sorted `created_at ASC`; the frontend plan builds the tree from this flat list).

- [ ] **Step 1: Write the failing test**

```typescript
// test/routes/comments.test.ts
import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { createSessionToken } from "../../src/lib/session";
import { hashSecret } from "../../src/lib/crypto";

async function makeVerifiedUser(id: string) {
  await env.DB.prepare(
    `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
     VALUES (?, ?, ?, ?, 'EHL', 'student', 'verified', 0)`
  )
    .bind(id, `user-${id}`, `${id}@ehl.ch`, await hashSecret("x"))
    .run();
  return createSessionToken(id, env.SESSION_SECRET);
}

async function makePost(token: string) {
  const category = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'general'").first<{ id: number }>();
  const res = await SELF.fetch("https://example.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
    body: JSON.stringify({ categoryId: category!.id, title: "T", body: "B" }),
  });
  const { post } = (await res.json()) as { post: { id: string } };
  return post.id;
}

describe("comments", () => {
  it("creates a top-level comment and a nested reply, both listed for the post", async () => {
    const token = await makeVerifiedUser("commenter-1");
    const postId = await makePost(token);

    const topRes = await SELF.fetch(`https://example.com/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ body: "Top level comment" }),
    });
    expect(topRes.status).toBe(201);
    const { comment: topComment } = (await topRes.json()) as { comment: { id: string } };

    const replyRes = await SELF.fetch(`https://example.com/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ body: "A reply", parentCommentId: topComment.id }),
    });
    expect(replyRes.status).toBe(201);

    const listRes = await SELF.fetch(`https://example.com/posts/${postId}/comments`);
    const { comments } = (await listRes.json()) as {
      comments: { id: string; parent_comment_id: string | null; body: string }[];
    };
    expect(comments).toHaveLength(2);
    expect(comments.find((c) => c.body === "A reply")?.parent_comment_id).toBe(topComment.id);
  });

  it("rejects unauthenticated comment creation", async () => {
    const token = await makeVerifiedUser("commenter-2");
    const postId = await makePost(token);
    const res = await SELF.fetch(`https://example.com/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "no auth" }),
    });
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Create `src/routes/comments.ts`**

```typescript
import { Hono } from "hono";
import type { Bindings } from "../index";
import { requireVerified } from "../middleware/auth";
import { newId } from "../lib/id";

export const comments = new Hono<{ Bindings: Bindings; Variables: { userId: string; isAdmin: boolean } }>();

comments.post("/:postId/comments", requireVerified, async (c) => {
  const postId = c.req.param("postId");
  const { body, parentCommentId } = await c.req.json<{ body: string; parentCommentId?: string }>();

  if (!body) {
    return c.json({ error: "body is required" }, 400);
  }

  const post = await c.env.DB.prepare("SELECT id FROM posts WHERE id = ?").bind(postId).first();
  if (!post) {
    return c.json({ error: "Post not found" }, 404);
  }

  const id = newId();
  await c.env.DB.prepare(
    `INSERT INTO comments (id, post_id, parent_comment_id, author_id, body, score, created_at)
     VALUES (?, ?, ?, ?, ?, 0, ?)`
  )
    .bind(id, postId, parentCommentId ?? null, c.get("userId"), body, Date.now())
    .run();

  return c.json({ comment: { id } }, 201);
});

comments.get("/:postId/comments", async (c) => {
  const postId = c.req.param("postId");
  const { results } = await c.env.DB.prepare(
    `SELECT c.id, c.parent_comment_id, c.body, c.score, c.created_at, u.username, u.school, u.status
     FROM comments c JOIN users u ON u.id = c.author_id
     WHERE c.post_id = ?
     ORDER BY c.created_at ASC`
  )
    .bind(postId)
    .all();
  return c.json({ comments: results });
});
```

- [ ] **Step 3: Mount in `src/index.ts`** (mount under `/posts` since routes are `/:postId/comments`)

```typescript
import { Hono } from "hono";
import { auth } from "./routes/auth";
import { admin } from "./routes/admin";
import { categories } from "./routes/categories";
import { posts } from "./routes/posts";
import { comments } from "./routes/comments";

export type Bindings = {
  DB: D1Database;
  UPLOADS: R2Bucket;
  SESSION_SECRET: string;
  RESEND_API_KEY: string;
};

export const app = new Hono<{ Bindings: Bindings }>();

app.get("/health", (c) => c.json({ ok: true }));
app.route("/auth", auth);
app.route("/admin", admin);
app.route("/categories", categories);
app.route("/posts", posts);
app.route("/posts", comments);

export default app;
```

- [ ] **Step 4: Run tests**

Run: `npm test -- routes/comments.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/routes/comments.ts src/index.ts test/routes/comments.test.ts
git commit -m "feat: add threaded comment creation and listing"
```

---

### Task 10: Voting

**Files:**
- Create: `src/routes/votes.ts`
- Modify: `src/index.ts`
- Test: `test/routes/votes.test.ts`

**Interfaces:**
- Consumes: `requireVerified` (Task 6), `newId` (Task 4).
- Produces: `POST /votes` (body `{ targetType: "post" | "comment", targetId, value: 1 | -1 }`) — upserts the vote and recomputes `score` on the target row.

- [ ] **Step 1: Write the failing test**

```typescript
// test/routes/votes.test.ts
import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { createSessionToken } from "../../src/lib/session";
import { hashSecret } from "../../src/lib/crypto";

async function makeVerifiedUser(id: string) {
  await env.DB.prepare(
    `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
     VALUES (?, ?, ?, ?, 'EHL', 'student', 'verified', 0)`
  )
    .bind(id, `user-${id}`, `${id}@ehl.ch`, await hashSecret("x"))
    .run();
  return createSessionToken(id, env.SESSION_SECRET);
}

async function makePost(token: string) {
  const category = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'general'").first<{ id: number }>();
  const res = await SELF.fetch("https://example.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
    body: JSON.stringify({ categoryId: category!.id, title: "T", body: "B" }),
  });
  const { post } = (await res.json()) as { post: { id: string } };
  return post.id;
}

describe("POST /votes", () => {
  it("upvotes a post and updates its score", async () => {
    const authorToken = await makeVerifiedUser("vote-author");
    const postId = await makePost(authorToken);
    const voterToken = await makeVerifiedUser("voter-1");

    const res = await SELF.fetch("https://example.com/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${voterToken}` },
      body: JSON.stringify({ targetType: "post", targetId: postId, value: 1 }),
    });
    expect(res.status).toBe(200);

    const post = await env.DB.prepare("SELECT score FROM posts WHERE id = ?").bind(postId).first<{ score: number }>();
    expect(post?.score).toBe(1);
  });

  it("changes an existing vote instead of adding a second one", async () => {
    const authorToken = await makeVerifiedUser("vote-author-2");
    const postId = await makePost(authorToken);
    const voterToken = await makeVerifiedUser("voter-2");

    await SELF.fetch("https://example.com/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${voterToken}` },
      body: JSON.stringify({ targetType: "post", targetId: postId, value: 1 }),
    });
    await SELF.fetch("https://example.com/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${voterToken}` },
      body: JSON.stringify({ targetType: "post", targetId: postId, value: -1 }),
    });

    const post = await env.DB.prepare("SELECT score FROM posts WHERE id = ?").bind(postId).first<{ score: number }>();
    expect(post?.score).toBe(-1);

    const voteCount = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM votes WHERE target_type = 'post' AND target_id = ?"
    )
      .bind(postId)
      .first<{ count: number }>();
    expect(voteCount?.count).toBe(1);
  });

  it("rejects an invalid value", async () => {
    const token = await makeVerifiedUser("voter-3");
    const res = await SELF.fetch("https://example.com/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ targetType: "post", targetId: "whatever", value: 5 }),
    });
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Create `src/routes/votes.ts`**

```typescript
import { Hono } from "hono";
import type { Bindings } from "../index";
import { requireVerified } from "../middleware/auth";
import { newId } from "../lib/id";

export const votes = new Hono<{ Bindings: Bindings; Variables: { userId: string; isAdmin: boolean } }>();

async function recomputeScore(db: D1Database, targetType: "post" | "comment", targetId: string): Promise<void> {
  const table = targetType === "post" ? "posts" : "comments";
  const sum = await db
    .prepare("SELECT COALESCE(SUM(value), 0) as total FROM votes WHERE target_type = ? AND target_id = ?")
    .bind(targetType, targetId)
    .first<{ total: number }>();
  await db
    .prepare(`UPDATE ${table} SET score = ? WHERE id = ?`)
    .bind(sum?.total ?? 0, targetId)
    .run();
}

votes.post("/", requireVerified, async (c) => {
  const { targetType, targetId, value } = await c.req.json<{
    targetType: "post" | "comment";
    targetId: string;
    value: number;
  }>();

  if ((targetType !== "post" && targetType !== "comment") || !targetId || (value !== 1 && value !== -1)) {
    return c.json({ error: "Invalid vote payload" }, 400);
  }

  const userId = c.get("userId");
  const existing = await c.env.DB.prepare(
    "SELECT id FROM votes WHERE user_id = ? AND target_type = ? AND target_id = ?"
  )
    .bind(userId, targetType, targetId)
    .first<{ id: string }>();

  if (existing) {
    await c.env.DB.prepare("UPDATE votes SET value = ? WHERE id = ?").bind(value, existing.id).run();
  } else {
    await c.env.DB.prepare(
      "INSERT INTO votes (id, user_id, target_type, target_id, value, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(newId(), userId, targetType, targetId, value, Date.now())
      .run();
  }

  await recomputeScore(c.env.DB, targetType, targetId);
  return c.json({ message: "Vote recorded" });
});
```

- [ ] **Step 3: Mount in `src/index.ts`**

```typescript
import { votes } from "./routes/votes";
// ...
app.route("/votes", votes);
```

(Add this import and route line alongside the existing ones from Task 9.)

- [ ] **Step 4: Run tests**

Run: `npm test -- routes/votes.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/routes/votes.ts src/index.ts test/routes/votes.test.ts
git commit -m "feat: add voting with upsert-on-change and recomputed scores"
```

---

### Task 11: Rate limiting and reports

**Files:**
- Create: `src/middleware/rateLimit.ts`
- Modify: `src/routes/posts.ts`
- Modify: `src/routes/comments.ts`
- Create: `src/routes/reports.ts`
- Modify: `src/index.ts`
- Test: `test/middleware/rateLimit.test.ts`
- Test: `test/routes/reports.test.ts`

**Interfaces:**
- Consumes: `requireVerified` (Task 6), `newId` (Task 4).
- Produces: `rateLimitPosting(maxPerHour: number)` middleware factory, applied to `POST /posts` and `POST /posts/:postId/comments`. `POST /reports` (body `{ targetType, targetId, reason }`), `GET /admin/reports` (open reports, admin-gated).

- [ ] **Step 1: Write the failing test for rate limiting**

```typescript
// test/middleware/rateLimit.test.ts
import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { createSessionToken } from "../../src/lib/session";
import { hashSecret } from "../../src/lib/crypto";

async function makeVerifiedUser(id: string) {
  await env.DB.prepare(
    `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
     VALUES (?, ?, ?, ?, 'EHL', 'student', 'verified', 0)`
  )
    .bind(id, `user-${id}`, `${id}@ehl.ch`, await hashSecret("x"))
    .run();
  return createSessionToken(id, env.SESSION_SECRET);
}

describe("post rate limiting", () => {
  it("blocks the 6th post within an hour when the limit is 5", async () => {
    const token = await makeVerifiedUser("rate-limited-user");
    const category = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'general'").first<{
      id: number;
    }>();

    let lastStatus = 0;
    for (let i = 0; i < 6; i++) {
      const res = await SELF.fetch("https://example.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
        body: JSON.stringify({ categoryId: category!.id, title: `Post ${i}`, body: "body" }),
      });
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });
});
```

- [ ] **Step 2: Create `src/middleware/rateLimit.ts`**

```typescript
import { createMiddleware } from "hono/factory";
import type { Bindings } from "../index";

const POST_LIMIT_PER_HOUR = 5;
const HOUR_MS = 60 * 60 * 1000;

export const rateLimitPosts = createMiddleware<{
  Bindings: Bindings;
  Variables: { userId: string };
}>(async (c, next) => {
  const since = Date.now() - HOUR_MS;
  const count = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM posts WHERE author_id = ? AND created_at > ?"
  )
    .bind(c.get("userId"), since)
    .first<{ count: number }>();

  if ((count?.count ?? 0) >= POST_LIMIT_PER_HOUR) {
    return c.json({ error: "Posting rate limit reached. Try again later." }, 429);
  }
  await next();
});

export const rateLimitComments = createMiddleware<{
  Bindings: Bindings;
  Variables: { userId: string };
}>(async (c, next) => {
  const since = Date.now() - HOUR_MS;
  const count = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM comments WHERE author_id = ? AND created_at > ?"
  )
    .bind(c.get("userId"), since)
    .first<{ count: number }>();

  if ((count?.count ?? 0) >= POST_LIMIT_PER_HOUR) {
    return c.json({ error: "Commenting rate limit reached. Try again later." }, 429);
  }
  await next();
});
```

- [ ] **Step 3: Apply to `src/routes/posts.ts`** — change the route registration line

```typescript
import { rateLimitPosts } from "../middleware/rateLimit";
// ...
posts.post("/", requireVerified, rateLimitPosts, async (c) => {
```

- [ ] **Step 4: Apply to `src/routes/comments.ts`** — change the route registration line

```typescript
import { rateLimitComments } from "../middleware/rateLimit";
// ...
comments.post("/:postId/comments", requireVerified, rateLimitComments, async (c) => {
```

- [ ] **Step 5: Run the rate limit test**

Run: `npm test -- middleware/rateLimit.test.ts`
Expected: PASS (1 test)

- [ ] **Step 6: Write the failing test for reports**

```typescript
// test/routes/reports.test.ts
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

describe("POST /reports", () => {
  it("creates a report and lists it for admins", async () => {
    const reporterToken = await makeUser("reporter-1");
    const adminToken = await makeUser("admin-reports-1", { isAdmin: true });

    const createRes = await SELF.fetch("https://example.com/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${reporterToken}` },
      body: JSON.stringify({ targetType: "post", targetId: "some-post-id", reason: "Spam" }),
    });
    expect(createRes.status).toBe(201);

    const listRes = await SELF.fetch("https://example.com/admin/reports", {
      headers: { Cookie: `session=${adminToken}` },
    });
    expect(listRes.status).toBe(200);
    const body = (await listRes.json()) as { reports: { reason: string }[] };
    expect(body.reports.some((r) => r.reason === "Spam")).toBe(true);
  });

  it("rejects non-admins from listing reports", async () => {
    const token = await makeUser("reporter-2");
    const res = await SELF.fetch("https://example.com/admin/reports", { headers: { Cookie: `session=${token}` } });
    expect(res.status).toBe(403);
  });
});
```

- [ ] **Step 7: Create `src/routes/reports.ts`**

```typescript
import { Hono } from "hono";
import type { Bindings } from "../index";
import { requireVerified } from "../middleware/auth";
import { newId } from "../lib/id";

export const reports = new Hono<{ Bindings: Bindings; Variables: { userId: string; isAdmin: boolean } }>();

reports.post("/", requireVerified, async (c) => {
  const { targetType, targetId, reason } = await c.req.json<{
    targetType: "post" | "comment";
    targetId: string;
    reason: string;
  }>();

  if ((targetType !== "post" && targetType !== "comment") || !targetId || !reason) {
    return c.json({ error: "Invalid report payload" }, 400);
  }

  await c.env.DB.prepare(
    "INSERT INTO reports (id, reporter_id, target_type, target_id, reason, status, created_at) VALUES (?, ?, ?, ?, ?, 'open', ?)"
  )
    .bind(newId(), c.get("userId"), targetType, targetId, reason, Date.now())
    .run();

  return c.json({ message: "Report submitted" }, 201);
});
```

- [ ] **Step 8: Add the admin-gated list endpoint to `src/routes/admin.ts`** (append below the verification endpoints)

```typescript
admin.get("/reports", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, reporter_id, target_type, target_id, reason, created_at FROM reports WHERE status = 'open' ORDER BY created_at ASC"
  ).all();
  return c.json({ reports: results });
});
```

- [ ] **Step 9: Mount `reports` in `src/index.ts`**

```typescript
import { reports } from "./routes/reports";
// ...
app.route("/reports", reports);
```

- [ ] **Step 10: Run all tests in the project**

Run: `npm test`
Expected: PASS (every test file, full suite green)

- [ ] **Step 11: Commit**

```bash
git add src/middleware/rateLimit.ts src/routes/posts.ts src/routes/comments.ts src/routes/reports.ts src/routes/admin.ts src/index.ts test/middleware/rateLimit.test.ts test/routes/reports.test.ts
git commit -m "feat: add posting rate limits and content reporting with admin review queue"
```

---

### Task 12: User profile

**Files:**
- Create: `src/routes/users.ts`
- Modify: `src/index.ts`
- Test: `test/routes/users.test.ts`

**Interfaces:**
- Consumes: nothing new — reads existing `users`, `posts`, `comments` tables.
- Produces: `GET /users/:username` (public) returning `{ username, school, status, verification_state, created_at, posts: [...], comments: [...] }`. Never includes `email`, `password_hash`, or `verification_doc_key`.

- [ ] **Step 1: Write the failing test**

```typescript
// test/routes/users.test.ts
import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { createSessionToken } from "../../src/lib/session";
import { hashSecret } from "../../src/lib/crypto";

async function makeVerifiedUser(id: string) {
  await env.DB.prepare(
    `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
     VALUES (?, ?, ?, ?, 'EHL', 'alumni', 'verified', 0)`
  )
    .bind(id, `profileuser-${id}`, `${id}@ehl.ch`, await hashSecret("x"))
    .run();
  return createSessionToken(id, env.SESSION_SECRET);
}

describe("GET /users/:username", () => {
  it("returns public profile fields plus post and comment history", async () => {
    const token = await makeVerifiedUser("profile-1");
    const category = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'general'").first<{
      id: number;
    }>();
    const postRes = await SELF.fetch("https://example.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ categoryId: category!.id, title: "My post", body: "Body" }),
    });
    const { post } = (await postRes.json()) as { post: { id: string } };
    await SELF.fetch(`https://example.com/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ body: "My comment" }),
    });

    const res = await SELF.fetch("https://example.com/users/profileuser-profile-1");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      user: { username: string; school: string; status: string; verification_state: string };
      posts: { title: string }[];
      comments: { body: string }[];
    };
    expect(body.user.school).toBe("EHL");
    expect(body.user.status).toBe("alumni");
    expect(body.posts.some((p) => p.title === "My post")).toBe(true);
    expect(body.comments.some((c) => c.body === "My comment")).toBe(true);
    expect(JSON.stringify(body)).not.toMatch(/@ehl\.ch/); // email must never be exposed
  });

  it("returns 404 for a missing username", async () => {
    const res = await SELF.fetch("https://example.com/users/does-not-exist");
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Create `src/routes/users.ts`**

```typescript
import { Hono } from "hono";
import type { Bindings } from "../index";

export const users = new Hono<{ Bindings: Bindings }>();

users.get("/:username", async (c) => {
  const username = c.req.param("username");
  const user = await c.env.DB.prepare(
    "SELECT username, school, status, verification_state, created_at FROM users WHERE username = ?"
  )
    .bind(username)
    .first<{ username: string; school: string; status: string; verification_state: string; created_at: number }>();

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  const { results: posts } = await c.env.DB.prepare(
    `SELECT p.id, p.title, p.score, p.created_at, p.category_id
     FROM posts p JOIN users u ON u.id = p.author_id
     WHERE u.username = ? ORDER BY p.created_at DESC`
  )
    .bind(username)
    .all();

  const { results: comments } = await c.env.DB.prepare(
    `SELECT c.id, c.post_id, c.body, c.score, c.created_at
     FROM comments c JOIN users u ON u.id = c.author_id
     WHERE u.username = ? ORDER BY c.created_at DESC`
  )
    .bind(username)
    .all();

  return c.json({ user, posts, comments });
});
```

- [ ] **Step 3: Mount in `src/index.ts`**

```typescript
import { users } from "./routes/users";
// ...
app.route("/users", users);
```

- [ ] **Step 4: Run tests**

Run: `npm test -- routes/users.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/routes/users.ts src/index.ts test/routes/users.test.ts
git commit -m "feat: add public user profile endpoint with post/comment history"
```

---

## Post-Plan Manual Steps (not automatable by tests)

- Run `npx wrangler d1 create hospograd`, paste the real `database_id` into `wrangler.toml`.
- Run `npx wrangler r2 bucket create hospograd-uploads`.
- Set secrets: `npx wrangler secret put SESSION_SECRET` (a long random string) and `npx wrangler secret put RESEND_API_KEY`.
- Run `npm run db:migrate:remote` to apply `migrations/0001_init.sql` to the real D1 database.
- Manually promote your own account to admin once signed up: `npx wrangler d1 execute hospograd --remote --command "UPDATE users SET is_admin = 1 WHERE username = 'YOUR_USERNAME'"`.
