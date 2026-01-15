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
  
  // Look for any Supabase auth cookie (use some() for early termination)
  const hasAuthCookie = cookies.getAll().some((cookie) => {
    // Supabase auth cookies contain "-auth-token" in their name
    return cookie.name.includes("-auth-token");
  });

  // If no auth cookies found, redirect to login
  if (!hasAuthCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User has a valid session cookie, allow the request
  // The client-side UserContext provides additional UX features like user info and permissions
  return NextResponse.next();
}

// Configure which routes the middleware should run on
// Auth is now handled at the layout level, so middleware is disabled
export const config = {
  matcher: [
    // Empty matcher - middleware is disabled
    // Auth enforcement moved to admin layout
  ],
};
