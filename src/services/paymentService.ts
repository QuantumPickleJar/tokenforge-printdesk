// ─────────────────────────────────────────────
// Payment Service — scaffold stub
// ─────────────────────────────────────────────
//
// v0.1 payment strategy:
//   Payments are handled by manually pasted third-party invoice/payment links
//   (e.g. PayPal invoice URL, Venmo request link) sent to the requester with
//   the owner-reviewed quote. No automatic payment processing in v0.1.
//
// Future implementation may support:
//   - Stripe Payment Links / Invoice API
//   - PayPal Invoice API
//   - Supabase webhooks to confirm payment
//
// DO NOT implement Stripe/PayPal SDK integration in this scaffold.
// DO NOT collect or transmit payment card data on this frontend.
// TODO (implementation pass):
//   - Validate payment webhook signatures server-side (Edge Function).
//   - Never mark a payment as "paid" based on client-side data alone.

import type { Quote } from "../types/quotes";

/** Record that a manually-paid quote payment has been confirmed (owner action, stub). */
export async function markQuotePaid(quoteId: string): Promise<void> {
  // TODO: supabase.from("quotes").update({ payment_status: "paid", paid_at: ... })
  // Must verify owner auth before calling.
  console.warn("[paymentService] markQuotePaid is not implemented in scaffold.", { quoteId });
}

/** Mark a quote payment as waived (owner action for family requests, stub). */
export async function waivedPayment(quoteId: string): Promise<void> {
  // TODO: supabase.from("quotes").update({ payment_status: "waived" })
  // Must verify owner auth before calling.
  console.warn("[paymentService] waivedPayment is not implemented in scaffold.", { quoteId });
}

/**
 * Generate a payment URL for a quote.
 * In v0.1, the owner pastes an external invoice link manually.
 * This stub simply returns the stored URL from the quote.
 *
 * TODO (implementation pass): Validate URL domain against an allowlist
 * before presenting it as a clickable link.
 */
export function getPaymentUrl(quote: Quote): string | null {
  return quote.paymentUrl ?? null;
}
