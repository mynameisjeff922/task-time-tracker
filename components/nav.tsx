// Top navigation bar. The logo and links render on the server; only the "which link is active"
// part needs the current URL, so that small piece is a Client Component inside <Suspense>.
import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import ActiveNavLinks, { NavLinks } from "./nav-links";

export default function Nav({ userMenu }: { userMenu?: ReactNode }) {
  return (
    <header className="border-b border-line bg-surface">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image src="/logo.svg" alt="" width={28} height={28} priority />
          Task Time Tracker
        </Link>
        <Suspense fallback={<NavLinks pathname={null} />}>
          <ActiveNavLinks />
        </Suspense>
        {userMenu}
      </nav>
    </header>
  );
}
