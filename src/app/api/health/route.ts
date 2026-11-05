import { db } from "@/server/db";

export const dynamic = "force-dynamic";

const DB_TIMEOUT_MS = 2_000;

/** Liveness + readiness probe for the load balancer / container orchestrator. */
export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  try {
    await Promise.race([
      db.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), DB_TIMEOUT_MS)),
    ]);
    return Response.json({ status: "ok", db: "ok" }, { headers });
  } catch (error) {
    console.error("health check failed", error);
    return Response.json({ status: "error", db: "unreachable" }, { status: 503, headers });
  }
}
