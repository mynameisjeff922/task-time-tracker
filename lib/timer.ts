// Start/stop logic for the timer. Used by the API Route Handlers in app/api/timer.
import { db, isUuid, toEntry, type EntryRow } from "./db";
import type { TimeEntry } from "./types";

export type StartResult = { ok: true; entry: TimeEntry } | { ok: false; error: string; status: number };

/** Starts a timer for a task. Any other running timer is stopped first (only one at a time). */
export async function startTimer(taskId: string): Promise<StartResult> {
  if (!isUuid(taskId)) return { ok: false, error: "Task not found", status: 404 };

  return db().begin(async (tx) => {
    const [task] = await tx<{ status: string }[]>`select status from tasks where id = ${taskId}`;
    if (!task) return { ok: false, error: "Task not found", status: 404 } as const;
    if (task.status === "done") return { ok: false, error: "Task is already done", status: 400 } as const;

    // "for update" locks the row so two clicks at once can't both start a timer.
    const [running] = await tx<EntryRow[]>`select * from time_entries where end_at is null for update`;
    if (running?.task_id === taskId) return { ok: true, entry: toEntry(running) } as const;
    if (running) await tx`update time_entries set end_at = now() where id = ${running.id}`;

    const [entry] = await tx<EntryRow[]>`
      insert into time_entries (task_id, start_at) values (${taskId}, now()) returning *`;
    return { ok: true, entry: toEntry(entry) } as const;
  });
}

/** Stops whatever timer is running. Returns the finished entry, or null if nothing was running. */
export async function stopTimer(): Promise<TimeEntry | null> {
  const [entry] = await db()<EntryRow[]>`
    update time_entries set end_at = now() where end_at is null returning *`;
  return entry ? toEntry(entry) : null;
}
