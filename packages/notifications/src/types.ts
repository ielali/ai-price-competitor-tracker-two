export type NotificationPayload = {
  title: string;
  body: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type SmtpTransportConfig = {
  host: string;
  port: number;
  secure?: boolean;
  auth?: { user: string; pass: string };
};

export type EmailChannel = {
  type: "email";
  transport: SmtpTransportConfig;
  from: string;
  to: string | string[];
};

export type SlackChannel = {
  type: "slack";
  webhookUrl: string;
};

export type WebhookChannel = {
  type: "webhook";
  url: string;
  headers?: Record<string, string>;
};

export type NotificationChannel = EmailChannel | SlackChannel | WebhookChannel;

export type DeliveryResult = {
  channel: NotificationChannel["type"];
  ok: boolean;
  error?: string;
};
