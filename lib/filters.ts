// Turns untrusted URL values into the filter types the app understands.
import type { CategoryFilter, StatusFilter } from "./types";

const STATUSES: StatusFilter[] = ["all", "active", "done"];
const CATEGORIES: CategoryFilter[] = ["all", "task", "training"];

export function parseStatus(value: unknown): StatusFilter {
  return STATUSES.includes(value as StatusFilter) ? (value as StatusFilter) : "all";
}

export function parseCategory(value: unknown): CategoryFilter {
  return CATEGORIES.includes(value as CategoryFilter) ? (value as CategoryFilter) : "all";
}
