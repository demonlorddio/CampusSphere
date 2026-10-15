"use client";

import { useActionState } from "react";
import { signOut, type SignOutActionState } from "../../lib/auth/actions";

const initialState: SignOutActionState = { status: "idle" };

export default function SignOutForm() {
  const [state, formAction, pending] = useActionState(signOut, initialState);

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      {state.status === "error" && (
        <p aria-live="assertive" className="max-w-xs text-left text-xs font-medium leading-5 text-[#9c4f31] dark:text-[#ffb293] sm:text-right" id="sign-out-error" role="alert">
          {state.message}
        </p>
      )}
      {pending && (
        <p aria-live="polite" className="text-left text-xs font-medium text-[#71827d] dark:text-[#9eb1aa] sm:text-right" role="status">
          Ending this session securely…
        </p>
      )}
      <form action={formAction}>
        <button
          aria-busy={pending}
          aria-describedby={state.status === "error" ? "sign-out-error" : undefined}
          aria-label="Sign out of CampusSphere"
          className="min-h-11 rounded-xl border bg-white/75 px-4 py-2.5 text-sm font-bold text-[#45615a] transition-colors hover:border-[#8bcabd] hover:text-[#0d7f78] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#17211f]/80 dark:text-[#b7cbc4] dark:hover:border-[#386d63] dark:hover:text-[#a3e8d7]"
          disabled={pending}
          type="submit"
        >
          {pending ? "Signing out…" : "Sign out"}
        </button>
      </form>
    </div>
  );
}
