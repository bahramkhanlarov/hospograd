import { Hono } from "hono";
import type { Bindings } from "../index";
import { requireAuth } from "../middleware/auth";
import { newId } from "../lib/id";

export const uploads = new Hono<{ Bindings: Bindings; Variables: { userId: string } }>();

uploads.post("/", requireAuth, async (c) => {
  const form = await c.req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return c.json({ error: "file is required and must be a file upload" }, 400);
  }

  if (file.size > 10 * 1024 * 1024) {
    return c.json({ error: "File too large. Maximum 10 MB." }, 400);
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return c.json({ error: "Only JPEG, PNG, WebP, and GIF images are allowed." }, 400);
  }

  const ext = file.name.split(".").pop() || "jpg";
  const key = `posts/${c.get("userId")}/${newId()}.${ext}`;

  await c.env.UPLOADS.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return c.json({ key }, 201);
});