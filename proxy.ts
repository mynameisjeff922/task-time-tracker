// Proxy (called Middleware before Next.js 16) runs before every matching request.
// It's a quick, optimistic check: is there a valid login cookie? The real check
// (does that user still exist?) happens in lib/auth.ts on every page, action and API.
import { NextResponse, type NextRequest } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session-token";

const PUBLIC_PATHS = ["/login", "/api/logout"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await decrypt(request.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = PUBLIC_PATHS.includes(pathname);

  // Already logged in? Skip the login page.
  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!session && !isPublic) {
    // APIs get a JSON error; pages get sent to the login page and come back afterwards.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") loginUrl.searchParams.set("from", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Next.js internals (/_next/...) and images in /public.
  matcher: ["/((?!_next/|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
