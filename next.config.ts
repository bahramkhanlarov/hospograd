import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable Next.js 16's auto-generated AGENTS.md/CLAUDE.md at repo root —
  // this repo already has its own CLAUDE.md conventions and workflow.
  agentRules: false,
};

export default nextConfig;
