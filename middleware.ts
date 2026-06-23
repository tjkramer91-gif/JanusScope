import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = new Set([
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/callback",
  "/auth/logout",
  "/sample-report",
  "/security",
  "/subscope",
  "/trust",
]);

function nextWithSessionHeaders(request: NextRequest): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-subscope-session");
  requestHeaders.delete("x-subscope-session-verified");
  requestHeaders.delete("x-subscope-request-path");
  requestHeaders.set("x-subscope-request-path", `${request.nextUrl.pathname}${request.nextUrl.search}`);

  const sessionCookie = request.cookies.get("subscope_session")?.value;
  if (sessionCookie) {
    requestHeaders.set("x-subscope-session", sessionCookie);
    requestHeaders.set("x-subscope-session-verified", "1");
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.has(path);

  if (isPublic) {
    return nextWithSessionHeaders(request);
  }

  if (request.method === "POST" && request.headers.has("next-action")) {
    return nextWithSessionHeaders(request);
  }

  if (!request.cookies.get("subscope_session")) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("returnTo", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return nextWithSessionHeaders(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:css|js|png|jpg|jpeg|gif|svg|ico|webmanifest)).*)",
  ],
};
