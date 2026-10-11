// Connection to the PostgreSQL database (hosted on Supabase), using the `postgres` library.
// Server-only: never import this from a Client Component.
import postgres from "postgres";
import type { Database, Task, TimeEntry } from "./types";

// In development, Next.js reloads modules on every save. Keeping the client on globalThis
// stops each reload from opening a new set of connections.
const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

function createClient(): postgres.Sql {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add your Supabase connection string to .env.local (see .env.example).");
  }
  return postgres(url, {
    ssl: "require",
    prepare: false, // required by Supabase's connection pooler (transaction mode)
    max: 5, // a small pool is plenty for one user, and is friendly to serverless hosts like Vercel
  });
}

/** The shared database client. Use it as a tagged template: sql`select ...` */
export function db(): postgres.Sql {
  globalForDb.sql ??= createClient();
  return globalForDb.sql;
}

/** True if the value looks like a UUID (our ids). Checked before queries so bad ids return "not found". */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

// --- Converting database rows (snake_case, Date objects) into the app's types (camelCase, ISO strings)

interface TaskRow {
  id: string;
  title: string;
  notes: string;
  category: Task["category"];
  status: Task["status"];
  created_at: Date;
}

export interface EntryRow {
  id: string;
  task_id: string;
  start_at: Date;
  end_at: Date | null;
  note: string;
}

export function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    category: row.category,
    status: row.status,
    createdAt: row.created_at.toISOString(),
  };
}

export function toEntry(row: EntryRow): TimeEntry {
  return {
    id: row.id,
    taskId: row.task_id,
    start: row.start_at.toISOString(),
    end: row.end_at ? row.end_at.toISOString() : null,
    note: row.note,
  };
}

/** Loads all tasks and time entries. Fine for one person's data, and keeps the totals code simple. */
export async function readDb(): Promise<Database> {
  const sql = db();
  const [tasks, entries] = await Promise.all([
    sql<TaskRow[]>`select id, title, notes, category, status, created_at from tasks`,
    sql<EntryRow[]>`select id, task_id, start_at, end_at, note from time_entries`,
  ]);
  return { tasks: tasks.map(toTask), entries: entries.map(toEntry) };
}
