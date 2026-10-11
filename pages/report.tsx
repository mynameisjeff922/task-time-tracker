// Pages Router page at /report.
// getServerSideProps runs on the server for every request, and its result becomes the page's props.
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { getUserFromCookies } from "@/lib/pages-auth";
import { getDailyTotals, getTasks, type DayTotal } from "@/lib/data";
import { formatDuration, TIME_ZONE } from "@/lib/time";
import type { SafeUser, TaskWithTime } from "@/lib/types";

interface ReportProps {
  title: string; // used by pages/_app.tsx for the <title> tag
  user: Pick<SafeUser, "name" | "email">; // used by pages/_app.tsx for the nav bar
  days: DayTotal[];
  tasks: Pick<TaskWithTime, "id" | "title" | "category" | "totalMs" | "status">[];
  generatedAt: string;
}

export const getServerSideProps: GetServerSideProps<ReportProps> = async ({ req, resolvedUrl }) => {
  const user = await getUserFromCookies(req.cookies);
  if (!user) {
    return { redirect: { destination: `/login?from=${encodeURIComponent(resolvedUrl)}`, permanent: false } };
  }

  const [days, tasks] = await Promise.all([getDailyTotals(7), getTasks()]);
  return {
    props: {
      title: "Weekly report",
      user: { name: user.name, email: user.email },
      days,
      tasks: tasks
        .filter((t) => t.totalMs > 0)
        .sort((a, b) => b.totalMs - a.totalMs)
        .map(({ id, title, category, totalMs, status }) => ({ id, title, category, totalMs, status })),
      generatedAt: new Date().toISOString(),
    },
  };
};

export default function ReportPage({ days, tasks, generatedAt }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const weekTask = days.reduce((sum, d) => sum + d.task, 0);
  const weekTraining = days.reduce((sum, d) => sum + d.training, 0);
  const maxDay = Math.max(1, ...days.map((d) => d.task + d.training));

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Weekly report</h1>
          <p className="mt-1 text-sm text-muted">
            Last 7 days · {formatDuration(weekTask + weekTraining)} total ·{" "}
            <span className="text-training">{formatDuration(weekTraining)} training</span> ·{" "}
            <span className="text-accent">{formatDuration(weekTask)} tasks</span>
          </p>
        </div>

        <section aria-labelledby="chart-heading" className="rounded-xl border border-line bg-surface p-5">
          <h2 id="chart-heading" className="font-semibold">Time per day</h2>
          <div className="mt-2 flex gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-training" />Training</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-accent" />Task</span>
          </div>
          <ol className="mt-4 grid h-48 grid-cols-7 items-end gap-2 sm:gap-4">
            {days.map((d) => {
              const total = d.task + d.training;
              return (
                <li key={d.date} className="flex h-full flex-col items-center justify-end gap-1" title={`${d.label}: ${formatDuration(total)}`}>
                  <span className="text-[11px] tabular-nums text-muted">{total ? formatDuration(total) : ""}</span>
                  <div className="flex w-full max-w-10 flex-col overflow-hidden rounded-t" style={{ height: `${(total / maxDay) * 100}%` }}>
                    <div className="bg-training" style={{ flexGrow: d.training }} />
                    <div className="bg-accent" style={{ flexGrow: d.task }} />
                  </div>
                  <span className="text-xs text-muted">{d.label}</span>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby="all-heading" className="rounded-xl border border-line bg-surface p-5">
          <h2 id="all-heading" className="font-semibold">All-time totals</h2>
          {tasks.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No time tracked yet.</p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <thead className="text-left text-xs text-muted">
                <tr>
                  <th className="py-2 font-medium">Task</th>
                  <th className="py-2 font-medium">Category</th>
                  <th className="py-2 text-right font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td className="py-2 pr-3">
                      <Link href={`/tasks/${t.id}`} className="hover:text-accent hover:underline">{t.title}</Link>
                      {t.status === "done" && <span className="ml-2 text-xs text-muted">done</span>}
                    </td>
                    <td className={`py-2 capitalize ${t.category === "training" ? "text-training" : "text-muted"}`}>{t.category}</td>
                    <td className="py-2 text-right tabular-nums">{formatDuration(t.totalMs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <p className="text-xs text-muted">
          Built with the Pages Router and getServerSideProps · generated {new Date(generatedAt).toLocaleTimeString("en-US", { timeZone: TIME_ZONE })} ·
          also available as JSON at <Link href="/api/summary" className="underline">/api/summary</Link>
        </p>
      </div>
    </>
  );
}
