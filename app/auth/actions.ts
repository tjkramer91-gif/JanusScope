"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { safeReturnTo } from "@/lib/return-to";
import { isDemoAccessEnabled, makeDemoUser, setSession } from "@/lib/server/auth";
import { errorMessage, logEvent } from "@/lib/server/logger";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { createPasswordUser, ensureWorkspace, findPasswordUserByEmail } from "@/lib/server/store";

export interface AuthFormState {
  error: string;
}

const authSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  returnTo: z.string().trim().default("/app/dashboard"),
});

export async function loginAction(_previousState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    returnTo: formData.get("returnTo") || "/app/dashboard",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your email and password." };
  }

  const { email, password, returnTo } = parsed.data;
  try {
    const user = await findPasswordUserByEmail(email);
    const validPassword = user?.passwordHash ? await verifyPassword(password, user.passwordHash) : false;
    if (!user || !validPassword) {
      logEvent("warn", "auth.login.failed", { reason: "invalid_credentials" });
      return { error: "Email or password is incorrect." };
    }

    await setSession({
      id: user.id,
      auth0UserId: user.auth0UserId,
      email: user.email,
      name: user.name,
    });
    logEvent("info", "auth.login.succeeded", { userId: user.id });
  } catch (error) {
    logEvent("error", "auth.login.error", { reason: errorMessage(error) });
    return { error: "Something went wrong signing in. Please try again or contact support." };
  }

  redirect(safeReturnTo(returnTo));
}

export async function signupAction(_previousState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    returnTo: formData.get("returnTo") || "/app/dashboard",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your email and password." };
  }

  const { email, password, returnTo } = parsed.data;
  try {
    const passwordHash = await hashPassword(password);
    const user = await createPasswordUser(email, passwordHash);
    await setSession(user);
    logEvent("info", "auth.signup.succeeded", { userId: user.id });
  } catch (error) {
    logEvent("error", "auth.signup.error", { reason: errorMessage(error) });
    return {
      error: error instanceof Error && error.message.includes("already exists")
        ? "An account already exists for this email. Log in instead."
        : "Something went wrong creating your account. Please try again or contact support.",
    };
  }

  redirect(safeReturnTo(returnTo));
}

export async function demoAccessAction(formData: FormData): Promise<void> {
  const returnTo = String(formData.get("returnTo") || "/app/dashboard");
  if (!isDemoAccessEnabled()) {
    logEvent("warn", "auth.demo.blocked");
    redirect(`/auth/login?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`);
  }
  const user = makeDemoUser();
  await setSession(user);
  await ensureWorkspace(user);
  logEvent("info", "auth.demo.succeeded", { userId: user.id });
  redirect(safeReturnTo(returnTo));
}
