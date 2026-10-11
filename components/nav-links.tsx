"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/report", label: "Weekly report" },
];

/** Highlights the link for the page you're on. */
export default function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}

export function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    <ul className="flex gap-1 text-sm">
      {links.map((link) => {
        const active = link.href === "/" ? pathname === "/" : Boolean(pathname?.startsWith(link.href));
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                active ? "bg-accent-soft font-medium text-accent" : "text-muted hover:bg-subtle hover:text-fg"
              }`}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
