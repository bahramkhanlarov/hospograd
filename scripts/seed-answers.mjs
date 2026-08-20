// One-shot seeder: converts scripts/seed-answers.json into INSERT statements
// for the D1 comments table (top-level comments on seeded posts, authored by
// the hospograd-team system account) and writes them to a temp SQL file.
//
// Usage:
//   node scripts/seed-answers.mjs            # writes /tmp/hospograd_seed_answers.sql
//   wrangler d1 execute hospograd --remote --file=/tmp/hospograd_seed_answers.sql
//
// Safe to re-run: ids are deterministic UUIDs derived from (postId + body),
// and INSERT OR IGNORE is idempotent. Comments are timed `daysAfterPost`
// days after each post's created_at.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const DAY_MS = 24 * 60 * 60 * 1000;

const answers = JSON.parse(readFileSync(new URL("./seed-answers.json", import.meta.url), "utf8"));

const AUTHOR_ID = "hospograd-team";
const escape = (s) => s.replaceAll("'", "''");

function deterministicCommentId(postId, body, createdAt) {
  const seed = `${postId}::${body}::${createdAt}`;
  const hex = createHash("sha256").update(seed).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

// Fetch real post ids + created_at from the remote DB so comment timing is
// anchored to the actual stored posts.
async function fetchPosts() {
  const { execFileSync } = await import("node:child_process");
  const out = execFileSync("npx", ["wrangler", "d1", "execute", "hospograd", "--remote", "--command",
    "SELECT id, title, created_at FROM posts;", "--json"], { encoding: "utf8" });
  const parsed = JSON.parse(out);
  const rows = parsed[0].results;
  const byId = new Map(rows.map((r) => [r.id, r]));
  return { byId, rows };
}

const { byId } = await fetchPosts();

const statements = [];
const usedPostIds = new Set();

for (const [postId, answer] of Object.entries(answers)) {
  const post = byId.get(postId);
  if (!post) {
    console.warn(`SKIP: no live post for answer id: ${postId}`);
    continue;
  }
  const createdAt = post.created_at + answer.daysAfterPost * DAY_MS;
  const commentId = deterministicCommentId(post.id, answer.body, createdAt);
  statements.push(
    `INSERT OR IGNORE INTO comments (id, post_id, parent_comment_id, author_id, body, score, created_at)\n` +
    `VALUES ('${commentId}', '${post.id}', NULL, '${AUTHOR_ID}', '${escape(answer.body)}', 0, ${createdAt});`
  );
  usedPostIds.add(postId);
  console.log(`  ${new Date(createdAt).toISOString().slice(0, 10)} ${post.title.slice(0, 55)}`);
}

if (usedPostIds.size === 0) {
  console.error("No answers matched live posts; aborting without writing SQL.");
  process.exit(1);
}

const orphanIds = Object.keys(answers).filter((id) => !usedPostIds.has(id));
if (orphanIds.length) {
  console.warn(`Answers without a live post (check seed-answers.json keys): ${orphanIds.length}`);
}

const sql = statements.join("\n\n") + "\n";
writeFileSync("/tmp/hospograd_seed_answers.sql", sql);
console.log(`\nWrote ${statements.length} INSERT statements (${sql.length} bytes) to /tmp/hospograd_seed_answers.sql`);