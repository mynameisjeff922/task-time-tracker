import Link from "next/link";
import { connection } from "next/server";
import { requireUser } from "@/lib/auth";
import CategoryBadge from "@/components/category-badge";
import TimerButton from "@/components/timer-button";
import { getDashboardSummary, getRunningTimer, getTask } from "@/lib/data";
import { currentTime, formatDateTime, formatDuration } from "@/lib/time";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  await connection(); // always render with fresh data at request time
  await requireUser(); // logged-out visitors are sent to /login
  // Fetch in parallel instead of one after another.
  const [summary, running] = await Promise.all([getDashboardSummary(), getRunningTimer()]);
  const runningTask = running ? await getTask(running.task.id) : null;
  const serverNow = currentTime();
  const totalTracked = summary.byCategory.task + summary.byCategory.training;
  const trainingShare = totalTracked ? Math.round((summary.byCategory.training / totalTracked) * 100) : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Currently running timer */}
      <section aria-labelledby="now-heading" className="rounded-xl border border-line bg-surface p-5">
        <h2 id="now-heading" className="text-xs font-medium uppercase tracking-wide text-muted">Now tracking</h2>
        {runningTask ? (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link href={`/tasks/${runningTask.task.id}`} className="text-lg font-semibold hover:text-accent hover:underline">
                {runningTask.task.title}
              </Link>
              <div className="mt-1"><CategoryBadge category={runningTask.task.category} /></div>
            </div>
            <TimerButton
              taskId={runningTask.task.id}
              totalMs={runningTask.task.totalMs}
              runningSince={runningTask.task.runningSince}
              serverNow={serverNow}
              size="lg"
            />
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">
            No timer running. Go to <Link href="/tasks" className="font-medium text-accent hover:underline">Tasks</Link> and press Start on what you&apos;re working on.
          </p>
        )}
      </section>

      {/* Stat cards */}
      <section aria-label="Summary" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Today" value={formatDuration(summary.todayMs)} />
        <Stat label="Last 7 days" value={formatDuration(summary.weekMs)} />
        <Stat label="Open tasks" value={String(summary.openTasks)} hint={`${summary.doneTasks} done`} />
        <Stat label="Time on training" value={`${trainingShare}%`} hint={formatDuration(summary.byCategory.training)} />
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Where time went */}
        <section aria-labelledby="top-heading" className="rounded-xl border border-line bg-surface p-5">
          <h2 id="top-heading" className="font-semibold">Most time spent</h2>
          {summary.topTasks.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No time tracked yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {summary.topTasks.map((t) => (
                <li key={t.id}>
                  <div className="flex justify-between gap-3 text-sm">
                    <Link href={`/tasks/${t.id}`} className="truncate hover:text-accent hover:underline">{t.title}</Link>
                    <span className="shrink-0 tabular-nums text-muted">{formatDuration(t.ms)}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-subtle">
                    <div
                      className={`h-2 rounded-full ${t.category === "training" ? "bg-training" : "bg-accent"}`}
                      style={{ width: `${Math.max(4, (t.ms / summary.topTasks[0].ms) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent entries */}
        <section aria-labelledby="recent-heading" className="rounded-xl border border-line bg-surface p-5">
          <h2 id="recent-heading" className="font-semibold">Recent sessions</h2>
          {summary.recent.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nothing yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line text-sm">
              {summary.recent.map((e) => (
                <li key={e.id} className="flex justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <Link href={`/tasks/${e.taskId}`} className="block truncate hover:text-accent hover:underline">{e.taskTitle}</Link>
                    <span className="text-xs text-muted">{formatDateTime(e.start)}{e.note && ` · ${e.note}`}</span>
                  </div>
                  <span className="shrink-0 tabular-nums">{formatDuration(e.ms)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="text-xs text-muted">{hint}</div>}
    </div>
  );
}
