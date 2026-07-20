import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "../../src/lib/session";

describe("session tokens", () => {
  it("round-trips a valid token", async () => {
    const token = await createSessionToken("user-123", "test-secret");
    const payload = await verifySessionToken(token, "test-secret");
    expect(payload?.userId).toBe("user-123");
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken("user-123", "test-secret");
    const payload = await verifySessionToken(token, "wrong-secret");
    expect(payload).toBeNull();
  });

  it("rejects a tampered token", async () => {
    const token = await createSessionToken("user-123", "test-secret");
    const tampered = token.replace(/^.{5}/, "AAAAA");
    expect(await verifySessionToken(tampered, "test-secret")).toBeNull();
  });
});
