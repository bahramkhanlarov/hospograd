// One-shot seeder: converts scripts/seed-topics.json into INSERT statements for
// the D1 posts table and writes them to a temp SQL file.
//
// Usage:
//   node scripts/seed-topics.mjs            # writes /tmp/hospograd_seed_topics.sql
//   wrangler d1 execute hospograd --remote --file=/tmp/hospograd_seed_topics.sql
//
// Safe to re-run: ids are UUIDs derived from (title + created_at), so an
// identical run generates identical ids and INSERT OR IGNORE is idempotent.

import { createHash, randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const CATEGORY_IDS = {
  accommodation: 1,
  "health-insurance": 2,
  "visa-legal": 3,
  "jobs-internships": 4,
  "money-taxes": 5,
  "school-life": 6,
  general: 7,
  careers: 8,
  "cv-reviews": 9,
  "interview-tips": 10,
  "salary-discussions": 11,
  "management-trainee": 12,
  "career-changes": 13,
};

const AUTHOR_ID = "hospograd-team";
const MAX_AGE_MS = 21 * 24 * 60 * 60 * 1000; // spread posts over last 21 days

const topics = JSON.parse(readFileSync(new URL("./seed-topics.json", import.meta.url), "utf8"));

const escape = (s) => s.replaceAll("'", "''");

function deterministicId(title, createdAt) {
  const seed = `${title}::${createdAt}`;
  const hex = createHash("sha256").update(seed).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

const now = Date.now();
const step = topics.length > 1 ? Math.floor(MAX_AGE_MS / (topics.length - 1)) : 0;

const rows = topics.map((topic, i) => {
  const categoryId = CATEGORY_IDS[topic.category];
  if (categoryId === undefined) {
    throw new Error(`Unknown category: ${topic.category} (title: ${topic.title})`);
  }
  const createdAt = now - i * step;
  return {
    id: deterministicId(topic.title, createdAt),
    categoryId,
    title: topic.title,
    body: topic.body,
    createdAt,
  };
});

const statements = rows.map(
  (r) =>
    `INSERT OR IGNORE INTO posts (id, author_id, category_id, title, body, image_keys, score, created_at)\n` +
    `VALUES ('${r.id}', '${AUTHOR_ID}', ${r.categoryId}, '${escape(r.title)}', '${escape(r.body)}', '[]', 0, ${r.createdAt});`
);

const sql = statements.join("\n\n") + "\n";
writeFileSync("/tmp/hospograd_seed_topics.sql", sql);
console.log(`Wrote ${rows.length} INSERT statements (${sql.length} bytes) to /tmp/hospograd_seed_topics.sql`);
for (const r of rows) {
  console.log(`  ${r.categoryId} ${new Date(r.createdAt).toISOString().slice(0, 10)} ${r.title.slice(0, 60)}`);
}
