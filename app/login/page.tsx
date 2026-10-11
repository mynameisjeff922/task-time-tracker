import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import LoginForm from "@/components/login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Image src="/logo.svg" alt="" width={44} height={44} priority />
          <div>
            <h1 className="text-xl font-semibold">Log in to Task Time Tracker</h1>
            <p className="mt-1 text-sm text-muted">Track your tasks and trainings.</p>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-6">
          {/* The form reads ?from=... from the URL, so it's wrapped in Suspense */}
          <Suspense fallback={<div className="h-56" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
