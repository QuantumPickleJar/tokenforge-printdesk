export type TokenforgePricingMode = "quote" | "family" | "free";

export interface TokenforgePrintRequestPayload {
  schema: "tokenforge.print-request.v1";
  createdAt?: string;
  source: {
    handoff?: unknown;
    generatorVersion?: string;
    projectName?: string;
  };
  customer: {
    displayName?: string;
    contact?: string;
    notes?: string;
  };
  item: {
    name?: string;
    description?: string;
    galleryUrl?: string;
    imageUrl?: string;
    modelUrl?: string;
    previewUrl?: string;
  };
  print: {
    category?: string;
    material?: string;
    nozzleMm?: number | null;
    layerHeightMm?: number | null;
    colors?: string[];
    estimatedGrams?: number | null;
    estimatedTimeMinutes?: number | null;
    requestedQuantity?: number;
    notes?: string;
  };
  attachments: {
    packagePath?: string;
    stlPath?: string;
    previewPath?: string;
    metadataPath?: string;
  };
  state?: {
    status?: string;
    quoteStatus?: string;
    paymentStatus?: string;
  };
  pricingMode?: TokenforgePricingMode;
}

export interface ParseTokenforgePrintRequestResult {
  ok: boolean;
  payload?: TokenforgePrintRequestPayload;
  error?: string;
}
