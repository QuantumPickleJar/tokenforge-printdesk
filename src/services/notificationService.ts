// ─────────────────────────────────────────────
// Notification Service — scaffold stub
// ─────────────────────────────────────────────
// Handles outbound notifications (email) to requesters.
//
// TODO (implementation pass):
//   - Implement via Supabase Edge Function + transactional email provider
//     (e.g. Resend, SendGrid, Postmark).
//   - Never send emails directly from the frontend — always route through
//     a server-side function.
//   - Templates should be reviewed for content injection risks.

/** Notify a requester that their request was received (stub). */
export async function notifyRequestReceived(
  _email: string,
  _requestTitle: string
): Promise<void> {
  // TODO: Call Supabase Edge Function → email provider API
  console.warn("[notificationService] notifyRequestReceived not implemented.");
}

/** Notify a requester that their quote is ready (stub). */
export async function notifyQuoteReady(
  _email: string,
  _quoteToken: string,
  _requestTitle: string
): Promise<void> {
  // TODO: Call Supabase Edge Function → email provider API
  // Include a quote link: `/quote/${_quoteToken}`
  console.warn("[notificationService] notifyQuoteReady not implemented.");
}

/** Notify a requester that more information is needed (stub). */
export async function notifyNeedsMoreInfo(
  _email: string,
  _requestTitle: string,
  _ownerMessage: string
): Promise<void> {
  // TODO: Call Supabase Edge Function → email provider API
  console.warn("[notificationService] notifyNeedsMoreInfo not implemented.");
}
