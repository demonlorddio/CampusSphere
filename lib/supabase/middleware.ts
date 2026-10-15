import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseConfig } from "./config";

const CACHE_HEADER_NAMES = ["cache-control", "expires", "pragma"] as const;

function applyPrivateNoStoreHeaders(response: NextResponse): void {
  const existingCacheControl = response.headers.get("cache-control");
  const directives = existingCacheControl
    ? existingCacheControl
        .split(",")
        .map((directive) => directive.trim())
        .filter(Boolean)
    : [];
  const directiveNames = new Set(
    directives.map((directive) => directive.split("=", 1)[0].toLowerCase()),
  );

  if (!directiveNames.has("private")) {
    directives.unshift("private");
  }

  if (!directiveNames.has("no-store")) {
    directives.push("no-store");
  }

  response.headers.set("Cache-Control", directives.join(", "));

  if (!response.headers.has("Expires")) {
    response.headers.set("Expires", "0");
  }

  if (!response.headers.has("Pragma")) {
    response.headers.set("Pragma", "no-cache");
  }
}

function copyResponseState(from: NextResponse, to: NextResponse): void {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });

  CACHE_HEADER_NAMES.forEach((headerName) => {
    const value = from.headers.get(headerName);

    if (value !== null) {
      to.headers.set(headerName, value);
    }
  });
}

function createPrivateResponse(request: NextRequest): NextResponse {
  const response = NextResponse.next({ request });
  applyPrivateNoStoreHeaders(response);
  return response;
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = createPrivateResponse(request);
  const config = getSupabaseConfig();

  if (!config) {
    return supabaseResponse;
  }

  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, cacheHeaders) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        const nextResponse = NextResponse.next({ request });
        copyResponseState(supabaseResponse, nextResponse);

        cookiesToSet.forEach(({ name, value, options }) => {
          nextResponse.cookies.set(name, value, options);
        });

        Object.entries(cacheHeaders ?? {}).forEach(([headerName, value]) => {
          nextResponse.headers.set(headerName, value);
        });

        supabaseResponse = nextResponse;
      },
    },
  });

  try {
    await supabase.auth.getClaims();
  } catch {
    // Middleware refresh failures must not disclose auth or token details.
    // The protected page remains responsible for authorizing its data.
  }

  applyPrivateNoStoreHeaders(supabaseResponse);
  return supabaseResponse;
}
