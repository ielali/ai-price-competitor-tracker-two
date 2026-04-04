import { afterEach, describe, expect, it, vi } from "vitest";
import { deliverSlack } from "../slack";

describe("deliverSlack", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects empty webhook URL", async () => {
    await expect(
      deliverSlack("", { title: "t", body: "b" }),
    ).rejects.toThrow("webhookUrl is required");
  });

  it("rejects non-https URLs", async () => {
    await expect(
      deliverSlack("http://hooks.slack.com/x", { title: "t", body: "b" }),
    ).rejects.toThrow("https");
  });

  it("posts JSON to Slack and succeeds on 200", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => "ok",
    });
    vi.stubGlobal("fetch", fetchMock);

    await deliverSlack("https://hooks.slack.com/services/AAA/BBB/CCC", {
      title: "Price alert",
      body: "Widget dropped 10%",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://hooks.slack.com/services/AAA/BBB/CCC");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "content-type": "application/json" });
    const body = JSON.parse(init.body as string);
    expect(body.text).toContain("Price alert");
    expect(body.text).toContain("Widget dropped 10%");
  });

  it("throws on non-OK Slack response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: async () => "invalid_payload",
      }),
    );

    await expect(
      deliverSlack("https://hooks.slack.com/services/x", {
        title: "t",
        body: "b",
      }),
    ).rejects.toThrow("Slack webhook failed");
  });
});
