import type { PaymentStatus } from "./printRequest";

// ─────────────────────────────────────────────
// Quote
// ─────────────────────────────────────────────

export type PaymentProvider = "manual" | "stripe" | "paypal" | "venmo" | "none";

export interface Quote {
  id: string;
  requestId: string;
  token: string;             // Secure random token sent to requester via email

  // Pricing breakdown (all USD)
  materialCost: number;
  laborCost: number;
  shippingCost: number;
  discount: number;
  finalAskingPrice: number;

  quoteNotes?: string;

  // Payment
  paymentStatus: PaymentStatus;
  paymentProvider: PaymentProvider;
  paymentUrl?: string;       // Externally generated invoice/payment link
  // TODO: In implementation pass, validate paymentUrl domain and sanitize
  // before displaying as a link to the requester.

  // Lifecycle timestamps
  expiresAt?: string;        // ISO 8601
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  declinedAt?: string;
  paidAt?: string;
}

// ─────────────────────────────────────────────
// Mock Quote — scaffold only
// ─────────────────────────────────────────────

export const MOCK_QUOTE: Quote = {
  id: "quote-mock-001",
  requestId: "req-mock-001",
  token: "MOCK-TOKEN-PREVIEW",
  materialCost: 3.20,
  laborCost: 5.00,
  shippingCost: 0,
  discount: 0,
  finalAskingPrice: 8.20,
  quoteNotes: "This is a mock quote for scaffold demonstration only.",
  paymentStatus: "not_started",
  paymentProvider: "manual",
  expiresAt: "2025-12-31T23:59:59Z",
  sentAt: "2025-06-01T10:00:00Z",
};
