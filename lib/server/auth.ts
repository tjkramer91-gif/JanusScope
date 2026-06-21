import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { logEvent } from "@/lib/server/logger";

const SESSION_COOKIE = "subscope_session";
const STATE_COOKIE = "subscope_auth_state";

export interface SessionUser {
  id: string;
  auth0UserId: string;
  email: string;
  name: string;
}

interface SessionPayload {
  user: SessionUser;
  exp: number;
}

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.AUTH0_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET or AUTH0_SECRET must be configured in production.");
  }
  return "local-dev-subscope-secret-change-me";
}

function sign(value: string): string {
  return crypto.createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

function encodeSession(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodeSession(value?: string): SessionPayload | null {
  if (!value) return null;
  const [body, signature] = value.split(".");
  if (!body || !signature || sign(body) !== signature) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const cookieValue = cookieStore.get(SESSION_COOKIE)?.value;
  const forwardedValue =
    headerStore.get("x-subscope-session-verified") === "1"
      ? headerStore.get("x-subscope-session") ?? undefined
      : undefined;
  const payload = decodeSession(cookieValue ?? forwardedValue);
  return payload?.user ?? null;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    const headerStore = await headers();
    const requestedPath = headerStore.get("x-subscope-request-path") ?? "/app/dashboard";
    const returnTo = requestedPath.startsWith("/app") ? requestedPath : "/app/dashboard";
    logEvent("warn", "auth.required.redirect", { destination: "/auth/login" });
    redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  }
  return user;
}

export async function setSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE,
    encodeSession({ user, exp: Date.now() + 1000 * 60 * 60 * 12 }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    },
  );
  logEvent("info", "auth.session.created", { userId: user.id });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(STATE_COOKIE);
  logEvent("info", "auth.session.cleared");
}

export function hasAuth0Config(): boolean {
  return Boolean(
    process.env.AUTH0_BASE_URL &&
      process.env.AUTH0_ISSUER_BASE_URL &&
      process.env.AUTH0_CLIENT_ID &&
      process.env.AUTH0_CLIENT_SECRET,
  );
}

export function isDemoAccessEnabled(): boolean {
  return process.env.ENABLE_DEMO_ACCESS === "true" || process.env.NODE_ENV !== "production";
}

export async function createLoginState(returnTo: string, mfa: boolean): Promise<string> {
  const state = crypto.randomBytes(24).toString("base64url");
  const cookieStore = await cookies();
  cookieStore.set(
    STATE_COOKIE,
    encodeSession({
      user: {
        id: state,
        auth0UserId: state,
        email: returnTo,
        name: mfa ? "mfa" : "login",
      },
      exp: Date.now() + 1000 * 60 * 10,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10,
    },
  );
  return state;
}

export async function readLoginState(expectedState: string): Promise<{ returnTo: string; mfa: boolean } | null> {
  const cookieStore = await cookies();
  const payload = decodeSession(cookieStore.get(STATE_COOKIE)?.value);
  if (!payload || payload.user.id !== expectedState) return null;
  cookieStore.delete(STATE_COOKIE);
  return {
    returnTo: payload.user.email || "/app/dashboard",
    mfa: payload.user.name === "mfa",
  };
}

export function makeDemoUser(): SessionUser {
  return {
    id: "demo-user",
    auth0UserId: "demo|subscope",
    email: "demo@januscope.local",
    name: "Demo Reviewer",
  };
}

export function makeLocalDevUser(): SessionUser {
  return makeDemoUser();
}

export function decodeJwtPayload(idToken: string): Record<string, unknown> {
  const payload = idToken.split(".")[1];
  if (!payload) return {};
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<string, unknown>;
}
