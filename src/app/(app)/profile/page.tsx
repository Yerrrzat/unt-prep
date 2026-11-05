import type { Metadata } from "next";

import { requireUser } from "@/server/session";

import { logoutAction } from "../../(auth)/actions";

export const metadata: Metadata = { title: "Профиль" };

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Профиль</h1>
      <dl className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div>
          <dt className="text-sm text-slate-500">Аты-жөні</dt>
          <dd className="font-medium">{user.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Email</dt>
          <dd className="font-medium">{user.email}</dd>
        </div>
      </dl>
      <form action={logoutAction}>
        <button
          type="submit"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold hover:bg-slate-100"
        >
          Шығу
        </button>
      </form>
    </div>
  );
}
