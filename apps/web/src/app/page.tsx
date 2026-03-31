export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-semibold tracking-tight">AI Competitor Price Tracker</h1>
      <p className="mt-4 max-w-lg text-center text-muted-foreground">
        Track competitor pricing, detect trends, and get AI-powered recommendations to stay
        competitive.
      </p>
      <div className="mt-8 flex gap-4">
        <span className="rounded-md bg-price-down/10 px-3 py-1 text-sm font-medium text-price-down">
          Price Down
        </span>
        <span className="rounded-md bg-price-up/10 px-3 py-1 text-sm font-medium text-price-up">
          Price Up
        </span>
        <span className="rounded-md bg-stable/10 px-3 py-1 text-sm font-medium text-stable">
          Stable
        </span>
        <span className="rounded-md bg-anomaly/10 px-3 py-1 text-sm font-medium text-anomaly">
          Anomaly
        </span>
        <span className="font-tabular rounded-md bg-user-price/10 px-3 py-1 text-sm font-medium text-user-price">
          $99.99
        </span>
      </div>
    </div>
  );
}
