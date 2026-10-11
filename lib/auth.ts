// Data Access Layer for auth: the one place that decides who the current user is.
// Every page, Server Action and Route Handler calls these instead of trusting the Proxy alone.
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession } from "./session";
import { findSafeUser } from "./users";
import type { SafeUser } from "./types";

/** The logged-in user, or null. cache() means it's only looked up once per request. */
export const getCurrentUser = cache(async (): Promise<SafeUser | null> => {
  const session = await readSession();
  return findSafeUser(session?.userId);
});

/** Like getCurrentUser, but sends logged-out visitors to the login page. */
export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

