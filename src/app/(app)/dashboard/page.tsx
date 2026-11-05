import type { Metadata } from "next";

import { MAX_SCORE } from "@/lib/items/layout";
import { db } from "@/server/db";
import { requireUser } from "@/server/session";

export const metadata: Metadata = { title: "Басты бет" };

const dateFormat = new Intl.DateTimeFormat("kk-KZ", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Almaty" });

export default async function DashboardPage() {
  const user = await requireUser();
  const [variants, attempts] = await Promise.all([
    db.variant.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true, durationMinutes: true, _count: { select: { items: true } } },
    }),
    db.attempt.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      take: 10,
      select: { id: true, startedAt: true, submittedAt: true, score: true, variant: { select: { title: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Сәлем, {user.name}!</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Сынақ нұсқалары</h2>
        {variants.length === 0 ? (
          <p className="text-slate-600">Әзірге жарияланған нұсқа жоқ.</p>
        ) : (
          <ul className="space-y-3">
            {variants.map((v) => (
              <li key={v.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-semibold">{v.title}</p>
                <p className="text-sm text-slate-600">
                  {v._count.items} тапсырма · {v.durationMinutes} минут
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Менің нәтижелерім</h2>
        {attempts.length === 0 ? (
          <p className="text-slate-600">Сіз әлі бірде-бір нұсқаны тапсырған жоқсыз.</p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {attempts.map((a) => (
              <li key={a.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{a.variant.title}</p>
                  <p className="text-sm text-slate-600">{dateFormat.format(a.startedAt)}</p>
                </div>
                <p className="font-semibold">
                  {a.submittedAt ? `${a.score ?? 0} / ${MAX_SCORE}` : "Аяқталмаған"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
