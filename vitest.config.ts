import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import * as fs from "fs";
import * as path from "path";

interface D1Migration {
  name: string;
  queries: string[];
}

function loadMigrations(): D1Migration[] {
  const migrationsDir = path.join(process.cwd(), "migrations");
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith(".sql"))
    .sort()
    .map(file => {
      const content = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      // Split by semicolons to get individual queries, filter out empty/comment-only statements
      const queries = content
        .split(";")
        .map(q => q.trim())
        .filter(q => q && !q.startsWith("--") && q.length > 0);

      return {
        name: file.replace(".sql", ""),
        queries,
      };
    });
}

const migrations = loadMigrations();

export default defineWorkersConfig({
  test: {
    setupFiles: ["./test/setup.ts"],
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml" },
        miniflare: {
          bindings: {
            TEST_MIGRATIONS: migrations,
          },
        },
      },
    },
  },
});
