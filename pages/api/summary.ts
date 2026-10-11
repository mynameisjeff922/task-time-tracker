// Pages Router API Route: GET /api/summary
// (The App Router version of an API endpoint is a Route Handler — see app/api/timer/route.ts.)
import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromCookies } from "@/lib/pages-auth";
import { getDailyTotals, getDashboardSummary, type DashboardSummary, type DayTotal } from "@/lib/data";

type Data = { summary: DashboardSummary; last7Days: DayTotal[] } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!(await getUserFromCookies(req.cookies))) {
    return res.status(401).json({ error: "Not logged in" });
  }
  const [summary, last7Days] = await Promise.all([getDashboardSummary(), getDailyTotals(7)]);
  res.status(200).json({ summary, last7Days });
}
