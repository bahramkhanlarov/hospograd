import { Hono } from "hono";
import type { Bindings } from "../index";
import { requireVerified } from "../middleware/auth";
import { newId } from "../lib/id";

export const reports = new Hono<{ Bindings: Bindings; Variables: { userId: string; isAdmin: boolean } }>();

reports.post("/", requireVerified, async (c) => {
  const { targetType, targetId, reason } = await c.req.json<{
    targetType: "post" | "comment";
    targetId: string;
    reason: string;
  }>();

  if ((targetType !== "post" && targetType !== "comment") || !targetId || !reason) {
    return c.json({ error: "Invalid report payload" }, 400);
  }

  await c.env.DB.prepare(
    "INSERT INTO reports (id, reporter_id, target_type, target_id, reason, status, created_at) VALUES (?, ?, ?, ?, ?, 'open', ?)"
  )
    .bind(newId(), c.get("userId"), targetType, targetId, reason, Date.now())
    .run();

  return c.json({ message: "Report submitted" }, 201);
});
