// POST /api/logout — deletes the login cookie and goes back to the login page.
// A Route Handler (not a Server Action) so the same plain <form> works in App and Pages Router pages.
import { deleteSession } from "@/lib/session";

export async function POST(request: Request) {
  await deleteSession();
  // 303 tells the browser to follow up with a GET request.
  return Response.redirect(new URL("/login", request.url), 303);
}
