"use server";
// Server Actions: functions that run on the server and are called directly from <form action={...}>.
// Anyone can POST to a Server Action directly, so each one checks the login itself (requireUser).
import { revalidatePath } from "next/cache";
import { requireUser } from "./auth";
import { redirect } from "next/navigation";
import { db, isUuid } from "./db";
import { dateKey, MINUTE, zonedTime } from "./time";
import type { FormState, TaskCategory } from "./types";

const CATEGORIES: TaskCategory[] = ["task", "training"];

/** Checks the title/category fields shared by the create and edit forms. */
function readTaskFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const category = String(formData.get("category") ?? "") as TaskCategory;

  const errors: FormState["errors"] = {};
  if (!title) errors.title = "Please enter a title.";
  else if (title.length > 100) errors.title = "Keep the title under 100 characters.";
  if (!CATEGORIES.includes(category)) errors.category = "Pick Task or Training.";

  return { title, notes, category, errors, values: { title, notes, category } };
}

function refresh() {
  // Tell Next.js the pages that show tasks need fresh data.
  revalidatePath("/", "layout");
}

export async function createTask(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const { title, notes, category, errors, values } = readTaskFields(formData);
  if (Object.keys(errors).length > 0) return { errors, values };

  // Values in ${...} are sent separately from the SQL text, so they can't cause SQL injection.
  await db()`insert into tasks (title, notes, category) values (${title}, ${notes}, ${category})`;
  refresh();
  return { success: true, message: `Added "${title}".` };
}

export async function updateTask(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const { title, notes, category, errors, values } = readTaskFields(formData);
  if (Object.keys(errors).length > 0) return { errors, values };

  const updated = isUuid(id)
    ? await db()`update tasks set title = ${title}, notes = ${notes}, category = ${category} where id = ${id} returning id`
    : [];
  if (updated.length === 0) return { message: "That task no longer exists." };
  refresh();
  return { success: true, message: "Saved.", values };
}

export async function toggleTask(id: string): Promise<void> {
  await requireUser();
  if (!isUuid(id)) return;
  // A transaction runs both statements together: either both happen or neither does.
  await db().begin(async (tx) => {
    const [task] = await tx<{ status: string }[]>`
      update tasks set status = case when status = 'done' then 'todo' else 'done' end
      where id = ${id} returning status`;
    // Finishing a task also stops its timer.
    if (task?.status === "done") {
      await tx`update time_entries set end_at = now() where task_id = ${id} and end_at is null`;
    }
  });
  refresh();
}

export async function deleteTask(id: string, redirectTo?: string): Promise<void> {
  await requireUser();
  // "on delete cascade" in db/schema.sql removes the task's time entries too.
  if (isUuid(id)) await db()`delete from tasks where id = ${id}`;
  refresh();
  if (redirectTo) redirect(redirectTo);
}

/** Add time you spent without running the timer (e.g. you studied offline). */
export async function logTime(taskId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const minutes = Number(formData.get("minutes"));
  const date = String(formData.get("date") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const values = { minutes: String(formData.get("minutes") ?? ""), date, note };

  const errors: FormState["errors"] = {};
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 24 * 60) {
    errors.minutes = "Enter whole minutes between 1 and 1440.";
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.date = "Pick a date.";
  if (Object.keys(errors).length > 0) return { errors, values };

  // Today: the block ends now. Another day: the block starts at 9:00 AM that day.
  const now = new Date();
  const [y, m, d] = date.split("-").map(Number);
  const isToday = dateKey(now) === date;
  const start = isToday ? new Date(now.getTime() - minutes * MINUTE) : zonedTime(y, m, d, 9);
  if (start.getTime() > now.getTime()) return { errors: { date: "You can't log time in the future." }, values };
  const end = new Date(start.getTime() + minutes * MINUTE);

  // Only inserts if the task exists.
  const inserted = isUuid(taskId)
    ? await db()`
        insert into time_entries (task_id, start_at, end_at, note)
        select id, ${start}, ${end}, ${note} from tasks where id = ${taskId}
        returning id`
    : [];
  if (inserted.length === 0) return { message: "That task no longer exists." };
  refresh();
  return { success: true, message: `Logged ${minutes} min.` };
}

export async function deleteEntry(entryId: string): Promise<void> {
  await requireUser();
  if (isUuid(entryId)) await db()`delete from time_entries where id = ${entryId}`;
  refresh();
}
