import { NextRequest, NextResponse } from "next/server";
import { createLoginState, hasAuth0Config, makeLocalDevUser, setSession } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("returnTo") || "/app/dashboard";
  const mfa = request.nextUrl.searchParams.get("mfa") === "1";

  if (!hasAuth0Config()) {
    await setSession(makeLocalDevUser());
    return NextResponse.redirect(new URL(returnTo, request.url));
  }

  const state = await createLoginState(returnTo, mfa);
  const authorizeUrl = new URL(`${process.env.AUTH0_ISSUER_BASE_URL}/authorize`);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", process.env.AUTH0_CLIENT_ID!);
  authorizeUrl.searchParams.set("redirect_uri", `${process.env.AUTH0_BASE_URL}/auth/callback`);
  authorizeUrl.searchParams.set("scope", "openid profile email");
  authorizeUrl.searchParams.set("state", state);
  if (mfa) {
    authorizeUrl.searchParams.set("acr_values", "http://schemas.openid.net/pape/policies/2007/06/multi-factor");
  }

  return NextResponse.redirect(authorizeUrl);
}
