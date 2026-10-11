"use client";
// One form used for both "Add task" and "Edit task".
// useActionState runs the Server Action and gives us its result (errors / success message).
import { useActionState } from "react";
import type { FormState, Task } from "@/lib/types";

interface TaskFormProps {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: Pick<Task, "title" | "notes" | "category">;
  submitLabel: string;
  compact?: boolean;
}

const inputClass =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 aria-[invalid=true]:border-danger";

export default function TaskForm({ action, initial, submitLabel, compact = false }: TaskFormProps) {
  const [state, formAction, isPending] = useActionState(action, {});
  // After a failed submit, show what the user typed instead of the original values.
  const values = { title: "", notes: "", category: "task", ...initial, ...state.values };

  return (
    <form action={formAction} className="space-y-3" noValidate>
      <div className={compact ? "flex flex-col gap-3 sm:flex-row" : "space-y-3"}>
        <div className="flex-1">
          <label htmlFor="title" className={compact ? "sr-only" : "mb-1 block text-sm font-medium"}>
            Title
          </label>
          <input
            id="title"
            name="title"
            defaultValue={values.title}
            placeholder="What are you working on?"
            className={inputClass}
            aria-invalid={Boolean(state.errors?.title)}
            aria-describedby="title-error"
            maxLength={100}
          />
          <p id="title-error" className="mt-1 text-xs text-danger" aria-live="polite">
            {state.errors?.title}
          </p>
        </div>

        <fieldset>
          <legend className={compact ? "sr-only" : "mb-1 block text-sm font-medium"}>Category</legend>
          <div className="flex h-[38px] overflow-hidden rounded-md border border-line text-sm">
            {(["task", "training"] as const).map((c) => (
              <label key={c} className="flex cursor-pointer items-center px-3 capitalize has-[:checked]:bg-accent-soft has-[:checked]:font-medium has-[:checked]:text-accent">
                <input type="radio" name="category" value={c} defaultChecked={values.category === c} className="sr-only" />
                {c}
              </label>
            ))}
          </div>
          {state.errors?.category && <p className="mt-1 text-xs text-danger">{state.errors.category}</p>}
        </fieldset>

        {compact && (
          <button type="submit" disabled={isPending} className="h-[38px] rounded-md bg-accent px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
            {isPending ? "Saving…" : submitLabel}
          </button>
        )}
      </div>

      {!compact && (
        <>
          <div>
            <label htmlFor="notes" className="mb-1 block text-sm font-medium">
              Notes <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea id="notes" name="notes" rows={3} defaultValue={values.notes} className={inputClass} />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={isPending} className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
              {isPending ? "Saving…" : submitLabel}
            </button>
            <FormMessage state={state} />
          </div>
        </>
      )}
      {compact && <FormMessage state={state} />}
    </form>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p className={`text-sm ${state.success ? "text-accent" : "text-danger"}`} role="status">
      {state.message}
    </p>
  );
}
