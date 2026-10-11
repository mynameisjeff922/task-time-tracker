// Creates, reads and deletes the login cookie (App Router: Server Components, Server Actions, Route Handlers).
import "server-only";
import { cookies } from "next/headers";
import { decrypt, encrypt, SESSION_COOKIE, SESSION_DAYS, type SessionPayload } from "./session-token";

export async function createSession(userId: string): Promise<void> {
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const token = await encrypt({ userId, expiresAt: expires.toISOString() });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, // JavaScript in the browser can't read it
    secure: process.env.NODE_ENV === "production", // HTTPS only once deployed
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function readSession(): Promise<SessionPayload | null> {
  return decrypt((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function deleteSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
