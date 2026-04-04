import nodemailer from "nodemailer";
import type { EmailChannel, NotificationPayload } from "./types";

export async function deliverEmail(
  channel: EmailChannel,
  payload: NotificationPayload,
): Promise<void> {
  const { transport, from, to } = channel;
  if (!from?.trim()) {
    throw new Error("Email from address is required");
  }
  const recipients = Array.isArray(to) ? to : [to];
  if (!recipients.length || recipients.some((r) => !r?.trim())) {
    throw new Error("Email to address(es) are required");
  }
  if (!transport?.host?.trim()) {
    throw new Error("SMTP host is required");
  }

  const transporter = nodemailer.createTransport({
    host: transport.host,
    port: transport.port,
    secure: transport.secure ?? transport.port === 465,
    auth: transport.auth,
  });

  await transporter.sendMail({
    from,
    to: recipients,
    subject: payload.title,
    text: payload.body,
  });
}
