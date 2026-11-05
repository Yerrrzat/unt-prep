import { z } from "zod";

/** Runtime configuration. Everything comes from environment variables; nothing is baked into the image. */
const schema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/, message: "must be a postgresql:// URL" }),
  AUTH_SECRET: z.string().min(32, { message: "must be at least 32 characters (openssl rand -base64 32)" }),
  AUTH_URL: z.url().optional(),
  AUTH_TRUST_HOST: z.enum(["true", "false", "1", "0"]).optional(),
});

export type Env = z.infer<typeof schema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = schema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }
  return result.data;
}
