import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Тіркелу" };

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Тіркелу</h1>
      <RegisterForm />
      <p className="text-center text-sm text-slate-600">
        Аккаунтыңыз бар ма?{" "}
        <Link href="/login" className="font-semibold text-brand-600">
          Кіру
        </Link>
      </p>
    </div>
  );
}
