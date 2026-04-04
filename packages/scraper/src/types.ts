export type ScrapeJobPayload = {
  /** Logical competitor source or product grouping id */
  sourceId: string;
  /** Optional deep-link when enqueueing a single URL scrape */
  url?: string;
};

export type ScrapeJobName = "scrape-url" | "scheduled-sweep";
