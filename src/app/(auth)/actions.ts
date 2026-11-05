"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { Prisma } from "@/generated/prisma/client";
import { loginSchema, registerSchema, safeRedirect, toFieldErrors, type FormState } from "@/lib/auth/schemas";
import { db } from "@/server/db";
import { hashPassword } from "@/server/password";

const INVALID_CREDENTIALS = "Email немесе құпиясөз қате";

async function signInWithPassword(email: string, password: string, redirectTo: string): Promise<FormState> {
  try {
    // On success this throws Next.js' redirect, which must propagate.
    await signIn("credentials", { email, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) return { error: INVALID_CREDENTIALS, values: { email } };
    throw error;
  }
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error), values: { email: String(formData.get("email") ?? "") } };
  }
  const redirectTo = safeRedirect(formData.get("callbackUrl"));
  return signInWithPassword(parsed.data.email, parsed.data.password, redirectTo);
}

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? "") };
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error), values };

  const { name, email, password } = parsed.data;
  try {
    const user = await db.user.create({ data: { name, email, passwordHash: await hashPassword(password) } });
    await db.event.create({ data: { type: "user_registered", userId: user.id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { fieldErrors: { email: "Бұл email-мен тіркелген пайдаланушы бар" }, values };
    }
    throw error;
  }

  return signInWithPassword(email, password, "/dashboard");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
