import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (both pages and API routes)
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Get Supabase URL and anon key from environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables in middleware");
    return NextResponse.next();
  }

  // Check for Supabase auth cookies
  // Supabase stores session tokens in cookies with names like:
  // sb-<project-ref>-auth-token (newer format)
  // or individual cookies for access/refresh tokens
  const cookies = request.cookies;
  let hasAuthCookie = false;

  // Look for any Supabase auth cookie
  cookies.getAll().forEach((cookie) => {
    if (
      cookie.name.includes("-auth-token") ||
      cookie.name === "sb-access-token" ||
      cookie.name === "sb-refresh-token"
    ) {
      hasAuthCookie = true;
    }
  });

  // If no auth cookies found, redirect to login
  if (!hasAuthCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Create a Supabase client to verify the session
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  try {
    // Extract the access token from cookies
    let accessToken: string | undefined;

    // Try to get token from the newer format first
    for (const cookie of cookies.getAll()) {
      if (cookie.name.includes("-auth-token")) {
        try {
          // The auth-token cookie contains a JSON object with access_token
          const tokenData = JSON.parse(cookie.value);
          accessToken = tokenData.access_token || tokenData[0];
        } catch {
          // If parsing fails, try using the value directly
          accessToken = cookie.value;
        }
        break;
      }
    }

    // Fallback to legacy cookie names
    if (!accessToken) {
      accessToken = cookies.get("sb-access-token")?.value;
    }

    if (!accessToken) {
      // No valid access token found, redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify the access token
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      // Invalid or expired token, redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated, allow the request
    return NextResponse.next();
  } catch (error) {
    console.error("Error verifying authentication in middleware:", error);
    // On error, redirect to login to be safe
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
