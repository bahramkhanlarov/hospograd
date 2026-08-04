import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable Next.js 16's auto-generated AGENTS.md/CLAUDE.md at repo root —
  // this repo already has its own CLAUDE.md conventions and workflow.
  agentRules: false,
};

export default nextConfig;

// Give `next dev` access to the Cloudflare bindings declared for the
// `hospograd-web` Worker (D1 `DB`, R2 `UPLOADS`) via getCloudflareContext().
// No-op outside of `next dev`.
import("@opennextjs/cloudflare").then((m) =>
  m.initOpenNextCloudflareForDev({ configPath: "./wrangler.next.jsonc" })
);
