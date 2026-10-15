"use server";

import { redirect } from "next/navigation";
import { getSupabaseConfig } from "../supabase/config";
import { createClient } from "../supabase/server";
import { isLikelyNetworkError } from "./errors";
import { parseLoginFormData } from "./validation";

export type LoginActionState =
  | { status: "idle" }
  | { status: "error"; message: string };

export type SignOutActionState =
  | { status: "idle" }
  | { status: "error"; message: string };

const missingConfigMessage =
  "Sign-in is unavailable because the Supabase project is not configured. Ask the project maintainer to add the public project settings, then try again.";
const authFailureMessage = "We couldn't sign you in. Check your email and password and try again.";
const authNetworkMessage = "Sign-in is temporarily unavailable. Check your connection and try again.";
const signOutFailureMessage = "We couldn't end this session. Check your connection and try again.";

export async function signInWithPassword(
  previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  void previousState;

  const input = parseLoginFormData(formData);
  if (!input.ok) {
    return { status: "error", message: input.message };
  }

  if (!getSupabaseConfig()) {
    return { status: "error", message: missingConfigMessage };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(input.value);

    if (error) {
      return {
        status: "error",
        message: isLikelyNetworkError(error) ? authNetworkMessage : authFailureMessage,
      };
    }
  } catch {
    return { status: "error", message: authNetworkMessage };
  }

  redirect("/dashboard");
}

export async function signOut(
  previousState: SignOutActionState,
  _formData: FormData,
): Promise<SignOutActionState> {
  void previousState;

  if (!getSupabaseConfig()) {
    return { status: "error", message: signOutFailureMessage };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      return { status: "error", message: signOutFailureMessage };
    }
  } catch {
    return { status: "error", message: signOutFailureMessage };
  }

  redirect("/login");
}
