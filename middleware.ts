import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/", "/auth/login", "/auth/signup", "/auth/callback", "/auth/logout"]);

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.has(path);

  if (isPublic) {
    return NextResponse.next();
  }

  if (!request.cookies.get("subscope_session")) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("returnTo", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    console.warn("[subscope]", { event: "route.protected.redirect", path });
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:css|js|png|jpg|jpeg|gif|svg|ico|webmanifest)).*)",
  ],
};
