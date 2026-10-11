// Shows who is logged in, plus a Log out button.
// Log out is a plain HTML form that POSTs to /api/logout, so it works in both App and Pages Router pages.
import type { SafeUser } from "@/lib/types";

export default function UserMenu({ user }: { user: Pick<SafeUser, "name" | "email"> }) {
  return (
    <div className="ml-auto flex items-center gap-3 text-sm">
      <span className="hidden text-muted sm:inline" title={user.email}>
        {user.name}
      </span>
      <form action="/api/logout" method="post">
        <button type="submit" className="rounded-md border border-line px-3 py-1.5 hover:bg-subtle">
          Log out
        </button>
      </form>
    </div>
  );
}
