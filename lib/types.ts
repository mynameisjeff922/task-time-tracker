// Shared TypeScript types used by both the server and the client.

/** A "task" is regular work; a "training" is a course or tutorial you're studying. */
export type TaskCategory = "task" | "training";

export type TaskStatus = "todo" | "done";

export interface Task {
  id: string;
  title: string;
  notes: string;
  category: TaskCategory;
  status: TaskStatus;
  createdAt: string; // ISO date string
}

/** One block of time spent on a task. `end` is null while the timer is running. */
export interface TimeEntry {
  id: string;
  taskId: string;
  start: string; // ISO date string
  end: string | null;
  note: string;
}

/** A person who can log in. The password is stored only as a bcrypt hash. */
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

/** The user details that are safe to send to the browser (no password hash). */
export type SafeUser = Pick<User, "id" | "name" | "email">;

/** All tasks and time entries, loaded from the database. */
export interface Database {
  tasks: Task[];
  entries: TimeEntry[];
}

/** A task plus calculated time information, ready to display. */
export interface TaskWithTime extends Task {
  totalMs: number; // time from finished entries only
  runningSince: string | null; // start time of the running entry, if any
}

/** Values the task list can be filtered by (from the URL search params). */
export type StatusFilter = "all" | "active" | "done";
export type CategoryFilter = "all" | TaskCategory;

/** Returned by Server Actions so forms can show validation errors. */
export interface FormState {
  errors?: Partial<Record<"title" | "category" | "minutes" | "date" | "email" | "password", string>>;
  message?: string;
  success?: boolean;
  /** What the user typed, so the form can keep it after a failed submit. */
  values?: Record<string, string>;
}
