import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

// Optimistic check: redirects anonymous visitors away from protected pages before rendering.
// Pages still verify the session on the server (see app/(app)/layout.tsx).
export default auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
