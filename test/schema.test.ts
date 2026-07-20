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
