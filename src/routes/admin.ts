import { Hono } from "hono";
import type { Bindings } from "../index";
import { requireVerified } from "../middleware/auth";

export const admin = new Hono<{ Bindings: Bindings; Variables: { userId: string; isAdmin: boolean } }>();

admin.use("*", requireVerified);
admin.use("*", async (c, next) => {
  if (!c.get("isAdmin")) {
    return c.json({ error: "Admin only" }, 403);
  }
  await next();
});

admin.get("/verifications", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, username, school, status, verification_doc_key
     FROM users WHERE verification_state = 'pending' ORDER BY created_at ASC`
  ).all();
  return c.json({ users: results });
});

admin.post("/verifications/:userId/approve", async (c) => {
  const userId = c.req.param("userId");
  const result = await c.env.DB.prepare("UPDATE users SET verification_state = 'verified' WHERE id = ?")
    .bind(userId)
    .run();
  if (result.meta.changes === 0) {
    return c.json({ error: "User not found" }, 404);
  }
  return c.json({ message: "Approved" });
});

admin.post("/verifications/:userId/reject", async (c) => {
  const userId = c.req.param("userId");
  const result = await c.env.DB.prepare("UPDATE users SET verification_state = 'rejected' WHERE id = ?")
    .bind(userId)
    .run();
  if (result.meta.changes === 0) {
    return c.json({ error: "User not found" }, 404);
  }
  return c.json({ message: "Rejected" });
});

admin.get("/reports", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, reporter_id, target_type, target_id, reason, created_at FROM reports WHERE status = 'open' ORDER BY created_at ASC"
  ).all();
  return c.json({ reports: results });
});
