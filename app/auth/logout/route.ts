import { NextRequest, NextResponse } from "next/server";
import { clearSession, hasAuth0Config } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  await clearSession();

  if (hasAuth0Config()) {
    const logoutUrl = new URL(`${process.env.AUTH0_ISSUER_BASE_URL}/v2/logout`);
    logoutUrl.searchParams.set("client_id", process.env.AUTH0_CLIENT_ID!);
    logoutUrl.searchParams.set("returnTo", process.env.AUTH0_BASE_URL!);
    return NextResponse.redirect(logoutUrl);
  }

  return NextResponse.redirect(new URL("/", request.url));
}
