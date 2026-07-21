import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("POST /auth/login", () => {
  it("logs in with correct credentials and sets a session cookie", async () => {
    await SELF.fetch("https://example.com/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "loginuser",
        email: "login@ehl.ch",
        password: "correct-password-1",
        school: "EHL",
        status: "student",
      }),
    });

    const res = await SELF.fetch("https://example.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "loginuser", password: "correct-password-1" }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toMatch(/session=/);
  });

  it("rejects an incorrect password", async () => {
    await SELF.fetch("https://example.com/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "loginuser2",
        email: "login2@ehl.ch",
        password: "correct-password-1",
        school: "EHL",
        status: "student",
      }),
    });
    const res = await SELF.fetch("https://example.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "loginuser2", password: "wrong-password" }),
    });
    expect(res.status).toBe(401);
  });
});
