const PUBLISHABLE_KEY_PREFIX = "sb_publishable_";

function isLoopbackHost(hostname: string): boolean {
  const normalizedHostname = hostname.toLowerCase();

  return (
    normalizedHostname === "localhost" ||
    normalizedHostname === "127.0.0.1" ||
    normalizedHostname === "[::1]" ||
    normalizedHostname === "::1"
  );
}

function isValidSupabaseUrl(value: string): boolean {
  if (value.length === 0 || value !== value.trim() || /\s/.test(value)) {
    return false;
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    return false;
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return false;
  }

  const authorityMatch = value.match(/^https?:\/\/([^/?#]*)/i);
  const authority = authorityMatch?.[1];

  if (
    !authority ||
    authority.includes("@") ||
    parsedUrl.username !== "" ||
    parsedUrl.password !== ""
  ) {
    return false;
  }

  const path = authorityMatch
    ? value.slice(authorityMatch[0].length).split(/[?#]/, 1)[0]
    : "";

  if (
    value.includes("?") ||
    value.includes("#") ||
    (path !== "" && path !== "/") ||
    parsedUrl.pathname !== "/" ||
    parsedUrl.hostname === ""
  ) {
    return false;
  }

  return parsedUrl.protocol === "https:" || isLoopbackHost(parsedUrl.hostname);
}

function isValidPublishableKey(value: string): boolean {
  return (
    value.length > PUBLISHABLE_KEY_PREFIX.length &&
    value === value.trim() &&
    !/\s/.test(value) &&
    value.startsWith(PUBLISHABLE_KEY_PREFIX)
  );
}

export function getSupabaseConfig(): {
  url: string;
  publishableKey: string;
} | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (
    typeof url !== "string" ||
    typeof publishableKey !== "string" ||
    !isValidSupabaseUrl(url) ||
    !isValidPublishableKey(publishableKey)
  ) {
    return null;
  }

  return { url, publishableKey };
}
