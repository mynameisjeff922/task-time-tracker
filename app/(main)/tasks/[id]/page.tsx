import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { requireUser } from "@/lib/auth";
import CategoryBadge from "@/components/category-badge";
import DeleteButton from "@/components/delete-button";
import LogTimeForm from "@/components/log-time-form";
import TaskForm from "@/components/task-form";
import TimerButton from "@/components/timer-button";
import { deleteEntry, deleteTask, logTime, toggleTask, updateTask } from "@/lib/actions";
import { getTask } from "@/lib/data";
import { currentTime, dateKey, entryDuration, formatDateTime, formatDuration } from "@/lib/time";

// Dynamic route: /tasks/abc-123 -> params.id === "abc-123"
export async function generateMetadata({ params }: PageProps<"/tasks/[id]">): Promise<Metadata> {
  await requireUser();
  const { id } = await params;
  const data = await getTask(id);
  return { title: data?.task.title ?? "Task not found" };
}

export default async function TaskPage({ params }: PageProps<"/tasks/[id]">) {
  await connection();
  await requireUser(); // logged-out visitors are sent to /login
  const { id } = await params;
  const data = await getTask(id);
  if (!data) notFound(); // shows app/tasks/[id]/not-found.tsx

  const { task, entries } = data;
  const serverNow = currentTime();
  const done = task.status === "done";
  const today = dateKey(new Date(serverNow)); // for the date picker

  return (
    <div className="space-y-6">
      <Link href="/tasks" className="text-sm text-muted hover:text-accent">← All tasks</Link>

      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-line bg-surface p-5">
        <div>
          <h1 className={`text-2xl font-semibold ${done ? "text-muted line-through" : ""}`}>{task.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <CategoryBadge category={task.category} />
            <span className="text-muted">Added {formatDateTime(task.createdAt)}</span>
          </div>
          {task.notes && <p className="mt-3 max-w-prose whitespace-pre-wrap text-sm">{task.notes}</p>}
        </div>
        <div className="flex flex-col items-end gap-3">
          <TimerButton
            taskId={task.id}
            totalMs={task.totalMs}
            runningSince={task.runningSince}
            serverNow={serverNow}
            disabled={done}
            size="lg"
          />
          <form action={toggleTask.bind(null, task.id)}>
            <button type="submit" className="rounded-md border border-line px-3 py-1.5 text-sm hover:bg-subtle">
              {done ? "Mark as not done" : "Mark as done"}
            </button>
          </form>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <section aria-labelledby="history-heading" className="rounded-xl border border-line bg-surface p-5">
          <h2 id="history-heading" className="font-semibold">
            Time log <span className="font-normal text-muted">({entries.length} {entries.length === 1 ? "session" : "sessions"})</span>
          </h2>
          {entries.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No time logged yet. Press Start or log time by hand.</p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <thead className="text-left text-xs text-muted">
                <tr>
                  <th className="py-2 font-medium">Started</th>
                  <th className="py-2 font-medium">Note</th>
                  <th className="py-2 text-right font-medium">Duration</th>
                  <th className="py-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="py-2 pr-3">{formatDateTime(entry.start)}</td>
                    <td className="py-2 pr-3 text-muted">{entry.note || "—"}</td>
                    <td className="py-2 text-right tabular-nums">
                      {entry.end ? formatDuration(entryDuration(entry, serverNow)) : <span className="text-accent">running</span>}
                    </td>
                    <td className="py-2 pl-3 text-right">
                      {entry.end && (
                        <DeleteButton action={deleteEntry.bind(null, entry.id)} label="Remove" confirmText="Remove this time entry?" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <div className="space-y-6">
          <section aria-labelledby="log-heading" className="rounded-xl border border-line bg-surface p-5">
            <h2 id="log-heading" className="mb-3 font-semibold">Log time manually</h2>
            <LogTimeForm action={logTime.bind(null, task.id)} today={today} />
          </section>

          <section aria-labelledby="edit-heading" className="rounded-xl border border-line bg-surface p-5">
            <h2 id="edit-heading" className="mb-3 font-semibold">Edit</h2>
            <TaskForm action={updateTask.bind(null, task.id)} initial={task} submitLabel="Save changes" />
            <div className="mt-4 border-t border-line pt-4">
              <DeleteButton
                action={deleteTask.bind(null, task.id, "/tasks")}
                label="Delete this task"
                confirmText={`Delete "${task.title}" and all its time entries?`}
                className="!text-sm !text-danger hover:underline"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
