# Supabase Edge Functions

v0.1 keeps real email-provider delivery stubbed. The frontend and database queue notification rows in `notification_logs`.

Planned function:

- `send-notification-stub` / later `send-notification`
- Reads queued notification rows.
- Sends requester/owner emails through a provider such as Resend, Postmark, or SendGrid.
- Uses provider API keys stored only as Supabase secrets.
- Never attaches uploaded STL files.
- Links owners to dashboard request detail and requesters to quote-token pages where appropriate.

Do not place service-role keys or email provider secrets in frontend code.
