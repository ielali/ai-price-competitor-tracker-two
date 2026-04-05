import { ScrapingStatusLive } from "@/components/dashboard/scraping-status-live";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome to the AI Competitor Price Tracker. A live scraping overview
          appears below; configure sources under Competitors when you are ready
          to run jobs against real targets.
        </p>
      </div>

      <ScrapingStatusLive />
    </div>
  );
}
