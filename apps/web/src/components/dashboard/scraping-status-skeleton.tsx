export function ScrapingStatusSkeleton() {
  return (
    <section
      aria-label="Scraping activity loading"
      className="animate-pulse space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
    >
      <div className="h-7 w-56 rounded-md bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {["a", "b", "c", "d"].map((key) => (
          <div key={key} className="h-24 rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-40 rounded-lg bg-muted" />
    </section>
  );
}
