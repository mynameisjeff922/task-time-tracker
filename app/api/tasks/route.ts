// Route Handler: GET /api/tasks?status=active&category=training&q=react
// Returns tasks (with total time) as JSON, using the same filters as the /tasks page.
import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getTasks } from "@/lib/data";
import { parseCategory, parseStatus } from "@/lib/filters";

export async function GET(request: NextRequest) {
  if (!(await getCurrentUser())) return Response.json({ error: "Not logged in" }, { status: 401 });
  const params = request.nextUrl.searchParams;
  const tasks = await getTasks({
    status: parseStatus(params.get("status")),
    category: parseCategory(params.get("category")),
    query: params.get("q") ?? "",
  });
  return Response.json({ count: tasks.length, tasks });
}
