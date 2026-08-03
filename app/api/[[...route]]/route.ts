/// <reference types="@cloudflare/workers-types" />
import { app, type Bindings } from "@/src/index";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Tell @opennextjs/cloudflare's ambient CloudflareEnv interface (declared as
// `declare global { interface CloudflareEnv {...} }` in the package) about
// this project's actual Worker bindings, via declaration merging. This keeps
// getCloudflareContext()'s `env` structurally checked against the real
// Bindings shape (DB, UPLOADS, ASSETS, SESSION_SECRET, RESEND_API_KEY)
// instead of requiring an unsafe `as unknown as Bindings` cast at the call
// site below.
declare global {
  interface CloudflareEnv extends Bindings {}
}

// Mounts the existing Hono API (src/index.ts) inside Next.js so every
// existing /api/* route is reachable through the Next.js app as well as
// the current vanilla-site Worker. getCloudflareContext() is synchronous
// by default in @opennextjs/cloudflare 1.20.x (async only when explicitly
// requested via { async: true }).
async function handler(request: Request): Promise<Response> {
  const { env, ctx } = getCloudflareContext();
  return app.fetch(request, env, ctx);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
