import type { PaymentStatus } from "./printRequest";

export type PaymentProvider = "manual" | "stripe" | "paypal" | "venmo" | "cash" | "none";

export interface Quote {
  id: string;
  requestId: string;
  requestTitle?: string;
  token: string;
  materialCost: number;
  laborCost: number;
  shippingCost: number;
  discount: number;
  finalAskingPrice: number;
  quoteNotes?: string | null;
  paymentStatus: PaymentStatus;
  paymentProvider: PaymentProvider;
  paymentUrl?: string | null;
  expiresAt?: string | null;
  sentAt?: string | null;
  viewedAt?: string | null;
  acceptedAt?: string | null;
  declinedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuoteInput {
  requestId: string;
  materialCost: number;
  laborCost: number;
  shippingCost: number;
  discount: number;
  finalAskingPrice: number;
  quoteNotes?: string;
  paymentProvider: PaymentProvider;
  paymentUrl?: string;
  expiresAt?: string;
}
