import { NextRequest, NextResponse } from "next/server";
import { decodeJwtPayload, readLoginState, setSession } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (!code || !state) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const loginState = await readLoginState(state);
  if (!loginState) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const response = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      code,
      redirect_uri: `${process.env.AUTH0_BASE_URL}/auth/callback`,
    }),
  });

  if (!response.ok) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const tokenSet = (await response.json()) as { id_token?: string };
  const claims = tokenSet.id_token ? decodeJwtPayload(tokenSet.id_token) : {};
  const auth0UserId = String(claims.sub || "");
  const email = String(claims.email || "unknown@subscope.local");
  const name = String(claims.name || claims.nickname || email);

  await setSession({
    id: auth0UserId.replace(/[^a-zA-Z0-9_-]/g, "_") || "auth0-user",
    auth0UserId,
    email,
    name,
  });

  return NextResponse.redirect(new URL(loginState.returnTo || "/app/dashboard", request.url));
}
