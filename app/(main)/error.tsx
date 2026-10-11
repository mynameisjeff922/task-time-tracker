"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md rounded-lg border border-line bg-surface p-6 text-center">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="mt-1 text-sm text-muted">The page couldn&apos;t load. Your data is safe.</p>
      <button onClick={() => retry()} className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90">
        Try again
      </button>
    </div>
  );
}
