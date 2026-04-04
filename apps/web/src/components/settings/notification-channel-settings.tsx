"use client"

import * as React from "react"
import { Loader2, Mail, Trash2, Webhook, Slack, Copy, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { isValidEmail } from "@/lib/validate-email"
import { buildTestWebhookPayload, hmacSha256Hex } from "@/lib/webhook-signing"
import { useNotificationChannelsStore } from "@/stores/notification-channels-store"

function formatDeliveryTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return iso
  }
}

async function postTestChannel(channel: "email" | "slack" | "webhook"): Promise<boolean> {
  const res = await fetch("/api/settings/channels/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel }),
  })
  return res.ok
}

export function NotificationChannelSettings() {
  const {
    emailEnabled,
    emailRecipients,
    slackEnabled,
    slackConnected,
    slackWorkspace,
    slackChannel,
    webhookEnabled,
    webhookUrl,
    webhookSecret,
    lastWebhookDelivery,
    setEmailEnabled,
    setSlackEnabled,
    setWebhookEnabled,
    addEmailRecipient,
    removeEmailRecipient,
    setSlackConnection,
    disconnectSlack,
    setWebhookUrl,
    ensureWebhookSecret,
    regenerateWebhookSecret,
    recordWebhookDelivery,
  } = useNotificationChannelsStore()

  const [emailInput, setEmailInput] = React.useState("")
  const [slackDialogOpen, setSlackDialogOpen] = React.useState(false)
  const [oauthWorkspace, setOauthWorkspace] = React.useState("")
  const [oauthChannel, setOauthChannel] = React.useState("")
  const [slackOauthLoading, setSlackOauthLoading] = React.useState(false)
  const [testLoading, setTestLoading] = React.useState<string | null>(null)
  const [regenOpen, setRegenOpen] = React.useState(false)

  React.useEffect(() => {
    if (webhookEnabled) {
      ensureWebhookSecret()
    }
  }, [webhookEnabled, ensureWebhookSecret])

  const onAddEmail = () => {
    if (!isValidEmail(emailInput)) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Enter a valid notification email address.",
      })
      return
    }
    const normalized = emailInput.trim().toLowerCase()
    if (emailRecipients.includes(normalized)) {
      toast({
        title: "Already added",
        description: "That address is already in the list.",
      })
      return
    }
    addEmailRecipient(emailInput)
    setEmailInput("")
    toast({ title: "Recipient added" })
  }

  const onSaveAll = () => {
    if (emailEnabled && emailRecipients.length === 0) {
      toast({
        variant: "destructive",
        title: "Email channel incomplete",
        description: "Add at least one recipient or turn off email notifications.",
      })
      return
    }
    if (slackEnabled && (!slackConnected || !slackWorkspace || !slackChannel)) {
      toast({
        variant: "destructive",
        title: "Slack channel incomplete",
        description: "Connect Slack and choose a channel, or disable Slack.",
      })
      return
    }
    if (webhookEnabled) {
      try {
        new URL(webhookUrl || "")
      } catch {
        toast({
          variant: "destructive",
          title: "Invalid webhook URL",
          description: "Enter a valid https URL for your webhook endpoint.",
        })
        return
      }
    }
    toast({
      title: "Settings saved",
      description: "Notification channel preferences have been updated.",
    })
  }

  const onSlackOAuthSimulate = async () => {
    setSlackOauthLoading(true)
    try {
      const res = await fetch("/api/settings/slack/oauth")
      if (!res.ok) throw new Error("oauth")
      await new Promise((r) => setTimeout(r, 400))
    } catch {
      toast({
        variant: "destructive",
        title: "Slack OAuth unavailable",
        description: "Could not start OAuth. You can still enter workspace details below.",
      })
    } finally {
      setSlackOauthLoading(false)
      setSlackDialogOpen(true)
    }
  }

  const onCompleteSlackConnect = () => {
    if (!oauthWorkspace.trim() || !oauthChannel.trim()) {
      toast({
        variant: "destructive",
        title: "Missing details",
        description: "Workspace and channel are required.",
      })
      return
    }
    setSlackConnection(oauthWorkspace, oauthChannel)
    setSlackDialogOpen(false)
    setOauthWorkspace("")
    setOauthChannel("")
    toast({ title: "Slack connected", description: "Workspace and channel saved for alerts." })
  }

  const onTestEmail = async () => {
    setTestLoading("email")
    try {
      const ok = await postTestChannel("email")
      if (!ok) throw new Error("fail")
      toast({
        title: "Test email queued",
        description: "A sample notification would be sent to your recipients.",
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Test failed",
        description: "Could not queue test email.",
      })
    } finally {
      setTestLoading(null)
    }
  }

  const onTestSlack = async () => {
    if (!slackConnected) {
      toast({
        variant: "destructive",
        title: "Slack not connected",
        description: "Connect a workspace and channel first.",
      })
      return
    }
    setTestLoading("slack")
    try {
      const ok = await postTestChannel("slack")
      if (!ok) throw new Error("fail")
      toast({
        title: "Slack test sent",
        description: `Sample message for ${slackChannel} in ${slackWorkspace}.`,
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Slack test failed",
        description: "Try again or check your connection.",
      })
    } finally {
      setTestLoading(null)
    }
  }

  const onTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast({
        variant: "destructive",
        title: "Webhook URL required",
        description: "Enter your endpoint URL before testing.",
      })
      return
    }
    let target: URL
    try {
      target = new URL(webhookUrl)
    } catch {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Use a full https URL for your webhook.",
      })
      return
    }
    if (target.protocol !== "https:" && target.protocol !== "http:") {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Webhook must use http or https.",
      })
      return
    }

    setTestLoading("webhook")
    const body = buildTestWebhookPayload()
    let detail: string
    try {
      const sig = await hmacSha256Hex(webhookSecret, body)
      const res = await fetch(target.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Price-Tracker-Signature": `sha256=${sig}`,
        },
        body,
      })
      detail = `${res.status} ${res.statusText || ""}`.trim()
      recordWebhookDelivery(res.ok ? "success" : "failed", detail)
      if (res.ok) {
        toast({ title: "Webhook test delivered", description: detail })
      } else {
        toast({
          variant: "destructive",
          title: "Webhook returned an error",
          description: detail,
        })
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Network error"
      detail = message
      recordWebhookDelivery("failed", detail)
      toast({
        variant: "destructive",
        title: "Webhook test failed",
        description:
          "Your browser could not reach the URL (often due to CORS). For production, delivery runs server-side.",
      })
    } finally {
      setTestLoading(null)
    }
  }

  const onCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(webhookSecret)
      toast({ title: "Secret copied" })
    } catch {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Copy the secret manually.",
      })
    }
  }

  const onConfirmRegenerate = () => {
    regenerateWebhookSecret()
    setRegenOpen(false)
    toast({
      title: "Secret rotated",
      description: "Update any integrations that verify the signing secret.",
    })
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Configure how price alerts are delivered to your team.
        </p>
      </div>

      <section
        aria-labelledby="email-heading"
        className="rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden />
            <div>
              <h2 id="email-heading" className="text-lg font-semibold leading-none">
                Email
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Recipients receive HTML alerts with product, price change, and links.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
            <Label htmlFor="email-enabled" className="sr-only">
              Enable email channel
            </Label>
            <span id="email-enabled-label" className="text-sm text-muted-foreground">
              {emailEnabled ? "Enabled" : "Disabled"}
            </span>
            <Switch
              id="email-enabled"
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
              aria-labelledby="email-heading"
              aria-describedby="email-enabled-label"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <Label className="text-base">Notification recipients</Label>
          <ul className="space-y-2" aria-label="Email recipient list">
            {emailRecipients.length === 0 ? (
              <li className="text-sm text-muted-foreground">No recipients yet.</li>
            ) : (
              emailRecipients.map((addr) => (
                <li
                  key={addr}
                  className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
                >
                  <span className="truncate text-sm">{addr}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive"
                    onClick={() => removeEmailRecipient(addr)}
                    aria-label={`Remove ${addr}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))
            )}
          </ul>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="new-email">Add email</Label>
              <Input
                id="new-email"
                type="email"
                autoComplete="email"
                placeholder="pricing@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    onAddEmail()
                  }
                }}
              />
            </div>
            <Button type="button" variant="secondary" onClick={onAddEmail}>
              Add
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!emailEnabled || testLoading === "email"}
              onClick={onTestEmail}
            >
              {testLoading === "email" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Test email
            </Button>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="slack-heading"
        className="rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <Slack className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden />
            <div>
              <h2 id="slack-heading" className="text-lg font-semibold leading-none">
                Slack
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Connect via OAuth, pick a workspace and channel, then send rich alert messages.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
            <Label htmlFor="slack-enabled" className="sr-only">
              Enable Slack channel
            </Label>
            <span id="slack-enabled-label" className="text-sm text-muted-foreground">
              {slackEnabled ? "Enabled" : "Disabled"}
            </span>
            <Switch
              id="slack-enabled"
              checked={slackEnabled}
              onCheckedChange={setSlackEnabled}
              aria-labelledby="slack-heading"
              aria-describedby="slack-enabled-label"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            variant="secondary"
            disabled={!slackEnabled || slackOauthLoading}
            onClick={onSlackOAuthSimulate}
          >
            {slackOauthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Connect Slack (OAuth)
          </Button>
          {slackConnected ? (
            <>
              <div className="flex flex-1 flex-col gap-1 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Workspace</span>
                <span className="font-medium">{slackWorkspace}</span>
                <span className="mt-2 text-muted-foreground">Channel</span>
                <span className="font-medium">{slackChannel}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOauthWorkspace(slackWorkspace)
                  setOauthChannel(slackChannel)
                  setSlackDialogOpen(true)
                }}
              >
                Change workspace / channel
              </Button>
              <Button type="button" variant="ghost" className="text-destructive" onClick={disconnectSlack}>
                Disconnect
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Start OAuth, then confirm the workspace and channel you want alerts posted to.
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={!slackEnabled || testLoading === "slack"}
            onClick={onTestSlack}
          >
            {testLoading === "slack" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Send test message
          </Button>
        </div>

        <Dialog open={slackDialogOpen} onOpenChange={setSlackDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Finish Slack connection</DialogTitle>
              <DialogDescription>
                After Slack redirects back to Price Tracker, enter your workspace name and channel
                (e.g. <span className="font-mono">#pricing-alerts</span>) to store the destination
                for alert messages.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="slack-ws">Workspace</Label>
                <Input
                  id="slack-ws"
                  placeholder="Acme Corp"
                  value={oauthWorkspace}
                  onChange={(e) => setOauthWorkspace(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slack-ch">Channel</Label>
                <Input
                  id="slack-ch"
                  placeholder="#pricing-alerts"
                  value={oauthChannel}
                  onChange={(e) => setOauthChannel(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSlackDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={onCompleteSlackConnect}>
                Save connection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <section
        aria-labelledby="webhook-heading"
        className="rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <Webhook className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden />
            <div>
              <h2 id="webhook-heading" className="text-lg font-semibold leading-none">
                Webhook
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                POST JSON payloads to your URL. Use the signing secret to verify{" "}
                <span className="font-mono text-xs">X-Price-Tracker-Signature</span>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
            <Label htmlFor="webhook-enabled" className="sr-only">
              Enable webhook channel
            </Label>
            <span id="webhook-enabled-label" className="text-sm text-muted-foreground">
              {webhookEnabled ? "Enabled" : "Disabled"}
            </span>
            <Switch
              id="webhook-enabled"
              checked={webhookEnabled}
              onCheckedChange={setWebhookEnabled}
              aria-labelledby="webhook-heading"
              aria-describedby="webhook-enabled-label"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Endpoint URL</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://hooks.example.com/price-alerts"
              disabled={!webhookEnabled}
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>
          {webhookEnabled && webhookSecret ? (
            <div className="space-y-2">
              <Label htmlFor="webhook-secret">Signing secret</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="webhook-secret"
                  readOnly
                  className="font-mono text-xs sm:flex-1"
                  value={webhookSecret}
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="icon" onClick={onCopySecret} aria-label="Copy secret">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setRegenOpen(true)}
                    aria-label="Regenerate secret"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-md border border-border bg-muted/20 px-3 py-3 text-sm">
            <span className="font-medium text-foreground">Last delivery</span>
            <p className="mt-1 text-muted-foreground">
              {lastWebhookDelivery ? (
                <>
                  <span
                    className={
                      lastWebhookDelivery.status === "success" ? "text-price-down" : "text-destructive"
                    }
                  >
                    {lastWebhookDelivery.status === "success" ? "Success" : "Failed"}
                  </span>
                  {" · "}
                  {formatDeliveryTime(lastWebhookDelivery.at)}
                  {lastWebhookDelivery.detail ? ` — ${lastWebhookDelivery.detail}` : ""}
                </>
              ) : (
                <>No test delivery recorded yet.</>
              )}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={!webhookEnabled || testLoading === "webhook"}
            onClick={onTestWebhook}
          >
            {testLoading === "webhook" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Send test payload
          </Button>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="button" onClick={onSaveAll}>
          Save changes
        </Button>
      </div>

      <Dialog open={regenOpen} onOpenChange={setRegenOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate signing secret?</DialogTitle>
            <DialogDescription>
              Existing integrations that verify signatures must update to the new secret. This cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRegenOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={onConfirmRegenerate}>
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
