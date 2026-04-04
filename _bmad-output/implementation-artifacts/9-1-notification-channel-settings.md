# Story 9.1: Notification Channel Settings

Status: review

## Acceptance Criteria

- [x] Email: list of notification recipients; add/remove emails with validation
- [x] Slack: OAuth integration (placeholder API + finish-connection dialog) to select workspace and channel; test button sends sample message via API
- [x] Webhook: URL input with HMAC secret display; test button sends sample payload; shows last delivery status
- [x] Each channel has enable/disable toggle
- [x] Changes saved with success toast confirmation (Save changes + inline toasts)

## Implementation Summary

- Settings UI: `apps/web/src/components/settings/notification-channel-settings.tsx`
- Persisted preferences: `apps/web/src/stores/notification-channels-store.ts` (Zustand + localStorage)
- Email validation: `apps/web/src/lib/validate-email.ts`
- Webhook signing helper: `apps/web/src/lib/webhook-signing.ts`
- API: `POST /api/settings/channels/test`, `GET /api/settings/slack/oauth`
- UI primitives: `Switch`, `Label` under `components/ui/`
- Dependencies: `@radix-ui/react-switch`

## Dev Notes

- Webhook tests run from the browser; CORS may block some endpoints — errors surface in toast and last delivery status.
- Production Slack OAuth would replace the JSON placeholder with a real authorize redirect.
