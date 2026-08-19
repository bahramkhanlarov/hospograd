import { Hono } from "hono";
import type { Bindings } from "../index";
import { requireAuth } from "../middleware/auth";

export const invite = new Hono<{
  Bindings: Bindings;
  Variables: { userId: string };
}>();

// Returns the logged-in user's invite link (username is the ref) and how many
// accounts have signed up through it. Used by the /invite page to show the
// loop working; the share URL is built client-side from the username.
invite.get("/", requireAuth, async (c) => {
  const userId = c.get("userId");
  const user = await c.env.DB.prepare("SELECT username FROM users WHERE id = ?")
    .bind(userId)
    .first<{ username: string }>();

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT COUNT(*) AS n FROM users WHERE invited_by = ?"
  )
    .bind(userId)
    .all<{ n: number }>();
  const invitees = Number(results[0]?.n ?? 0);

  return c.json({ username: user.username, invitees });
});
