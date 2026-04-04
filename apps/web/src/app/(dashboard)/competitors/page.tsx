import { CompetitorSourcesView } from "@/components/competitors/competitor-sources-view";
import { mockCompetitorSources } from "@/lib/competitor-sources";

export default function CompetitorsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Competitors</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Monitor configured competitor URLs, recent scrape success, and source
        health at a glance.
      </p>
      <div className="mt-8">
        <CompetitorSourcesView sources={mockCompetitorSources} />
      </div>
    </div>
  );
}
