// Read-only queries. These turn the raw database into what the pages need to display.
import { readDb } from "./db";
import { dateKey, entryDuration, startOfDay, TIME_ZONE } from "./time";
import type {
  CategoryFilter,
  Database,
  StatusFilter,
  Task,
  TaskCategory,
  TaskWithTime,
  TimeEntry,
} from "./types";

function withTime(task: Task, entries: TimeEntry[], now: number): TaskWithTime {
  const mine = entries.filter((e) => e.taskId === task.id);
  const running = mine.find((e) => e.end === null);
  const totalMs = mine
    .filter((e) => e.end !== null)
    .reduce((sum, e) => sum + entryDuration(e, now), 0);
  return { ...task, totalMs, runningSince: running?.start ?? null };
}

export async function getTasks(
  options: { status?: StatusFilter; category?: CategoryFilter; query?: string } = {},
): Promise<TaskWithTime[]> {
  const { status = "all", category = "all", query = "" } = options;
  const db = await readDb();
  const now = Date.now();
  const q = query.trim().toLowerCase();

  return db.tasks
    .filter((t) => status === "all" || (status === "active" ? t.status === "todo" : t.status === "done"))
    .filter((t) => category === "all" || t.category === category)
    .filter((t) => !q || t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q))
    .map((t) => withTime(t, db.entries, now))
    // Unfinished first, then newest first.
    .sort((a, b) =>
      a.status !== b.status ? (a.status === "todo" ? -1 : 1) : b.createdAt.localeCompare(a.createdAt),
    );
}

export async function getTask(
  id: string,
): Promise<{ task: TaskWithTime; entries: TimeEntry[] } | null> {
  const db = await readDb();
  const task = db.tasks.find((t) => t.id === id);
  if (!task) return null;
  const entries = db.entries
    .filter((e) => e.taskId === id)
    .sort((a, b) => b.start.localeCompare(a.start));
  return { task: withTime(task, db.entries, Date.now()), entries };
}

/** The timer that is currently running (only one at a time), with its task. */
export async function getRunningTimer(): Promise<{ entry: TimeEntry; task: Task } | null> {
  const db = await readDb();
  return findRunning(db);
}

export function findRunning(db: Database): { entry: TimeEntry; task: Task } | null {
  const entry = db.entries.find((e) => e.end === null);
  const task = entry && db.tasks.find((t) => t.id === entry.taskId);
  return entry && task ? { entry, task } : null;
}

export interface DashboardSummary {
  todayMs: number;
  weekMs: number;
  openTasks: number;
  doneTasks: number;
  byCategory: Record<TaskCategory, number>;
  topTasks: { id: string; title: string; category: TaskCategory; ms: number }[];
  recent: (TimeEntry & { taskTitle: string; ms: number })[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const db = await readDb();
  const now = Date.now();
  const today = startOfDay(new Date(now)).getTime();
  const weekAgo = startOfDay(new Date(now), -6).getTime();
  const taskById = new Map(db.tasks.map((t) => [t.id, t]));

  let todayMs = 0;
  let weekMs = 0;
  const byCategory: Record<TaskCategory, number> = { task: 0, training: 0 };
  const perTask = new Map<string, number>();

  for (const entry of db.entries) {
    const task = taskById.get(entry.taskId);
    if (!task) continue;
    const ms = entryDuration(entry, now);
    const start = new Date(entry.start).getTime();
    if (start >= today) todayMs += ms;
    if (start >= weekAgo) weekMs += ms;
    byCategory[task.category] += ms;
    perTask.set(task.id, (perTask.get(task.id) ?? 0) + ms);
  }

  const topTasks = [...perTask.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, ms]) => {
      const task = taskById.get(id)!;
      return { id, title: task.title, category: task.category, ms };
    });

  const recent = db.entries
    .filter((e) => e.end !== null && taskById.has(e.taskId))
    .sort((a, b) => b.start.localeCompare(a.start))
    .slice(0, 6)
    .map((e) => ({ ...e, taskTitle: taskById.get(e.taskId)!.title, ms: entryDuration(e, now) }));

  return {
    todayMs,
    weekMs,
    openTasks: db.tasks.filter((t) => t.status === "todo").length,
    doneTasks: db.tasks.filter((t) => t.status === "done").length,
    byCategory,
    topTasks,
    recent,
  };
}

export interface DayTotal {
  date: string; // YYYY-MM-DD
  label: string; // e.g. "Mon 6"
  task: number;
  training: number;
}

/** Time per day for the last `days` days, split by category. Used by the /report page. */
export async function getDailyTotals(days = 7): Promise<DayTotal[]> {
  const db = await readDb();
  const now = Date.now();
  const taskById = new Map(db.tasks.map((t) => [t.id, t]));

  const result: DayTotal[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = startOfDay(new Date(now), -i);
    const next = startOfDay(new Date(now), -i + 1);

    const totals = { task: 0, training: 0 };
    for (const entry of db.entries) {
      const start = new Date(entry.start).getTime();
      const task = taskById.get(entry.taskId);
      if (task && start >= day.getTime() && start < next.getTime()) {
        totals[task.category] += entryDuration(entry, now);
      }
    }
    result.push({
      date: dateKey(day),
      label: day.toLocaleDateString("en-US", { timeZone: TIME_ZONE, weekday: "short", day: "numeric" }),
      ...totals,
    });
  }
  return result;
}
