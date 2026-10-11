"use client";
// Shows a task's total time (ticking live while running) and a Start/Stop button.
// Start/Stop call our Route Handler at /api/timer with fetch().
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatClock, formatDuration } from "@/lib/time";
import { useNow } from "./use-now";

interface TimerButtonProps {
  taskId: string;
  totalMs: number; // time already finished
  runningSince: string | null;
  serverNow: number;
  disabled?: boolean;
  size?: "sm" | "lg";
}

export default function TimerButton({
  taskId,
  totalMs,
  runningSince,
  serverNow,
  disabled = false,
  size = "sm",
}: TimerButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const running = runningSince !== null;
  const now = useNow(serverNow, running);
  const elapsed = running ? Math.max(0, now - new Date(runningSince).getTime()) : 0;

  async function toggle() {
    setError(null);
    const response = await fetch("/api/timer", {
      method: running ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: running ? undefined : JSON.stringify({ taskId }),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Something went wrong");
      return;
    }
    // Re-run the Server Components so every total on the page updates.
    startTransition(() => router.refresh());
  }

  const big = size === "lg";
  return (
    <div className={`flex items-center ${big ? "gap-4" : "gap-3"}`}>
      <div className="text-right">
        <div
          className={`tabular-nums ${big ? "text-2xl font-semibold" : "text-sm"} ${running ? "text-accent" : "text-muted"}`}
          title="Total time spent"
        >
          {running ? formatClock(totalMs + elapsed) : formatDuration(totalMs)}
        </div>
        {error && <p className="text-xs text-danger" role="alert">{error}</p>}
      </div>
      <button
        type="button"
        onClick={() => startTransition(toggle)}
        disabled={disabled || isPending}
        aria-label={running ? "Stop timer" : "Start timer"}
        className={`inline-flex items-center gap-1.5 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
          big ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs"
        } ${running ? "bg-danger text-white hover:opacity-90" : "bg-accent text-white hover:opacity-90"}`}
      >
        <span aria-hidden className={`inline-block ${running ? "size-2 rounded-[2px] bg-white" : "size-0 border-y-4 border-l-[7px] border-y-transparent border-l-white"}`} />
        {running ? "Stop" : "Start"}
      </button>
    </div>
  );
}
