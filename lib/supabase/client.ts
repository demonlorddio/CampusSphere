"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "./config";

const MISSING_CONFIG_ERROR =
  "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to valid values.";

export function createClient() {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error(MISSING_CONFIG_ERROR);
  }

  return createBrowserClient(config.url, config.publishableKey);
}
