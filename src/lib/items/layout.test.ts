import { describe, expect, it } from "vitest";

import { layoutFor, MAX_SCORE } from "./layout";

describe("ҰБТ item layout", () => {
  it.each([
    [1, "single", 1],
    [25, "single", 1],
    [26, "context", 1],
    [30, "context", 1],
    [31, "matching", 2],
    [35, "matching", 2],
    [36, "multiple", 2],
    [40, "multiple", 2],
  ])("item %i is %s worth %i", (number, type, points) => {
    expect(layoutFor(number)).toEqual({ type, points });
  });

  it("rejects numbers outside 1–40", () => {
    expect(() => layoutFor(0)).toThrow(RangeError);
    expect(() => layoutFor(41)).toThrow(RangeError);
  });

  it("adds up to 50 points", () => {
    expect(MAX_SCORE).toBe(50);
  });
});
