import type { NextAuthConfig } from "next-auth";

/** Routes that require a signed-in user. */
export const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/variants", "/attempts"];
const AUTH_PAGES = ["/login", "/register"];

/**
 * Part of the Auth.js config without the database or password hashing, so the proxy (request
 * interceptor) stays light. The full config with the Credentials provider lives in auth.ts.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const signedIn = Boolean(auth?.user);
      const path = nextUrl.pathname;

      if (PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
        return signedIn; // false -> redirect to pages.signIn with ?callbackUrl=
      }
      if (signedIn && AUTH_PAGES.includes(path)) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id;
      if (token.role) session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
