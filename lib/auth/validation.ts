export const LOGIN_EMAIL_MAX_LENGTH = 320;
export const LOGIN_PASSWORD_MIN_LENGTH = 6;
export const LOGIN_PASSWORD_MAX_LENGTH = 128;

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginValidationResult =
  | { ok: true; value: LoginInput }
  | { ok: false; message: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Validate the small, server-owned input contract for password sign-in.
 * Password values are intentionally never included in validation messages.
 */
export function validateLoginInput(input: unknown): LoginValidationResult {
  if (!isRecord(input) || typeof input.email !== "string" || typeof input.password !== "string") {
    return { ok: false, message: "Enter your college email and password." };
  }

  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (email.length === 0 || email.length > LOGIN_EMAIL_MAX_LENGTH || !emailPattern.test(email)) {
    return { ok: false, message: "Enter a valid college email address." };
  }

  if (password.length < LOGIN_PASSWORD_MIN_LENGTH || password.length > LOGIN_PASSWORD_MAX_LENGTH) {
    return { ok: false, message: "Enter a valid password and try again." };
  }

  return { ok: true, value: { email, password } };
}

export function parseLoginFormData(formData: FormData): LoginValidationResult {
  const email = formData.get("email");
  const password = formData.get("password");

  return validateLoginInput({
    email: typeof email === "string" ? email : null,
    password: typeof password === "string" ? password : null,
  });
}
