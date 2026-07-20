import { applyD1Migrations, env } from "cloudflare:test";

// @ts-expect-error -- provided by the vitest-pool-workers migrations config below
if (env.TEST_MIGRATIONS && Array.isArray(env.TEST_MIGRATIONS)) {
  // @ts-expect-error -- provided by the vitest-pool-workers migrations config below
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
}
