import type { ItemInput } from "@/server/items";

export const singleItem: ItemInput = {
  number: 1,
  type: "single",
  topic: "number-systems",
  points: 1,
  body: {
    text: "101101₂ санын ондық санау жүйесіне аударыңыз.",
    options: [
      { id: "a", text: "45" },
      { id: "b", text: "43" },
      { id: "c", text: "53" },
      { id: "d", text: "41" },
    ],
  },
  answerKey: { correct: "a" },
  explanation: { text: "1·2⁵ + 0·2⁴ + 1·2³ + 1·2² + 0·2¹ + 1·2⁰ = 32 + 8 + 4 + 1 = 45." },
};

export const matchingItem: ItemInput = {
  number: 31,
  type: "matching",
  topic: "number-systems",
  points: 2,
  body: {
    text: "Сандарды олардың ондық мәндерімен сәйкестендіріңіз.",
    left: [
      { id: "1", text: "1010₂" },
      { id: "2", text: "17₈" },
      { id: "3", text: "1F₁₆" },
    ],
    right: [
      { id: "a", text: "10" },
      { id: "b", text: "15" },
      { id: "c", text: "31" },
      { id: "d", text: "12" },
    ],
  },
  answerKey: { pairs: { "1": "a", "2": "b", "3": "c" } },
  explanation: { text: "1010₂ = 10, 17₈ = 1·8 + 7 = 15, 1F₁₆ = 1·16 + 15 = 31." },
};
