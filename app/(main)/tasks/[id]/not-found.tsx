import Link from "next/link";

export default function TaskNotFound() {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-line bg-surface p-6 text-center">
      <h2 className="text-lg font-semibold">Task not found</h2>
      <p className="mt-1 text-sm text-muted">It may have been deleted.</p>
      <Link href="/tasks" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
        Back to tasks
      </Link>
    </div>
  );
}
