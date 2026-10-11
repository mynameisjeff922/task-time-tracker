// Time helpers. Safe to use on both the server and the client.
import type { TimeEntry } from "./types";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/** 5_430_000 -> "1h 30m", 95_000 -> "1m", 40_000 -> "40s", 0 -> "0m" */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return totalSeconds > 0 ? `${totalSeconds}s` : "0m";
}

/** Stopwatch style: 3725000 -> "01:02:05" */
export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(totalSeconds / 3600))}:${pad(Math.floor((totalSeconds % 3600) / 60))}:${pad(totalSeconds % 60)}`;
}

/** Length of one entry. A running entry counts up to `now`. */
export function entryDuration(entry: TimeEntry, now: number): number {
  const end = entry.end ? new Date(entry.end).getTime() : now;
  return Math.max(0, end - new Date(entry.start).getTime());
}

// --- Time zone
// Servers (like Vercel) run in UTC, so "today" and displayed times use this zone instead.
// NEXT_PUBLIC_ makes it available in the browser too, so server and client render the same text.
export const TIME_ZONE = process.env.NEXT_PUBLIC_TIME_ZONE || "Asia/Manila";

/** The calendar date and clock time of `date` in TIME_ZONE. */
function zonedParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute"), second: get("second") };
}

/** The exact moment that a wall-clock time in TIME_ZONE happens, e.g. zonedTime(2026, 10, 11, 9) = 9:00 AM. */
export function zonedTime(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const p = zonedParts(new Date(guess));
  const offset = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - guess;
  return new Date(guess - offset);
}

/** Midnight (in TIME_ZONE) at the start of `date`'s day, moved by `addDays` days. */
export function startOfDay(date: Date, addDays = 0): Date {
  const p = zonedParts(date);
  return zonedTime(p.year, p.month, p.day + addDays); // Date.UTC rolls day 32 over to the next month
}

/** "YYYY-MM-DD" for `date` in TIME_ZONE (the format <input type="date"> uses). */
export function dateKey(date: Date): string {
  const p = zonedParts(date);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** The current time. Server Components call this after connection(), so it runs once per request. */
export function currentTime(): number {
  return Date.now();
}

export { MINUTE, HOUR };
