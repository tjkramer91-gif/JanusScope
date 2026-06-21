"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, signupAction, type AuthFormState } from "@/app/auth/actions";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";

const initialState: AuthFormState = { error: "" };

export function AuthForm({ mode, returnTo }: { mode: "login" | "signup"; returnTo: string }) {
  const action = mode === "login" ? loginAction : signupAction;
  const [state, formAction] = useActionState(action, initialState);
  const isLogin = mode === "login";

  return (
    <form action={formAction} className="card mx-auto max-w-[520px] p-8 sm:p-10">
      <input type="hidden" name="returnTo" value={returnTo} />
      <div>
        <p className="eyebrow">{isLogin ? "Log in" : "Create account"}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">
          {isLogin ? "Access your JanusScope workspace" : "Create your JanusScope account"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-moss">
          Use email and password before opening project workspaces, uploads, reports, or dashboard data.
        </p>
      </div>

      {state.error ? (
        <div className="mt-6 rounded-[20px] border border-[#efc0bc] bg-[#fff7f5] p-4 text-sm font-semibold text-brick" role="alert">
          {state.error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-5">
        <label>
          <span className="field-label">Email</span>
          <input className="field" name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          <span className="field-label">Password</span>
          <input
            className="field"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={8}
            required
          />
        </label>
      </div>

      <PendingSubmitButton className="button-primary mt-7 w-full" pendingLabel={isLogin ? "Logging in..." : "Creating account..."}>
        {isLogin ? "Log In" : "Create Account"}
      </PendingSubmitButton>

      <p className="mt-5 text-center text-sm text-moss">
        {isLogin ? "Need an account?" : "Already have an account?"}{" "}
        <Link className="font-semibold text-steel" href={`${isLogin ? "/auth/signup" : "/auth/login"}?returnTo=${encodeURIComponent(returnTo)}`}>
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
