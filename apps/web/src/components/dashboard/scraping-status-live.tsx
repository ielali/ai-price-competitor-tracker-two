"use client";

import { useCallback, useEffect, useState } from "react";

import { ScrapingStatusView } from "@/components/dashboard/scraping-status-view";
import { ScrapingStatusSkeleton } from "@/components/dashboard/scraping-status-skeleton";
import type { ScrapingStatusPayload } from "@/lib/scraping-status";

const REFRESH_MS = 60_000;

async function fetchScrapingStatus(): Promise<ScrapingStatusPayload> {
  const res = await fetch("/api/scraping/status", {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Scraping status request failed (${res.status})`);
  }
  return res.json() as Promise<ScrapingStatusPayload>;
}

export function ScrapingStatusLive() {
  const [data, setData] = useState<ScrapingStatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const payload = await fetchScrapingStatus();
      setData(payload);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load scraping status";
      setError(message);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), REFRESH_MS);
    return () => window.clearInterval(id);
  }, [load]);

  if (error && !data) {
    return (
      <section
        role="alert"
        aria-live="polite"
        className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive"
      >
        <p className="font-medium">Could not load scraping activity</p>
        <p className="mt-1 text-muted-foreground">{error}</p>
      </section>
    );
  }

  if (!data) {
    return <ScrapingStatusSkeleton />;
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p
          role="status"
          className="text-sm text-destructive"
        >
          {error} — showing last successful data.
        </p>
      ) : null}
      <ScrapingStatusView data={data} />
    </div>
  );
}
