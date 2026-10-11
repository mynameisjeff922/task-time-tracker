"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession } from "./session";
import type { FormState } from "./types";
import { countUsers, findUserByEmail } from "./users";

/** Only allow redirects to pages on this site (stops /login?from=https://evil.com tricks). */
function safeRedirect(value: FormDataEntryValue | null): string {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/login") ? path : "/";
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = { email };

  const errors: FormState["errors"] = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  if (Object.keys(errors).length > 0) return { errors, values };

  const user = await findUserByEmail(email);
  if (!user && (await countUsers()) === 0) {
    return { message: "No account is set up yet. Add DEMO_USER_* to .env.local and run npm run db:setup.", values };
  }

  // Same message whether the email or the password is wrong, so attackers can't tell which emails exist.
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !ok) return { message: "Incorrect email or password.", values };

  await createSession(user.id);
  redirect(safeRedirect(formData.get("redirectTo")));
}
