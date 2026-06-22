// ─────────────────────────────────────────────
// Print Request Status Model
// ─────────────────────────────────────────────

export type RequestStatus =
  | "submitted"
  | "reviewing"
  | "needs_more_info"
  | "accepted"
  | "accepted_for_quote"
  | "quote_draft"
  | "quoted"
  | "quote_viewed"
  | "quote_accepted"
  | "payment_pending"
  | "paid"
  | "printing"
  | "ready_for_pickup"
  | "shipped"
  | "completed"
  | "declined"
  | "canceled"
  | "archived";

export type RequestType = "public_quote" | "family_free" | "owner_internal";

export type PaymentStatus =
  | "not_required"
  | "not_started"
  | "pending"
  | "paid"
  | "waived"
  | "failed"
  | "refunded";

// ─────────────────────────────────────────────
// Advanced Print Settings
// ─────────────────────────────────────────────

export type InfillType =
  | "grid"
  | "gyroid"
  | "honeycomb"
  | "triangles"
  | "cubic"
  | "lines";

export interface AdvancedPrintSettings {
  layerHeight: number;       // mm, e.g. 0.2
  infillType: InfillType;
  infillPercent: number;     // 0–100
  wallCount: number;
}

// ─────────────────────────────────────────────
// Print Request
// ─────────────────────────────────────────────

export interface PrintRequest {
  id: string;
  createdAt: string;         // ISO 8601
  updatedAt: string;
  status: RequestStatus;
  requestType: RequestType;
  paymentStatus: PaymentStatus;

  // Requester info
  requesterName: string;
  requesterEmail: string;
  familyGroupId?: string;

  // Request details
  title: string;
  description: string;
  materialId?: string;
  color?: string;
  sourceLink?: string;

  // Licensing confirmations
  licensingConfirmed: boolean;
  personalDesign: boolean;
  replyRequested: boolean;

  // Shipping
  shippingRequested: boolean;

  // STL
  stlFileKey?: string;       // Supabase Storage object key (private bucket)
  modelAttached: boolean;

  // Advanced settings
  advancedMode: boolean;
  advancedSettings?: AdvancedPrintSettings;

  // Estimates & pricing
  roughMaterialEstimate?: number;  // USD, machine-generated rough estimate
  ownerFinalPrice?: number;        // USD, set by owner
  ownerNotes?: string;
}

// ─────────────────────────────────────────────
// Mock data shape used in the scaffold
// ─────────────────────────────────────────────

export interface MockRequestRow extends PrintRequest {
  familyBadge: boolean;   // true if family/trusted requester
}
