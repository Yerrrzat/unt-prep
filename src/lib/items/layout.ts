import type { ItemType } from "@/generated/prisma/enums";

export const ITEMS_PER_VARIANT = 40;

/** ҰБТ informatics layout: which item type sits at which position and what it is worth. */
export const ITEM_LAYOUT: ReadonlyArray<{ from: number; to: number; type: ItemType; points: number }> = [
  { from: 1, to: 25, type: "single", points: 1 },
  { from: 26, to: 30, type: "context", points: 1 },
  { from: 31, to: 35, type: "matching", points: 2 },
  { from: 36, to: 40, type: "multiple", points: 2 },
];

export const MAX_SCORE = ITEM_LAYOUT.reduce((sum, part) => sum + (part.to - part.from + 1) * part.points, 0);

export function layoutFor(number: number) {
  const part = ITEM_LAYOUT.find((p) => number >= p.from && number <= p.to);
  if (!part) throw new RangeError(`Item number must be 1–${ITEMS_PER_VARIANT}, got ${number}`);
  return { type: part.type, points: part.points };
}
