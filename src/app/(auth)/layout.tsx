import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 text-sm font-semibold uppercase tracking-wide text-brand-600">
        ҰБТ · Информатика
      </Link>
      {children}
    </main>
  );
}
