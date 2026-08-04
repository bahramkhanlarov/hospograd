import {
  defineCloudflareConfig,
  type OpenNextConfig,
} from "@opennextjs/cloudflare";

// OpenNext configuration for the Next.js Worker (`hospograd-web`).
//
// Incremental cache is intentionally NOT configured yet: enabling the R2
// incremental cache requires provisioning a dedicated cache bucket plus a
// WORKER_SELF_REFERENCE service binding. That is deferred until the Next.js
// app actually becomes the production deployment (sub-project 5).
// See https://opennext.js.org/cloudflare/caching
export default {
  ...defineCloudflareConfig({}),
  // This repo's Worker is the primary artifact, so the Next.js build lives
  // under `build:next` rather than the generic `build` script OpenNext
  // assumes by default.
  buildCommand: "npm run build:next",
} satisfies OpenNextConfig;
