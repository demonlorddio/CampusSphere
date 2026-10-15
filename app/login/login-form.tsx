"use client";

import { useActionState, useState } from "react";
import { signInWithPassword, type LoginActionState } from "../../lib/auth/actions";

const initialState: LoginActionState = { status: "idle" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signInWithPassword, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const hasError = state.status === "error";

  return (
    <form action={formAction} aria-describedby="sign-in-description" aria-labelledby="sign-in-heading" className="mt-8 space-y-5">
      <div>
        <label className="block text-sm font-semibold text-[#263b36] dark:text-[#e5f2ed]" htmlFor="email">
          College email
        </label>
        <input
          aria-describedby={hasError ? "login-error" : undefined}
          aria-invalid={hasError}
          autoComplete="email"
          className="mt-2 block min-h-12 w-full rounded-xl border bg-white/80 px-3.5 text-sm text-[#19322d] outline-none placeholder:text-[#9aa8a3] focus:border-[#69bdb0] focus:ring-4 focus:ring-[#c9ebe2] dark:bg-[#111c1a] dark:text-[#eff9f5] dark:placeholder:text-[#71857f] dark:focus:border-[#3e8f82] dark:focus:ring-[#1b443d]"
          id="email"
          inputMode="email"
          maxLength={320}
          name="email"
          placeholder="you@college.edu"
          required
          type="email"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#263b36] dark:text-[#e5f2ed]" htmlFor="password">
          Password
        </label>
        <div className="relative mt-2">
          <input
            aria-describedby={hasError ? "login-error" : undefined}
            aria-invalid={hasError}
            autoComplete="current-password"
            className="block min-h-12 w-full rounded-xl border bg-white/80 px-3.5 pr-20 text-sm text-[#19322d] outline-none placeholder:text-[#9aa8a3] focus:border-[#69bdb0] focus:ring-4 focus:ring-[#c9ebe2] dark:bg-[#111c1a] dark:text-[#eff9f5] dark:placeholder:text-[#71857f] dark:focus:border-[#3e8f82] dark:focus:ring-[#1b443d]"
            id="password"
            maxLength={128}
            name="password"
            placeholder="Enter your password"
            required
            type={showPassword ? "text" : "password"}
          />
          <button
            aria-controls="password"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-1.5 top-1/2 min-h-11 -translate-y-1/2 rounded-lg px-2.5 text-xs font-bold text-[#54716a] transition-colors hover:bg-[#eaf6f2] hover:text-[#0d7f78] dark:text-[#a3c4bb] dark:hover:bg-[#1b3934] dark:hover:text-[#b8efe1]"
            onClick={() => setShowPassword((visible) => !visible)}
            type="button"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {hasError && (
        <p aria-live="assertive" className="rounded-xl border border-[#efc9b9] bg-[#fff5f0] px-3.5 py-3 text-sm font-medium leading-5 text-[#9c4f31] dark:border-[#6d3c2c] dark:bg-[#321f1a] dark:text-[#ffb293]" id="login-error" role="alert">
          {state.message}
        </p>
      )}

      <p className="text-xs leading-5 text-[#73847e] dark:text-[#9eb3ac]">
        Need access? Ask your college administrator for a demo account. This prototype uses synthetic campus records.
      </p>

      <button
        aria-busy={pending}
        className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#0d7f78] px-4 py-3 text-sm font-bold text-white shadow-[0_12px_22px_-14px_rgba(13,127,120,0.95)] transition-colors hover:bg-[#096c66] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Checking your account…" : "Sign in"}
      </button>
      <p aria-live="polite" className="sr-only">
        {pending ? "Checking your account." : ""}
      </p>
    </form>
  );
}
