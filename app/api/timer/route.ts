// Route Handler (App Router API endpoint) for the timer.
//   GET    /api/timer  -> the running timer, or null
//   POST   /api/timer  -> start a timer. Body: { "taskId": "..." }
//   DELETE /api/timer  -> stop the running timer
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getRunningTimer } from "@/lib/data";
import { startTimer, stopTimer } from "@/lib/timer";

const notLoggedIn = () => Response.json({ error: "Not logged in" }, { status: 401 });

export async function GET() {
  if (!(await getCurrentUser())) return notLoggedIn();
  return Response.json({ running: await getRunningTimer() });
}

export async function POST(request: Request) {
  if (!(await getCurrentUser())) return notLoggedIn();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const taskId = (body as { taskId?: unknown })?.taskId;
  if (typeof taskId !== "string" || !taskId) {
    return Response.json({ error: "taskId is required" }, { status: 400 });
  }

  const result = await startTimer(taskId);
  if (!result.ok) return Response.json({ error: result.error }, { status: result.status });

  revalidatePath("/", "layout");
  return Response.json({ entry: result.entry }, { status: 201 });
}

export async function DELETE() {
  if (!(await getCurrentUser())) return notLoggedIn();
  const entry = await stopTimer();
  revalidatePath("/", "layout");
  return Response.json({ entry });
}
