import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: "Email дұрыс емес" }).max(254, { message: "Email тым ұзын" }));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { message: "Құпиясөзді енгізіңіз" }).max(128),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: "Атыңызды енгізіңіз (кемінде 2 таңба)" })
      .max(100, { message: "Аты тым ұзын" }),
    email,
    password: z
      .string()
      .min(8, { message: "Құпиясөз кемінде 8 таңбадан тұруы керек" })
      .max(128, { message: "Құпиясөз тым ұзын" }),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Құпиясөздер сәйкес келмейді",
    path: ["confirmPassword"],
  });

export type FieldErrors = Partial<Record<string, string>>;

export type FormState = { error?: string; fieldErrors?: FieldErrors; values?: Record<string, string> } | undefined;

/** First message per field, ready for the form. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

/**
 * Turns ?callbackUrl= into a path on this site, to avoid open redirects. Auth.js passes absolute URLs
 * (http://host/dashboard): only their path is kept, so the origin is always our own.
 */
export function safeRedirect(target: unknown, fallback = "/dashboard"): string {
  if (typeof target !== "string" || target === "") return fallback;
  let url: URL;
  try {
    url = new URL(target, "http://internal.invalid");
  } catch {
    return fallback;
  }
  const path = `${url.pathname}${url.search}${url.hash}`;
  // "//evil" or "/\\evil" would be read by browsers as another host.
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return fallback;
  return path;
}
