import { deliverEmail } from "./email";
import { deliverSlack } from "./slack";
import { deliverHttpWebhook } from "./webhook";
import type {
  DeliveryResult,
  NotificationChannel,
  NotificationPayload,
} from "./types";

async function deliverOne(
  payload: NotificationPayload,
  channel: NotificationChannel,
): Promise<DeliveryResult> {
  const kind = channel.type;
  try {
    if (channel.type === "slack") {
      await deliverSlack(channel.webhookUrl, payload);
    } else if (channel.type === "webhook") {
      await deliverHttpWebhook(channel.url, payload, channel.headers);
    } else {
      await deliverEmail(channel, payload);
    }
    return { channel: kind, ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { channel: kind, ok: false, error: message };
  }
}

/** Send the same notification through multiple channels; failures are captured per channel. */
export async function deliverNotification(
  payload: NotificationPayload,
  channels: NotificationChannel[],
): Promise<DeliveryResult[]> {
  if (!channels.length) {
    return [];
  }
  return Promise.all(channels.map((c) => deliverOne(payload, c)));
}
