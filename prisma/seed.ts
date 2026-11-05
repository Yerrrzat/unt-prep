/**
 * Development seed: one published demo variant with an item of each type.
 * Run with `npm run db:seed` (idempotent: the demo variant is recreated).
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { parseItem, type ItemInput } from "../src/server/items";

const DEMO_TITLE = "Демо нұсқа";

const items: ItemInput[] = [
  {
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
    explanation: {
      text: "Әр цифрды екінің дәрежесіне көбейтеміз: 1·2⁵ + 0·2⁴ + 1·2³ + 1·2² + 0·2¹ + 1·2⁰ = 32 + 8 + 4 + 1 = 45.",
    },
  },
  {
    number: 26,
    type: "context",
    topic: "python-loops",
    points: 1,
    body: {
      context: {
        text: "Төмендегі Python бағдарламасын қарастырыңыз.",
        attachments: [
          {
            kind: "code",
            language: "python",
            code: "s = 0\nfor i in range(1, 12):\n    if i % 4 == 0:\n        s += i\nprint(s)",
          },
        ],
      },
      text: "Бағдарлама экранға қандай мән шығарады?",
      options: [
        { id: "a", text: "66" },
        { id: "b", text: "6" },
        { id: "c", text: "12" },
        { id: "d", text: "24" },
      ],
    },
    answerKey: { correct: "c" },
    explanation: {
      text:
        "range(1, 12) 1-ден 11-ге дейінгі сандарды береді (12 кірмейді). Олардың ішінде 4-ке қалдықсыз бөлінетіндері — 4 және 8, сондықтан s = 4 + 8 = 12. " +
        "24 — 12-ні де қосқанда шығады (range-тің оң шекарасы кірмейді), 66 — шартты елемегенде шығады.",
      attachments: [
        {
          kind: "table",
          caption: "Трассировка",
          header: ["i", "i % 4 == 0", "s"],
          rows: [
            ["1–3", "жоқ", "0"],
            ["4", "иә", "4"],
            ["5–7", "жоқ", "4"],
            ["8", "иә", "12"],
            ["9–11", "жоқ", "12"],
          ],
        },
      ],
    },
  },
  {
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
    explanation: { text: "1010₂ = 8 + 2 = 10; 17₈ = 1·8 + 7 = 15; 1F₁₆ = 1·16 + 15 = 31. 12 — артық нұсқа." },
  },
  {
    number: 36,
    type: "multiple",
    topic: "python-operators",
    points: 2,
    body: {
      text: "Төмендегі Python өрнектерінің қайсылары True мәнін береді? Бірнеше дұрыс жауап болуы мүмкін.",
      options: [
        { id: "a", text: "7 // 2 == 3" },
        { id: "b", text: "7 / 2 == 3" },
        { id: "c", text: "2 ** 3 == 8" },
        { id: "d", text: "10 % 3 == 2" },
        { id: "e", text: "not (3 > 2)" },
      ],
    },
    answerKey: { correct: ["a", "c"] },
    explanation: {
      text: "7 // 2 — бүтін бөлу, нәтижесі 3. 7 / 2 = 3.5. 2 ** 3 = 8. 10 % 3 = 1. 3 > 2 ақиқат, ал not оны False етеді.",
    },
  },
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const parsed = items.map(parseItem);
    await db.$transaction(async (tx) => {
      await tx.variant.deleteMany({ where: { title: DEMO_TITLE, attempts: { none: {} } } });
      const existing = await tx.variant.findFirst({ where: { title: DEMO_TITLE } });
      if (existing) {
        console.log(`"${DEMO_TITLE}" already has attempts; left unchanged.`);
        return;
      }
      await tx.variant.create({
        data: {
          title: DEMO_TITLE,
          isPublished: true,
          items: { create: parsed },
        },
      });
      console.log(`Seeded "${DEMO_TITLE}" with ${parsed.length} items.`);
    });
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
