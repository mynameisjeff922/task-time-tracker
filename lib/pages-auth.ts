// Auth for the Pages Router. It can't use cookies() from next/headers,
// so it reads the cookie from the incoming request instead.
import { decrypt, SESSION_COOKIE } from "./session-token";
import { findSafeUser } from "./users";
import type { SafeUser } from "./types";

export async function getUserFromCookies(cookies: Partial<Record<string, string>>): Promise<SafeUser | null> {
  const session = await decrypt(cookies[SESSION_COOKIE]);
  return findSafeUser(session?.userId);
}
