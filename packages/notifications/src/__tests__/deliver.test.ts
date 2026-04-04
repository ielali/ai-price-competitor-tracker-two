import { afterEach, describe, expect, it, vi } from "vitest";
import { deliverNotification } from "../deliver";

describe("deliverNotification", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty array when no channels", async () => {
    await expect(
      deliverNotification({ title: "t", body: "b" }, []),
    ).resolves.toEqual([]);
  });

  it("aggregates per-channel results", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: "OK",
          text: async () => "",
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: "Err",
          text: async () => "",
        }),
    );

    const results = await deliverNotification(
      { title: "Combined", body: "Body" },
      [
        { type: "slack", webhookUrl: "https://hooks.slack.com/services/x/y/z" },
        { type: "webhook", url: "https://example.com/nope" },
      ],
    );

    expect(results[0]).toEqual({ channel: "slack", ok: true });
    expect(results[1].channel).toBe("webhook");
    expect(results[1].ok).toBe(false);
    expect(results[1].error).toContain("Webhook delivery failed");
  });
});
