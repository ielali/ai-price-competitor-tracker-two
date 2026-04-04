import { z } from "zod";

export const scrapeJobPayloadSchema = z.object({
  sourceId: z.string().min(1, "sourceId is required"),
  url: z.string().url().optional()
});
