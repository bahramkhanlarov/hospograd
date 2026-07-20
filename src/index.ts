import { Hono } from "hono";

export type Bindings = {
  DB: D1Database;
  UPLOADS: R2Bucket;
  SESSION_SECRET: string;
  RESEND_API_KEY: string;
};

export const app = new Hono<{ Bindings: Bindings }>();

app.get("/health", (c) => c.json({ ok: true }));

export default app;
