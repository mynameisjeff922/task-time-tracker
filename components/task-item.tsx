// One row in the task list. A Server Component that uses small Client Components for interactivity.
import Link from "next/link";
import { deleteTask, toggleTask } from "@/lib/actions";
import type { TaskWithTime } from "@/lib/types";
import CategoryBadge from "./category-badge";
import DeleteButton from "./delete-button";
import TimerButton from "./timer-button";

export default function TaskItem({ task, serverNow }: { task: TaskWithTime; serverNow: number }) {
  const done = task.status === "done";
  const running = task.runningSince !== null;

  return (
    <li
      className={`flex flex-wrap items-center gap-3 rounded-lg border bg-surface px-4 py-3 ${
        running ? "border-accent ring-1 ring-accent/30" : "border-line"
      }`}
    >
      {/* .bind() fills in the task id, so the form can call toggleTask(task.id) */}
      <form action={toggleTask.bind(null, task.id)}>
        <button
          type="submit"
          aria-label={done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
          className={`flex size-5 items-center justify-center rounded border-2 ${
            done ? "border-accent bg-accent text-white" : "border-line hover:border-accent"
          }`}
        >
          {done && (
            <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="m2.5 6.5 2.5 2.5 4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </form>

      <div className="min-w-0 flex-1">
        <Link href={`/tasks/${task.id}`} className={`font-medium hover:text-accent hover:underline ${done ? "text-muted line-through" : ""}`}>
          {task.title}
        </Link>
        <div className="mt-0.5 flex items-center gap-2">
          <CategoryBadge category={task.category} />
          {task.notes && <span className="truncate text-xs text-muted">{task.notes}</span>}
        </div>
      </div>

      <TimerButton
        taskId={task.id}
        totalMs={task.totalMs}
        runningSince={task.runningSince}
        serverNow={serverNow}
        disabled={done}
      />
      <DeleteButton
        action={deleteTask.bind(null, task.id, undefined)}
        confirmText={`Delete "${task.title}" and all its time entries?`}
      />
    </li>
  );
}
