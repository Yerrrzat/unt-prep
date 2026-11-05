import type { Metadata } from "next";
import Link from "next/link";

import { safeRedirect } from "@/lib/auth/schemas";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Кіру" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { callbackUrl } = await searchParams;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Кіру</h1>
      <LoginForm callbackUrl={safeRedirect(callbackUrl)} />
      <p className="text-center text-sm text-slate-600">
        Аккаунтыңыз жоқ па?{" "}
        <Link href="/register" className="font-semibold text-brand-600">
          Тіркелу
        </Link>
      </p>
    </div>
  );
}
