import "server-only";

import { z } from "zod";

import type { ItemType } from "@/generated/prisma/enums";
import { layoutFor } from "@/lib/items/layout";
import { explanationSchema, itemBodySchemas, type ItemBody } from "@/lib/items/schema";

const id = z.string().trim().min(1).max(16);

/** SERVER ONLY: correct answers. */
export const answerKeySchemas = {
  single: z.strictObject({ correct: id }),
  context: z.strictObject({ correct: id }),
  multiple: z.strictObject({ correct: z.array(id).min(1) }),
  matching: z.strictObject({ pairs: z.record(id, id) }),
} as const;

export type ItemInput = {
  number: number;
  type: ItemType;
  topic: string;
  points: number;
  body: unknown;
  answerKey: unknown;
  explanation: unknown;
};

/**
 * Validates an item before it is written (seed, future admin editor): JSON shapes, the ҰБТ layout
 * (type and points by number) and that the answer key only references existing options.
 */
export function parseItem(input: ItemInput) {
  const expected = layoutFor(input.number);
  if (input.type !== expected.type) {
    throw new Error(`Item ${input.number} must be "${expected.type}", got "${input.type}"`);
  }
  if (input.points !== expected.points) {
    throw new Error(`Item ${input.number} must be worth ${expected.points} point(s), got ${input.points}`);
  }

  const body = itemBodySchemas[input.type].parse(input.body);
  const answerKey = answerKeySchemas[input.type].parse(input.answerKey);
  const explanation = explanationSchema.parse(input.explanation);

  if ("left" in body) {
    const pairs = (answerKey as { pairs: Record<string, string> }).pairs;
    const left = new Set(body.left.map((o) => o.id));
    const right = new Set(body.right.map((o) => o.id));
    const keys = Object.keys(pairs);
    if (keys.length !== left.size || keys.some((k) => !left.has(k))) {
      throw new Error(`Item ${input.number}: answer key must map every left option exactly once`);
    }
    if (Object.values(pairs).some((v) => !right.has(v))) {
      throw new Error(`Item ${input.number}: answer key references an unknown right option`);
    }
  } else {
    const known = new Set(body.options.map((o) => o.id));
    const key = answerKey as { correct: string | string[] };
    const correct = Array.isArray(key.correct) ? key.correct : [key.correct];
    if (correct.some((c) => !known.has(c))) {
      throw new Error(`Item ${input.number}: answer key references an unknown option`);
    }
    if (new Set(correct).size !== correct.length) {
      throw new Error(`Item ${input.number}: answer key has duplicate options`);
    }
  }

  return { ...input, body, answerKey, explanation };
}

/** The only item shape allowed to reach the browser while an attempt is in progress. */
export type PublicItem = {
  id: string;
  number: number;
  type: ItemType;
  topic: string;
  points: number;
  body: ItemBody;
};

/**
 * Builds the public view from an allow-list of fields and re-validates `body` with the strict schema,
 * so the result cannot carry the answer key or explanation even if the input row does.
 */
export function toPublicItem(item: {
  id: string;
  number: number;
  type: ItemType;
  topic: string;
  points: number;
  body: unknown;
}): PublicItem {
  return {
    id: item.id,
    number: item.number,
    type: item.type,
    topic: item.topic,
    points: item.points,
    body: itemBodySchemas[item.type].parse(item.body),
  };
}
