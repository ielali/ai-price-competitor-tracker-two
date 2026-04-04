"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type WebhookDeliveryStatus = "success" | "failed"

export interface WebhookDeliveryRecord {
  at: string
  status: WebhookDeliveryStatus
  detail: string
}

export interface NotificationChannelsState {
  emailEnabled: boolean
  emailRecipients: string[]
  slackEnabled: boolean
  slackConnected: boolean
  slackWorkspace: string
  slackChannel: string
  webhookEnabled: boolean
  webhookUrl: string
  webhookSecret: string
  lastWebhookDelivery: WebhookDeliveryRecord | null
  setEmailEnabled: (v: boolean) => void
  setSlackEnabled: (v: boolean) => void
  setWebhookEnabled: (v: boolean) => void
  addEmailRecipient: (email: string) => void
  removeEmailRecipient: (email: string) => void
  setSlackConnection: (workspace: string, channel: string) => void
  disconnectSlack: () => void
  setWebhookUrl: (url: string) => void
  ensureWebhookSecret: () => void
  regenerateWebhookSecret: () => void
  recordWebhookDelivery: (status: WebhookDeliveryStatus, detail: string) => void
}

function randomSecret(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  const b64 = btoa(String.fromCharCode(...bytes))
  return `whsec_${b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`
}

const defaultInitial = {
  emailEnabled: true,
  emailRecipients: [] as string[],
  slackEnabled: false,
  slackConnected: false,
  slackWorkspace: "",
  slackChannel: "",
  webhookEnabled: false,
  webhookUrl: "",
  webhookSecret: "",
  lastWebhookDelivery: null as WebhookDeliveryRecord | null,
}

export const useNotificationChannelsStore = create<NotificationChannelsState>()(
  persist(
    (set, get) => ({
      ...defaultInitial,
      setEmailEnabled: (v) => set({ emailEnabled: v }),
      setSlackEnabled: (v) => set({ slackEnabled: v }),
      setWebhookEnabled: (v) =>
        set((state) => {
          if (v && !state.webhookSecret) {
            return { webhookEnabled: v, webhookSecret: randomSecret() }
          }
          return { webhookEnabled: v }
        }),
      addEmailRecipient: (email) => {
        const normalized = email.trim().toLowerCase()
        const { emailRecipients } = get()
        if (emailRecipients.includes(normalized)) return
        set({ emailRecipients: [...emailRecipients, normalized] })
      },
      removeEmailRecipient: (email) =>
        set((state) => ({
          emailRecipients: state.emailRecipients.filter((e) => e !== email),
        })),
      setSlackConnection: (workspace, channel) =>
        set({
          slackConnected: true,
          slackWorkspace: workspace.trim(),
          slackChannel: channel.trim(),
        }),
      disconnectSlack: () =>
        set({
          slackConnected: false,
          slackWorkspace: "",
          slackChannel: "",
        }),
      setWebhookUrl: (url) => set({ webhookUrl: url.trim() }),
      ensureWebhookSecret: () => {
        if (!get().webhookSecret) {
          set({ webhookSecret: randomSecret() })
        }
      },
      regenerateWebhookSecret: () => set({ webhookSecret: randomSecret() }),
      recordWebhookDelivery: (status, detail) =>
        set({
          lastWebhookDelivery: {
            at: new Date().toISOString(),
            status,
            detail,
          },
        }),
    }),
    {
      name: "price-tracker-notification-channels",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        emailEnabled: s.emailEnabled,
        emailRecipients: s.emailRecipients,
        slackEnabled: s.slackEnabled,
        slackConnected: s.slackConnected,
        slackWorkspace: s.slackWorkspace,
        slackChannel: s.slackChannel,
        webhookEnabled: s.webhookEnabled,
        webhookUrl: s.webhookUrl,
        webhookSecret: s.webhookSecret,
        lastWebhookDelivery: s.lastWebhookDelivery,
      }),
    }
  )
)
