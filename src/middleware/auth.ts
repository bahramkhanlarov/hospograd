import { createMiddleware } from "hono/factory";
import type { Bindings } from "../index";
import { verifySessionToken } from "../lib/session";

function readSessionCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/);
  return match ? match[1] : null;
}

export const requireAuth = createMiddleware<{
  Bindings: Bindings;
  Variables: { userId: string };
}>(async (c, next) => {
  const token = readSessionCookie(c.req.header("Cookie"));
  const payload = token ? await verifySessionToken(token, c.env.SESSION_SECRET) : null;
  if (!payload) {
    return c.json({ error: "Authentication required" }, 401);
  }
  c.set("userId", payload.userId);
  await next();
});

export const requireVerified = createMiddleware<{
  Bindings: Bindings;
  Variables: { userId: string; isAdmin: boolean };
}>(async (c, next) => {
  const token = readSessionCookie(c.req.header("Cookie"));
  const payload = token ? await verifySessionToken(token, c.env.SESSION_SECRET) : null;
  if (!payload) {
    return c.json({ error: "Authentication required" }, 401);
  }
  const user = await c.env.DB.prepare("SELECT verification_state, is_admin FROM users WHERE id = ?")
    .bind(payload.userId)
    .first<{ verification_state: string; is_admin: number }>();
  if (!user || user.verification_state !== "verified") {
    return c.json({ error: "Account not verified" }, 403);
  }
  c.set("userId", payload.userId);
  c.set("isAdmin", user.is_admin === 1);
  await next();
});
