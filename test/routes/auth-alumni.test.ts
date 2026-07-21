import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

async function signupAlumni(email: string) {
  await SELF.fetch("https://example.com/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: `alum-${email}`,
      email,
      password: "hunter22-password",
      school: "Glion",
      status: "alumni",
    }),
  });
}

describe("POST /auth/alumni-verification", () => {
  it("stores a LinkedIn URL and keeps state pending", async () => {
    await signupAlumni("linkedin@glion.example");
    const form = new FormData();
    form.set("email", "linkedin@glion.example");
    form.set("linkedinUrl", "https://linkedin.com/in/example");

    const res = await SELF.fetch("https://example.com/api/auth/alumni-verification", {
      method: "POST",
      body: form,
    });
    expect(res.status).toBe(200);

    const row = await env.DB.prepare("SELECT verification_state, verification_doc_key FROM users WHERE email = ?")
      .bind("linkedin@glion.example")
      .first<{ verification_state: string; verification_doc_key: string | null }>();
    expect(row?.verification_state).toBe("pending");
  });

  it("uploads a document to R2 and stores its key", async () => {
    await signupAlumni("doc@glion.example");
    const form = new FormData();
    form.set("email", "doc@glion.example");
    form.set("document", new File(["fake-diploma-bytes"], "diploma.png", { type: "image/png" }));

    const res = await SELF.fetch("https://example.com/api/auth/alumni-verification", {
      method: "POST",
      body: form,
    });
    expect(res.status).toBe(200);

    const row = await env.DB.prepare("SELECT verification_doc_key FROM users WHERE email = ?")
      .bind("doc@glion.example")
      .first<{ verification_doc_key: string | null }>();
    expect(row?.verification_doc_key).toBeTruthy();

    const object = await env.UPLOADS.get(row!.verification_doc_key!);
    expect(object).not.toBeNull();
    // Consume the body stream so the R2 object is fully disposed before the
    // test's isolated storage is torn down (an unread ReadableStream left
    // dangling across the SELF/env RPC boundary breaks isolated-storage pop
    // in @cloudflare/vitest-pool-workers -- see its "use the `using` keyword"
    // guidance for JSRPC-crossed resources).
    await object?.arrayBuffer();
  });

  it("rejects when neither linkedinUrl nor document is provided", async () => {
    await signupAlumni("empty@glion.example");
    const form = new FormData();
    form.set("email", "empty@glion.example");

    const res = await SELF.fetch("https://example.com/api/auth/alumni-verification", {
      method: "POST",
      body: form,
    });
    expect(res.status).toBe(400);
  });
});
