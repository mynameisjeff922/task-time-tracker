// Shown instantly while a page's data loads (Next.js wraps the page in <Suspense> for us).
export default function Loading() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-48 rounded bg-subtle" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-subtle" />
        ))}
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-14 rounded-lg bg-subtle" />
      ))}
    </div>
  );
}
