// Layout for every logged-in page. "(main)" is a route group: the folder name
// doesn't appear in the URL, it just lets these pages share this layout.
import { Suspense } from "react";
import Nav from "@/components/nav";
import UserMenu from "@/components/user-menu";
import { getCurrentUser } from "@/lib/auth";

// Reads the login cookie, so it sits inside <Suspense> and streams in
// (the rest of the nav renders instantly).
async function CurrentUser() {
  const user = await getCurrentUser();
  return user ? <UserMenu user={user} /> : null;
}

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Nav
        userMenu={
          <Suspense fallback={null}>
            <CurrentUser />
          </Suspense>
        }
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
