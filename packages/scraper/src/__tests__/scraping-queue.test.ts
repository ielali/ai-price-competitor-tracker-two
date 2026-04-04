import { describe, expect, it, vi } from "vitest";
import { registerPeriodicSweep } from "../scraping-queue.js";

describe("registerPeriodicSweep", () => {
  it("throws when interval is too small", async () => {
    const add = vi.fn();
    await expect(
      registerPeriodicSweep({ add }, 500, { sourceId: "all" })
    ).rejects.toThrow(/1000ms/);
    expect(add).not.toHaveBeenCalled();
  });

  it("adds repeatable scheduled-sweep job", async () => {
    const add = vi.fn().mockResolvedValue(undefined);
    await registerPeriodicSweep({ add }, 60_000, {
      sourceId: "scheduled-sweep"
    });
    expect(add).toHaveBeenCalledWith(
      "scheduled-sweep",
      { sourceId: "scheduled-sweep" },
      { repeat: { every: 60_000 } }
    );
  });
});
