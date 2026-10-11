import { db, isUuid } from "./db";
import type { SafeUser, User } from "./types";

/** Looks up a user by id. Only selects the safe columns, so the password hash never leaves the database. */
export async function findSafeUser(userId: string | undefined): Promise<SafeUser | null> {
  if (!isUuid(userId)) return null;
  const [user] = await db()<SafeUser[]>`select id, name, email from users where id = ${userId}`;
  return user ?? null;
}

/** For logging in only: includes the password hash so it can be checked. */
export async function findUserByEmail(email: string): Promise<User | null> {
  const [user] = await db()<User[]>`
    select id, name, email, password_hash as "passwordHash" from users where email = ${email}`;
  return user ?? null;
}

export async function countUsers(): Promise<number> {
  const [{ count }] = await db()<{ count: number }[]>`select count(*)::int as count from users`;
  return count;
}
