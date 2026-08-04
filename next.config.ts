import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable Next.js 16's auto-generated AGENTS.md/CLAUDE.md at repo root —
  // this repo already has its own CLAUDE.md conventions and workflow.
  agentRules: false,
  // The school-banner logo strip serves an SVG (shl.svg) through next/image.
  // OpenNext's image handler 400s on SVGs unless explicitly allowed; this is
  // Next.js's own documented safe pattern (sandboxed CSP, no script execution).
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;

// Give `next dev` access to the Cloudflare bindings declared for the
// `hospograd-web` Worker (D1 `DB`, R2 `UPLOADS`) via getCloudflareContext().
// `next dev` loads this config file in two separate processes; the adapter
// internally dedupes via a `globalThis.AsyncLocalStorage` check
// (`shouldContextInitializationRun` in
// @opennextjs/cloudflare/dist/api/cloudflare-context.js) so this call is a
// no-op in the process where that guard doesn't hold — not a dev/build
// discriminator. It still runs (and must succeed) under `next dev` itself.
// The call is fire-and-forget by design (see the function's own doc comment),
// so failures must be caught explicitly or they become an unhandled
// rejection and `next dev` fails later with a confusing error from
// getCloudflareContext() instead of this clear one.
initOpenNextCloudflareForDev({ configPath: "./wrangler.next.jsonc" }).catch(
  (error: unknown) => {
    console.error(
      "[next.config.ts] initOpenNextCloudflareForDev failed — Cloudflare bindings (D1 DB, R2 UPLOADS) will be unavailable in `next dev`. Check that wrangler.next.jsonc exists and is valid, and that no other wrangler dev process is holding the local state.",
      error,
    );
  },
);
