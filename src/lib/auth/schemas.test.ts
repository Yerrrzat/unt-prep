import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema, safeRedirect, toFieldErrors } from "./schemas";

describe("registerSchema", () => {
  const valid = { name: "Айгерім", email: "  Aigerim@Example.KZ ", password: "secret123", confirmPassword: "secret123" };

  it("normalizes the email", () => {
    expect(registerSchema.parse(valid).email).toBe("aigerim@example.kz");
  });

  it("reports mismatched passwords on confirmPassword", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "other" });
    expect(result.success).toBe(false);
    if (!result.success) expect(toFieldErrors(result.error).confirmPassword).toMatch(/сәйкес/);
  });

  it("requires 8+ character passwords and a valid email", () => {
    const result = registerSchema.safeParse({ ...valid, email: "nope", password: "short", confirmPassword: "short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = toFieldErrors(result.error);
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    }
  });
});

describe("loginSchema", () => {
  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.kz", password: "" }).success).toBe(false);
  });
});

describe("safeRedirect", () => {
  it.each([
    ["/dashboard", "/dashboard"],
    ["/profile?x=1", "/profile?x=1"],
    ["http://localhost:3000/profile?tab=1", "/profile?tab=1"],
    ["https://evil.example", "/"],
    ["https://evil.example/steal", "/steal"],
    ["//evil.example/x", "/x"],
    ["/\\evil.example", "/"],
    ["javascript:alert(1)", "/dashboard"],
    ["", "/dashboard"],
    [undefined, "/dashboard"],
  ])("%s -> %s", (input, expected) => {
    expect(safeRedirect(input)).toBe(expected);
  });
});
