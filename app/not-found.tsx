import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-4 mt-16 max-w-md self-center rounded-lg border border-line bg-surface p-6 text-center">
      <h2 className="text-lg font-semibold">Page not found</h2>
      <p className="mt-1 text-sm text-muted">We couldn&apos;t find what you were looking for.</p>
      <Link href="/" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
