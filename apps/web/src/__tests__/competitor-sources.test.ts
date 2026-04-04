import { describe, it, expect } from "vitest";
import {
  classifySourceHealth,
  hoursSince,
  summarizeSourcesHealth,
  type CompetitorSource,
} from "@/lib/competitor-sources";

describe("hoursSince", () => {
  it("returns positive hours for past dates", () => {
    const from = new Date("2026-04-04T12:00:00.000Z");
    const past = new Date("2026-04-04T06:00:00.000Z");
    expect(hoursSince(past, from)).toBe(6);
  });
});

describe("classifySourceHealth", () => {
  const now = new Date("2026-04-04T12:00:00.000Z");

  it("returns critical when there is no last success", () => {
    expect(classifySourceHealth(100, null, now)).toBe("critical");
  });

  it("returns critical when last success is invalid", () => {
    expect(classifySourceHealth(100, "not-a-date", now)).toBe("critical");
  });

  it("returns critical when 7d rate is below 70", () => {
    expect(
      classifySourceHealth(
        69,
        "2026-04-04T11:00:00.000Z",
        now,
      ),
    ).toBe("critical");
  });

  it("returns critical when last success is 72+ hours ago", () => {
    expect(
      classifySourceHealth(
        95,
        "2026-04-01T11:00:00.000Z",
        now,
      ),
    ).toBe("critical");
  });

  it("returns degraded when rate is 70–89 and recent", () => {
    expect(
      classifySourceHealth(
        85,
        "2026-04-04T11:00:00.000Z",
        now,
      ),
    ).toBe("degraded");
  });

  it("returns degraded when rate is high but last success is 24–72h ago", () => {
    expect(
      classifySourceHealth(
        92,
        "2026-04-03T00:00:00.000Z",
        now,
      ),
    ).toBe("degraded");
  });

  it("returns healthy when rate ≥90 and last success within 24h", () => {
    expect(
      classifySourceHealth(
        92,
        "2026-04-04T00:00:00.000Z",
        now,
      ),
    ).toBe("healthy");
  });
});

describe("summarizeSourcesHealth", () => {
  it("aggregates counts and average rate", () => {
    const sources: CompetitorSource[] = [
      {
        id: "a",
        label: "A",
        platform: "Amazon",
        url: "https://a.example",
        successRate7dPct: 100,
        lastSuccessAt: "2026-04-04T11:00:00.000Z",
      },
      {
        id: "b",
        label: "B",
        platform: "eBay",
        url: "https://b.example",
        successRate7dPct: 80,
        lastSuccessAt: "2026-04-04T11:00:00.000Z",
      },
    ];
    const now = new Date("2026-04-04T12:00:00.000Z");
    const s = summarizeSourcesHealth(sources, now);
    expect(s.total).toBe(2);
    expect(s.healthy).toBe(1);
    expect(s.degraded).toBe(1);
    expect(s.critical).toBe(0);
    expect(s.aggregateSuccessRate7dPct).toBe(90);
  });

  it("handles empty list", () => {
    const s = summarizeSourcesHealth([]);
    expect(s.total).toBe(0);
    expect(s.aggregateSuccessRate7dPct).toBe(0);
  });
});
