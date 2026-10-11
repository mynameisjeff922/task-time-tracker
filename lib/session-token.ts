// Signs and verifies the login cookie using a JWT (JSON Web Token) from the `jose` library.
// No Next.js APIs here, so it works in Proxy, the App Router and the Pages Router.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "session";
export const SESSION_DAYS = 7;

export interface SessionPayload {
  userId: string;
  expiresAt: string;
}

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET is missing or too short. Set it in .env.local (see .env.example).");
  }
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

/** Returns the session if the token is valid and not expired, otherwise null. */
export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return typeof payload.userId === "string" ? (payload as unknown as SessionPayload) : null;
  } catch {
    return null; // tampered with, expired, or signed with a different secret
  }
}
