import { getScrapingStatus } from "@/lib/scraping-status";
import { ScrapingStatusView } from "@/components/dashboard/scraping-status-view";

export async function ScrapingStatusPanel() {
  const data = getScrapingStatus();
  return <ScrapingStatusView data={data} />;
}
