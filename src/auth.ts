import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { loginSchema } from "@/lib/auth/schemas";
import { db } from "@/server/db";
import { getDummyHash, verifyPassword } from "@/server/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await db.user.findUnique({ where: { email }, omit: { passwordHash: false } });
        const ok = await verifyPassword(user?.passwordHash ?? (await getDummyHash()), password);
        if (!user || !ok) return null;

        await db.event.create({ data: { type: "user_logged_in", userId: user.id } });
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
});
