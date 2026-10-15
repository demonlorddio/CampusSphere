function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Supabase uses this error when there is no session in the request. Keeping
 * the check narrow lets a transient auth/network failure render a retry state
 * instead of being mistaken for an anonymous visitor.
 */
export function isMissingAuthSessionError(error: unknown): boolean {
  if (!isRecord(error)) {
    return false;
  }

  const name = typeof error.name === "string" ? error.name : "";
  const code = typeof error.code === "string" ? error.code : "";
  const message = typeof error.message === "string" ? error.message : "";
  const status = typeof error.status === "number" ? error.status : undefined;

  return (
    name === "AuthSessionMissingError" ||
    code === "session_not_found" ||
    code === "session_missing" ||
    /session\s*(is\s*)?missing|no\s+session|not\s+authenticated/i.test(message) ||
    status === 401
  );
}

export function isLikelyNetworkError(error: unknown): boolean {
  if (!isRecord(error)) {
    return false;
  }

  const name = typeof error.name === "string" ? error.name : "";
  const code = typeof error.code === "string" ? error.code : "";
  const status = typeof error.status === "number" ? error.status : undefined;

  return /network|fetch|retry|timeout/i.test(`${name} ${code}`) || status === 0 || (status !== undefined && status >= 500);
}
