import { describe, expect, it } from "vitest";

import { parseEnv } from "./env";

const valid = {
  DATABASE_URL: "postgresql://unt:unt@localhost:5432/unt_prep?schema=public",
  AUTH_SECRET: "x".repeat(44),
};

describe("parseEnv", () => {
  it("accepts a complete configuration", () => {
    expect(parseEnv(valid).DATABASE_URL).toBe(valid.DATABASE_URL);
  });

  it("names every missing or invalid variable", () => {
    expect(() => parseEnv({})).toThrow(/DATABASE_URL[\s\S]*AUTH_SECRET/);
    expect(() => parseEnv({ ...valid, DATABASE_URL: "mysql://x" })).toThrow(/postgresql/);
    expect(() => parseEnv({ ...valid, AUTH_SECRET: "short" })).toThrow(/AUTH_SECRET/);
  });
});
