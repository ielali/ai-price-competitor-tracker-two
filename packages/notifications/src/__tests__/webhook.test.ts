import { afterEach, describe, expect, it, vi } from "vitest";
import { deliverHttpWebhook } from "../webhook";

describe("deliverHttpWebhook", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects empty URL", async () => {
    await expect(
      deliverHttpWebhook("", { title: "t", body: "b" }),
    ).rejects.toThrow("url is required");
  });

  it("POSTs notification envelope JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => "",
    });
    vi.stubGlobal("fetch", fetchMock);

    await deliverHttpWebhook(
      "https://example.com/hooks/incoming",
      { title: "Alert", body: "Hello", metadata: { sku: "abc" } },
      { "x-custom-secret": "shh" },
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      "content-type": "application/json",
      "x-custom-secret": "shh",
    });
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({
      event: "notification",
      title: "Alert",
      body: "Hello",
      metadata: { sku: "abc" },
    });
  });

  it("throws when response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Server Error",
        text: async () => "nope",
      }),
    );

    await expect(
      deliverHttpWebhook("https://example.com/h", { title: "t", body: "b" }),
    ).rejects.toThrow("Webhook delivery failed");
  });
});
