import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4 py-10">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">ҰБТ · Информатика</p>
        <h1 className="text-3xl font-bold leading-tight">Информатикадан ҰБТ-ға дайындал</h1>
        <p className="text-slate-600">
          40 тапсырмадан тұратын сынақ нұсқаларын шеш, балыңды біл, тақырыптар бойынша меңгеру деңгейін және әр
          тапсырманың талдауын көр.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Link
          href="/register"
          className="rounded-xl bg-brand-600 px-4 py-3 text-center font-semibold text-white hover:bg-brand-700"
        >
          Тіркелу
        </Link>
        <Link
          href="/login"
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-center font-semibold hover:bg-slate-100"
        >
          Кіру
        </Link>
      </div>
    </main>
  );
}
