import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Next.js middleware for route protection.
 * Auth.js v5 middleware pattern - simpler than v4.
 * Runs on Edge runtime before all requests.
 *
 * Protected routes:
 * - All routes except public ones listed below
 *
 * Public routes:
 * - /login (sign-in page)
 * - /api/auth/* (Auth.js endpoints)
 * - /_next/* (Next.js static assets)
 * - /favicon.ico (browser icon)
 *
 * Behavior:
 * - Authenticated users: access granted to all routes
 * - Unauthenticated users: redirected to /login
 */
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Allow public routes without authentication
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Allow authenticated users to proceed
  return NextResponse.next();
});

/**
 * Matcher configuration.
 * Applies middleware to all routes except static files.
 *
 * Pattern breakdown:
 * - (?!_next/static|_next/image) - Exclude Next.js static assets and images
 * - .* - Match everything else
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
