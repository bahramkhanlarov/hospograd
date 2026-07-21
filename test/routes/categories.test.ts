import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("GET /categories", () => {
  it("returns the 7 seeded categories", async () => {
    const res = await SELF.fetch("https://example.com/categories");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { categories: { slug: string }[] };
    expect(body.categories).toHaveLength(7);
  });
});
