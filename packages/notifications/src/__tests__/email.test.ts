import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockSendMail, mockCreateTransport } = vi.hoisted(() => {
  const mockSendMail = vi.fn().mockResolvedValue({ messageId: "test-id" });
  const mockCreateTransport = vi.fn().mockReturnValue({
    sendMail: mockSendMail,
  });
  return { mockSendMail, mockCreateTransport };
});

vi.mock("nodemailer", () => ({
  default: {
    createTransport: mockCreateTransport,
  },
}));

import { deliverEmail } from "../email";

describe("deliverEmail", () => {
  beforeEach(() => {
    mockSendMail.mockClear();
    mockCreateTransport.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("validates SMTP host", async () => {
    await expect(
      deliverEmail(
        {
          type: "email",
          transport: { host: "", port: 587 },
          from: "a@x.com",
          to: "b@x.com",
        },
        { title: "t", body: "b" },
      ),
    ).rejects.toThrow("SMTP host is required");
  });

  it("sends mail via nodemailer transport", async () => {
    await deliverEmail(
      {
        type: "email",
        transport: { host: "smtp.example.com", port: 587 },
        from: "alerts@example.com",
        to: ["one@example.com", "two@example.com"],
      },
      { title: "Subject line", body: "Plain text body" },
    );

    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: "smtp.example.com",
      port: 587,
      secure: false,
      auth: undefined,
    });
    expect(mockSendMail).toHaveBeenCalledWith({
      from: "alerts@example.com",
      to: ["one@example.com", "two@example.com"],
      subject: "Subject line",
      text: "Plain text body",
    });
  });
});
