"use server";

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { validateLoginInput } from "@/lib/auth-validation";
import { sessionOptions, type SessionData } from "@/lib/session";

export type LoginFormState = { error?: string } | null;

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const validation = validateLoginInput(
    formData.get("email"),
    formData.get("password"),
  );
  if (!validation.ok) {
    return { error: validation.message };
  }

  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  session.user = { email: validation.email };
  session.isLoggedIn = true;
  await session.save();
  redirect("/");
}

export async function logoutAction() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  session.destroy();
  redirect("/login");
}
