import { Hono } from "hono";
import { auth } from "./routes/auth";

export type Bindings = {
  DB: D1Database;
  UPLOADS: R2Bucket;
  SESSION_SECRET: string;
  RESEND_API_KEY: string;
};

export const app = new Hono<{ Bindings: Bindings }>();

app.get("/health", (c) => c.json({ ok: true }));
app.route("/auth", auth);

export default app;
