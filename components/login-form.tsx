"use client";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { login } from "@/lib/auth-actions";

const inputClass =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 aria-[invalid=true]:border-danger";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, {});
  // After logging in, go back to the page the user originally asked for.
  const redirectTo = useSearchParams()?.get("from") ?? "/";

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email ?? ""}
          className={inputClass}
          aria-invalid={Boolean(state.errors?.email)}
          aria-describedby="email-error"
        />
        <p id="email-error" className="mt-1 text-xs text-danger" aria-live="polite">{state.errors?.email}</p>
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
          aria-invalid={Boolean(state.errors?.password)}
          aria-describedby="password-error"
        />
        <p id="password-error" className="mt-1 text-xs text-danger" aria-live="polite">{state.errors?.password}</p>
      </div>
      {state.message && (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">{state.message}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
