import type { TaskCategory } from "@/lib/types";

export default function CategoryBadge({ category }: { category: TaskCategory }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
        category === "training" ? "bg-training-soft text-training" : "bg-subtle text-muted"
      }`}
    >
      {category}
    </span>
  );
}
