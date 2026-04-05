export type LoginValidationResult =
  | { ok: true; email: string }
  | { ok: false; message: string };

export function validateLoginInput(
  email: unknown,
  password: unknown,
): LoginValidationResult {
  if (typeof email !== "string" || typeof password !== "string") {
    return { ok: false, message: "Email and password are required." };
  }
  const trimmed = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, message: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }
  return { ok: true, email: trimmed };
}
