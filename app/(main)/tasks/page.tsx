import type { Metadata } from "next";
import { connection } from "next/server";
import { requireUser } from "@/lib/auth";
import FilterTabs from "@/components/filter-tabs";
import Search from "@/components/search";
import TaskForm from "@/components/task-form";
import TaskItem from "@/components/task-item";
import { createTask } from "@/lib/actions";
import { getTasks } from "@/lib/data";
import { parseCategory, parseStatus } from "@/lib/filters";
import { currentTime } from "@/lib/time";

export const metadata: Metadata = { title: "Tasks" };

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "done", label: "Done" },
] as const;

const CATEGORY_OPTIONS = [
  { value: "all", label: "Everything" },
  { value: "task", label: "Tasks" },
  { value: "training", label: "Trainings" },
] as const;

export default async function TasksPage({ searchParams }: PageProps<"/tasks">) {
  await connection();
  await requireUser(); // logged-out visitors are sent to /login
  const raw = await searchParams;
  // Keep only simple string params (?status=done&q=react)
  const params = Object.fromEntries(
    Object.entries(raw).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
  const status = parseStatus(params.status);
  const category = parseCategory(params.category);
  const query = params.q ?? "";

  const tasks = await getTasks({ status, category, query });
  const serverNow = currentTime();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tasks &amp; trainings</h1>

      <section aria-label="Add a task" className="rounded-xl border border-line bg-surface p-4">
        <TaskForm action={createTask} submitLabel="Add" compact />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Search />
        <FilterTabs label="Filter by status" param="status" options={STATUS_OPTIONS} current={status} searchParams={params} />
        <FilterTabs label="Filter by category" param="category" options={CATEGORY_OPTIONS} current={category} searchParams={params} />
      </div>

      {tasks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">
          {query || status !== "all" || category !== "all" ? "No tasks match these filters." : "No tasks yet. Add one above!"}
        </p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} serverNow={serverNow} />
          ))}
        </ul>
      )}
    </div>
  );
}
