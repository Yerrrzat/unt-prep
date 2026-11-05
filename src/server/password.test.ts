import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("hashes with argon2id and verifies", async () => {
    const stored = await hashPassword("correct horse");
    expect(stored).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword(stored, "correct horse")).toBe(true);
    expect(await verifyPassword(stored, "wrong horse")).toBe(false);
  });

  it("returns false for a malformed hash instead of throwing", async () => {
    expect(await verifyPassword("not-a-hash", "x")).toBe(false);
  });
});
