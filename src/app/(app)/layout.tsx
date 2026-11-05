import Link from "next/link";

import { requireUser } from "@/server/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="min-h-dvh pb-20">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="font-bold text-brand-700">
            ҰБТ · Информатика
          </Link>
          <nav className="flex gap-4 text-sm font-medium text-slate-600">
            <Link href="/dashboard">Басты бет</Link>
            <Link href="/profile">Профиль</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
    </div>
  );
}
