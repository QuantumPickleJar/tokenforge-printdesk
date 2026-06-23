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

export type InfillType = "grid" | "gyroid" | "honeycomb" | "triangles" | "cubic" | "lines";

export interface AdvancedPrintSettings {
  layerHeight: number;
  infillType: InfillType;
  infillPercent: number;
  wallCount: number;
}

export interface RoughMaterialEstimate {
  estimatedVolumeCm3?: number;
  estimatedGrams: number;
  estimatedMaterialCost: number;
  selectedMaterialDensityGcm3: number;
  selectedMaterialCostPerKg: number;
  estimateVersion: string;
  generatedAt: string;
  disclaimer: string;
}

export interface RequestFile {
  id: string;
  requestId: string;
  bucket: "request-models";
  storagePath: string;
  originalFilename: string;
  contentType?: string | null;
  sizeBytes: number;
  uploadedAt: string;
  expiresAt?: string | null;
  checksum?: string | null;
  validationStatus: string;
  ownerDownloadSupported: boolean;
}

export interface RequestEvent {
  id: string;
  requestId: string;
  eventType: string;
  message?: string | null;
  actor: string;
  createdAt: string;
}

export interface PrintRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
  receivedAt: string;
  status: RequestStatus;
  requestType: RequestType;
  paymentRequired: boolean;
  paymentStatus: PaymentStatus;
  requesterName: string;
  requesterEmail: string;
  familyGroupId?: string | null;
  familyMemberId?: string | null;
  title: string;
  description: string;
  materialColorId?: string | null;
  materialLabel?: string | null;
  color?: string | null;
  sourceLink?: string | null;
  licensingConfirmed: boolean;
  personalDesign: boolean;
  replyRequested: boolean;
  shippingRequested: boolean;
  shippingNotes?: string | null;
  modelAttached: boolean;
  files: RequestFile[];
  advancedMode: boolean;
  advancedSettings?: AdvancedPrintSettings;
  roughEstimate?: RoughMaterialEstimate;
  roughMaterialEstimate?: number;
  ownerFinalPrice?: number;
  ownerNotes?: string | null;
}

export interface SubmitPrintRequestInput {
  requesterName: string;
  requesterEmail: string;
  title: string;
  description: string;
  materialColorId?: string;
  materialRequestNotes?: string;
  sourceLink?: string;
  replyRequested: boolean;
  licensingConfirmed: boolean;
  personalDesign: boolean;
  shippingRequested: boolean;
  shippingNotes?: string;
  advancedMode: boolean;
  advancedSettings?: AdvancedPrintSettings;
  roughEstimate?: RoughMaterialEstimate;
  stlFile?: File;
}

export const REQUEST_STATUS_OPTIONS: RequestStatus[] = [
  "submitted",
  "reviewing",
  "needs_more_info",
  "accepted",
  "accepted_for_quote",
  "quote_draft",
  "quoted",
  "quote_viewed",
  "quote_accepted",
  "payment_pending",
  "paid",
  "printing",
  "ready_for_pickup",
  "shipped",
  "completed",
  "declined",
  "canceled",
  "archived",
];
