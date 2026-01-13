import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (both pages and API routes)
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Check for Supabase auth cookies
  // Supabase stores session tokens in cookies with dynamic project-specific names
  // They typically contain "-auth-token" in the name
  const cookies = request.cookies;
  let hasAuthCookie = false;

  // Look for any Supabase auth cookie
  cookies.getAll().forEach((cookie) => {
    // Supabase auth cookies contain "-auth-token" in their name
    if (cookie.name.includes("-auth-token")) {
      hasAuthCookie = true;
    }
  });

  // If no auth cookies found, redirect to login
  if (!hasAuthCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User appears to be authenticated (has session cookie), allow the request
  // Note: This is a basic check. Full authentication verification happens client-side
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
