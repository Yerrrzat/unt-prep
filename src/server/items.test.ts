import { describe, expect, it } from "vitest";

import { matchingItem, singleItem } from "@/test/fixtures";

import { parseItem, toPublicItem } from "./items";

describe("parseItem", () => {
  it("accepts valid items", () => {
    expect(() => parseItem(singleItem)).not.toThrow();
    expect(() => parseItem(matchingItem)).not.toThrow();
  });

  it("rejects an answer hidden inside the public body", () => {
    const body = singleItem.body as { options: object[] };
    const leaky = { ...body, options: [{ id: "a", text: "45", isCorrect: true }, ...body.options.slice(1)] };
    expect(() => parseItem({ ...singleItem, body: leaky })).toThrow();
    expect(() => parseItem({ ...singleItem, body: { ...body, answer: "a" } })).toThrow();
  });

  it("enforces the type and points of each position", () => {
    expect(() => parseItem({ ...singleItem, number: 31 })).toThrow(/must be "matching"/);
    expect(() => parseItem({ ...singleItem, points: 2 })).toThrow(/1 point/);
  });

  it("rejects answer keys that reference unknown options", () => {
    expect(() => parseItem({ ...singleItem, answerKey: { correct: "z" } })).toThrow(/unknown option/);
    expect(() => parseItem({ ...matchingItem, answerKey: { pairs: { "1": "a", "2": "b" } } })).toThrow(
      /every left option/,
    );
    expect(() => parseItem({ ...matchingItem, answerKey: { pairs: { "1": "a", "2": "b", "3": "z" } } })).toThrow(
      /unknown right option/,
    );
  });
});

describe("toPublicItem", () => {
  const row = { id: "00000000-0000-7000-8000-000000000001", ...parseItem(singleItem) };

  it("never includes the answer key or the explanation", () => {
    const view = toPublicItem(row);
    expect(Object.keys(view).sort()).toEqual(["body", "id", "number", "points", "topic", "type"]);
    const json = JSON.stringify(view);
    expect(json).not.toContain("answerKey");
    expect(json).not.toContain("32 + 8 + 4 + 1");
  });

  it("fails closed when a stored body carries extra keys", () => {
    expect(() => toPublicItem({ ...row, body: { ...row.body, correct: "a" } })).toThrow();
  });
});
