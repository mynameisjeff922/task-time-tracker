// Filter links. Each one keeps the other URL params and changes just one (e.g. ?status=done).
import Link from "next/link";

interface FilterTabsProps<T extends string> {
  label: string;
  param: string;
  options: readonly { value: T; label: string }[];
  current: T;
  searchParams: Record<string, string>;
}

export default function FilterTabs<T extends string>({ label, param, options, current, searchParams }: FilterTabsProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex rounded-md border border-line bg-surface p-0.5 text-sm">
      {options.map((option) => {
        const params = new URLSearchParams(searchParams);
        if (option.value === "all") params.delete(param);
        else params.set(param, option.value);
        const query = params.toString();
        const active = option.value === current;
        return (
          <Link
            key={option.value}
            href={query ? `/tasks?${query}` : "/tasks"}
            aria-current={active ? "true" : undefined}
            className={`rounded px-3 py-1 ${active ? "bg-accent-soft font-medium text-accent" : "text-muted hover:text-fg"}`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
