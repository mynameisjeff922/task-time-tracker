"use client";
// Search box that stores the search text in the URL (?q=...), like the Next.js course's invoice search.
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Search() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending update if the component goes away.
  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  function handleSearch(term: string) {
    // Debounce: wait until the user stops typing for 300ms before updating the URL.
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams?.toString());
      if (term) params.set("q", term);
      else params.delete("q");
      replace(`${pathname}?${params.toString()}`);
    }, 300);
  }

  return (
    <div className="relative flex-1">
      <label htmlFor="search" className="sr-only">Search tasks</label>
      <input
        id="search"
        type="search"
        placeholder="Search tasks…"
        defaultValue={searchParams?.get("q") ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full rounded-md border border-line bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
      />
      <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="9" r="6" />
        <path d="m14 14 4 4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
