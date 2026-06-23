export const TOKENFORGE_PRINT_REQUEST_SCHEMA = "tokenforge.print-request.v1";

export type PricingMode = "quote" | "family" | "free";

export interface TokenforgePrintRequestPayload {
  schema: typeof TOKENFORGE_PRINT_REQUEST_SCHEMA;
  createdAt: string;
  pricingMode: PricingMode;
  source: {
    handoff: Record<string, unknown>;
    generatorVersion: string;
    projectName: string;
  };
  customer: {
    displayName: string;
    contact: string;
    notes: string;
  };
  item: {
    name: string;
    description: string;
    galleryUrl: string;
    imageUrl: string;
    modelUrl: string;
    previewUrl: string;
  };
  print: {
    category: string;
    material: string;
    nozzleMm: number | null;
    layerHeightMm: number | null;
    colors: string[];
    estimatedGrams: number | null;
    estimatedTimeMinutes: number | null;
    requestedQuantity: number;
    notes: string;
  };
  attachments: {
    packagePath: string;
    stlPath: string;
    previewPath: string;
    metadataPath: string;
  };
  state: {
    status: string;
    quoteStatus: string;
    paymentStatus: string;
  };
}

export interface TokenforgeValidationResult {
  valid: boolean;
  payload?: TokenforgePrintRequestPayload;
  errors: string[];
  warnings: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(source: Record<string, unknown>, key: string): number | null {
  const value = source[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function readStringArray(source: Record<string, unknown>, key: string): string[] {
  const value = source[key];
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean);
}

export function normalizePricingMode(value: unknown): PricingMode {
  return value === "family" || value === "free" ? value : "quote";
}

export function isSafeHttpUrl(value: string): boolean {
  if (!value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function parseTokenforgePrintRequestJson(rawJson: string): TokenforgeValidationResult {
  try {
    return validateTokenforgePrintRequestPayload(JSON.parse(rawJson));
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof SyntaxError ? error.message : "JSON could not be parsed."],
      warnings: [],
    };
  }
}

export function validateTokenforgePrintRequestPayload(value: unknown): TokenforgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(value)) {
    return { valid: false, errors: ["The request payload must be a JSON object."], warnings };
  }

  const source = isRecord(value.source) ? value.source : {};
  const customer = isRecord(value.customer) ? value.customer : {};
  const item = isRecord(value.item) ? value.item : {};
  const print = isRecord(value.print) ? value.print : {};
  const attachments = isRecord(value.attachments) ? value.attachments : {};
  const state = isRecord(value.state) ? value.state : {};

  const schema = readString(value, "schema");
  if (schema !== TOKENFORGE_PRINT_REQUEST_SCHEMA) {
    errors.push(`Expected schema "${TOKENFORGE_PRINT_REQUEST_SCHEMA}".`);
  }

  const displayName = readString(customer, "displayName");
  const contact = readString(customer, "contact");
  const itemName = readString(item, "name");
  const itemDescription = readString(item, "description");

  if (!displayName) errors.push("customer.displayName is required.");
  if (!contact) errors.push("customer.contact is required.");
  if (!itemName) errors.push("item.name is required.");
  if (!itemDescription && !readString(print, "notes")) warnings.push("item.description or print.notes should explain what the owner is reviewing.");

  const requestedQuantity = Math.max(1, Math.floor(readNumber(print, "requestedQuantity") ?? 1));
  const pricingMode = normalizePricingMode(value.pricingMode);

  const normalized: TokenforgePrintRequestPayload = {
    schema: TOKENFORGE_PRINT_REQUEST_SCHEMA,
    createdAt: readString(value, "createdAt") || new Date().toISOString(),
    pricingMode,
    source: {
      handoff: isRecord(source.handoff) ? source.handoff : {},
      generatorVersion: readString(source, "generatorVersion"),
      projectName: readString(source, "projectName"),
    },
    customer: {
      displayName,
      contact,
      notes: readString(customer, "notes"),
    },
    item: {
      name: itemName,
      description: itemDescription,
      galleryUrl: readString(item, "galleryUrl"),
      imageUrl: readString(item, "imageUrl"),
      modelUrl: readString(item, "modelUrl"),
      previewUrl: readString(item, "previewUrl"),
    },
    print: {
      category: readString(print, "category"),
      material: readString(print, "material"),
      nozzleMm: readNumber(print, "nozzleMm"),
      layerHeightMm: readNumber(print, "layerHeightMm"),
      colors: readStringArray(print, "colors"),
      estimatedGrams: readNumber(print, "estimatedGrams"),
      estimatedTimeMinutes: readNumber(print, "estimatedTimeMinutes"),
      requestedQuantity,
      notes: readString(print, "notes"),
    },
    attachments: {
      packagePath: readString(attachments, "packagePath"),
      stlPath: readString(attachments, "stlPath"),
      previewPath: readString(attachments, "previewPath"),
      metadataPath: readString(attachments, "metadataPath"),
    },
    state: {
      status: readString(state, "status") || "new",
      quoteStatus: readString(state, "quoteStatus") || "not_quoted",
      paymentStatus: readString(state, "paymentStatus") || "not_requested",
    },
  };

  const maybeExternalUrls = [
    ["item.galleryUrl", normalized.item.galleryUrl],
    ["item.imageUrl", normalized.item.imageUrl],
    ["item.modelUrl", normalized.item.modelUrl],
    ["item.previewUrl", normalized.item.previewUrl],
  ];

  for (const [label, url] of maybeExternalUrls) {
    if (url && !isSafeHttpUrl(url)) warnings.push(`${label} is not an http(s) URL, so it will be shown as text instead of opened as a link.`);
  }

  return { valid: errors.length === 0, payload: errors.length === 0 ? normalized : undefined, errors, warnings };
}
