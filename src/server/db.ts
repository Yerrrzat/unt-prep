import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    // Secrets are opt-in per query: answer keys and explanations must never be loaded by accident
    // into data that reaches the browser, and the password hash only when verifying a login.
    omit: {
      item: { answerKey: true, explanation: true },
      user: { passwordHash: true },
    },
  });
}

type Db = ReturnType<typeof createClient>;

// One client per process; survive Next.js dev hot reloads.
const globalForDb = globalThis as unknown as { db?: Db };

export const db: Db = globalForDb.db ?? createClient();

if (process.env.NODE_ENV !== "production") globalForDb.db = db;
