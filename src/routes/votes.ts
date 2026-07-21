import { Hono } from "hono";
import type { Bindings } from "../index";
import { requireVerified } from "../middleware/auth";
import { newId } from "../lib/id";

export const votes = new Hono<{ Bindings: Bindings; Variables: { userId: string; isAdmin: boolean } }>();

async function recomputeScore(db: D1Database, targetType: "post" | "comment", targetId: string): Promise<void> {
  const table = targetType === "post" ? "posts" : "comments";
  const sum = await db
    .prepare("SELECT COALESCE(SUM(value), 0) as total FROM votes WHERE target_type = ? AND target_id = ?")
    .bind(targetType, targetId)
    .first<{ total: number }>();
  await db
    .prepare(`UPDATE ${table} SET score = ? WHERE id = ?`)
    .bind(sum?.total ?? 0, targetId)
    .run();
}

votes.post("/", requireVerified, async (c) => {
  const { targetType, targetId, value } = await c.req.json<{
    targetType: "post" | "comment";
    targetId: string;
    value: number;
  }>();

  if ((targetType !== "post" && targetType !== "comment") || !targetId || (value !== 1 && value !== -1)) {
    return c.json({ error: "Invalid vote payload" }, 400);
  }

  const userId = c.get("userId");
  const existing = await c.env.DB.prepare(
    "SELECT id FROM votes WHERE user_id = ? AND target_type = ? AND target_id = ?"
  )
    .bind(userId, targetType, targetId)
    .first<{ id: string }>();

  if (existing) {
    await c.env.DB.prepare("UPDATE votes SET value = ? WHERE id = ?").bind(value, existing.id).run();
  } else {
    await c.env.DB.prepare(
      "INSERT INTO votes (id, user_id, target_type, target_id, value, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(newId(), userId, targetType, targetId, value, Date.now())
      .run();
  }

  await recomputeScore(c.env.DB, targetType, targetId);
  return c.json({ message: "Vote recorded" });
});
