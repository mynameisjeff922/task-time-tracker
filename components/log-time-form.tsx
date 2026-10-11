"use client";
// Form for adding time by hand (e.g. you studied without starting the timer).
import { useActionState } from "react";
import type { FormState } from "@/lib/types";
import { FormMessage } from "./task-form";

interface LogTimeFormProps {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  today: string; // YYYY-MM-DD, from the server
}

const inputClass =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 aria-[invalid=true]:border-danger";

export default function LogTimeForm({ action, today }: LogTimeFormProps) {
  const [state, formAction, isPending] = useActionState(action, {});
  const values = { minutes: "30", date: today, note: "", ...state.values };

  return (
    <form action={formAction} className="space-y-3" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="minutes" className="mb-1 block text-sm font-medium">Minutes</label>
          <input
            id="minutes"
            name="minutes"
            type="number"
            min={1}
            max={1440}
            defaultValue={values.minutes}
            className={inputClass}
            aria-invalid={Boolean(state.errors?.minutes)}
          />
        </div>
        <div>
          <label htmlFor="date" className="mb-1 block text-sm font-medium">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            max={today}
            defaultValue={values.date}
            className={inputClass}
            aria-invalid={Boolean(state.errors?.date)}
          />
        </div>
      </div>
      {(state.errors?.minutes || state.errors?.date) && (
        <p className="text-xs text-danger" aria-live="polite">
          {state.errors.minutes ?? state.errors.date}
        </p>
      )}
      <div>
        <label htmlFor="note" className="mb-1 block text-sm font-medium">
          Note <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="note" name="note" defaultValue={values.note} placeholder="e.g. Chapters 3-5" className={inputClass} />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={isPending} className="rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-subtle disabled:opacity-50">
          {isPending ? "Logging…" : "Log time"}
        </button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
