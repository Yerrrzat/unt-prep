import { parseEnv } from "@/server/env";

// Fail fast on missing or invalid configuration instead of erroring on the first request.
try {
  parseEnv(process.env);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
