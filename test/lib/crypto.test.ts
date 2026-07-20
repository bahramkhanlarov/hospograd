import { describe, expect, it } from "vitest";
import { hashSecret, verifySecret } from "../../src/lib/crypto";

describe("crypto", () => {
  it("verifies a matching secret", async () => {
    const stored = await hashSecret("correct-horse");
    expect(await verifySecret("correct-horse", stored)).toBe(true);
  });

  it("rejects a non-matching secret", async () => {
    const stored = await hashSecret("correct-horse");
    expect(await verifySecret("wrong-guess", stored)).toBe(false);
  });

  it("produces a different hash each time due to random salt", async () => {
    const a = await hashSecret("same-input");
    const b = await hashSecret("same-input");
    expect(a).not.toBe(b);
  });
});
