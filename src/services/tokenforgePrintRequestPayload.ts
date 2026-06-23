import type { ParseTokenforgePrintRequestResult, TokenforgePrintRequestPayload } from "../types/tokenforgePrintRequest";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function assertObject(value: unknown, path: string): asserts value is Record<string, unknown> {
  if (!isObject(value)) throw new Error(`${path} must be an object.`);
}

function assertOptionalString(value: unknown, path: string): void {
  if (value != null && typeof value !== "string") throw new Error(`${path} must be a string when provided.`);
}

function assertOptionalNumber(value: unknown, path: string): void {
  if (value != null && typeof value !== "number") throw new Error(`${path} must be a number when provided.`);
}

export function validateTokenforgePrintRequestPayload(value: unknown): TokenforgePrintRequestPayload {
  assertObject(value, "payload");
  if (value.schema !== "tokenforge.print-request.v1") {
    throw new Error('schema must be "tokenforge.print-request.v1".');
  }

  assertObject(value.source, "source");
  assertObject(value.customer, "customer");
  assertObject(value.item, "item");
  assertObject(value.print, "print");
  assertObject(value.attachments, "attachments");

  assertOptionalString(value.createdAt, "createdAt");
  assertOptionalString(value.source.generatorVersion, "source.generatorVersion");
  assertOptionalString(value.source.projectName, "source.projectName");
  assertOptionalString(value.customer.displayName, "customer.displayName");
  assertOptionalString(value.customer.contact, "customer.contact");
  assertOptionalString(value.customer.notes, "customer.notes");
  assertOptionalString(value.item.name, "item.name");
  assertOptionalString(value.item.description, "item.description");
  assertOptionalString(value.item.galleryUrl, "item.galleryUrl");
  assertOptionalString(value.item.imageUrl, "item.imageUrl");
  assertOptionalString(value.item.modelUrl, "item.modelUrl");
  assertOptionalString(value.item.previewUrl, "item.previewUrl");
  assertOptionalString(value.print.category, "print.category");
  assertOptionalString(value.print.material, "print.material");
  assertOptionalNumber(value.print.nozzleMm, "print.nozzleMm");
  assertOptionalNumber(value.print.layerHeightMm, "print.layerHeightMm");
  assertOptionalNumber(value.print.estimatedGrams, "print.estimatedGrams");
  assertOptionalNumber(value.print.estimatedTimeMinutes, "print.estimatedTimeMinutes");
  assertOptionalNumber(value.print.requestedQuantity, "print.requestedQuantity");
  assertOptionalString(value.print.notes, "print.notes");
  if (value.print.colors != null && !isStringArray(value.print.colors)) {
    throw new Error("print.colors must be an array of strings when provided.");
  }
  assertOptionalString(value.attachments.packagePath, "attachments.packagePath");
  assertOptionalString(value.attachments.stlPath, "attachments.stlPath");
  assertOptionalString(value.attachments.previewPath, "attachments.previewPath");
  assertOptionalString(value.attachments.metadataPath, "attachments.metadataPath");

  if (value.pricingMode != null && value.pricingMode !== "quote" && value.pricingMode !== "family" && value.pricingMode !== "free") {
    throw new Error('pricingMode must be "quote", "family", or "free" when provided.');
  }

  // The runtime assertions above establish the external JSON shape; TypeScript cannot infer that from Record<string, unknown> alone.
  return value as unknown as TokenforgePrintRequestPayload;
}

export function parseTokenforgePrintRequestJson(jsonText: string): ParseTokenforgePrintRequestResult {
  try {
    const parsed = JSON.parse(jsonText) as unknown;
    return { ok: true, payload: validateTokenforgePrintRequestPayload(parsed) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Tokenforge request JSON could not be parsed.",
    };
  }
}

export function summarizeTokenforgePayload(payload: TokenforgePrintRequestPayload): string {
  const parts = [
    payload.item.description,
    payload.print.category ? `Category: ${payload.print.category}` : "",
    payload.item.galleryUrl ? `Gallery: ${payload.item.galleryUrl}` : "",
    payload.item.imageUrl ? `Image: ${payload.item.imageUrl}` : "",
    payload.item.previewUrl ? `Preview: ${payload.item.previewUrl}` : "",
    payload.attachments.packagePath ? `Package: ${payload.attachments.packagePath}` : "",
    payload.attachments.metadataPath ? `Metadata: ${payload.attachments.metadataPath}` : "",
    payload.print.colors?.length ? `Colors: ${payload.print.colors.join(", ")}` : "",
    payload.print.estimatedTimeMinutes != null ? `Estimated time: ${payload.print.estimatedTimeMinutes} minutes` : "",
    payload.print.requestedQuantity != null ? `Quantity: ${payload.print.requestedQuantity}` : "",
    payload.print.notes ? `Print notes: ${payload.print.notes}` : "",
    payload.customer.notes ? `Customer notes: ${payload.customer.notes}` : "",
  ];
  return parts.filter(Boolean).join("\n");
}
