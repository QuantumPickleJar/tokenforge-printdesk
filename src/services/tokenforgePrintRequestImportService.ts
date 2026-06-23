import { requireSupabase } from "./supabaseClient";
import { summarizeTokenforgePayload } from "./tokenforgePrintRequestPayload";
import type { RequestType } from "../types/printRequest";
import type { TokenforgePrintRequestPayload } from "../types/tokenforgePrintRequest";

function firstNonEmpty(...values: Array<string | undefined | null>): string {
  return values.map((value) => value?.trim() ?? "").find(Boolean) ?? "";
}

function normalizeUrl(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return parsed.toString();
  } catch {
    // Keep non-URL package paths out of model_source_url; they remain in owner notes.
  }
  return null;
}

function requestTypeForPricingMode(pricingMode: TokenforgePrintRequestPayload["pricingMode"]): RequestType {
  if (pricingMode === "family" || pricingMode === "free") return "family_free";
  return "public_quote";
}

function paymentRequiredForPricingMode(pricingMode: TokenforgePrintRequestPayload["pricingMode"]): boolean {
  return pricingMode !== "family" && pricingMode !== "free";
}

function paymentStatusForPricingMode(pricingMode: TokenforgePrintRequestPayload["pricingMode"]): "not_started" | "not_required" | "waived" {
  if (pricingMode === "family") return "not_required";
  if (pricingMode === "free") return "waived";
  return "not_started";
}

export async function importTokenforgePrintRequest(payload: TokenforgePrintRequestPayload): Promise<string> {
  const client = requireSupabase();
  const title = firstNonEmpty(payload.item.name, payload.source.projectName, "Tokenforge print request");
  const description = summarizeTokenforgePayload(payload) || "Imported from Tokenforge Generator.";
  const sourceLink = normalizeUrl(payload.item.modelUrl) ?? normalizeUrl(payload.attachments.stlPath) ?? normalizeUrl(payload.attachments.packagePath);
  const pricingMode = payload.pricingMode ?? "quote";

  const { data, error } = await client
    .from("print_requests")
    .insert({
      status: "submitted",
      request_type: requestTypeForPricingMode(pricingMode),
      payment_required: paymentRequiredForPricingMode(pricingMode),
      payment_status: paymentStatusForPricingMode(pricingMode),
      requester_name: firstNonEmpty(payload.customer.displayName, "Tokenforge requester"),
      requester_email: firstNonEmpty(payload.customer.contact, "tokenforge-requester@example.invalid"),
      request_title: title,
      request_description: description,
      material_request_notes: firstNonEmpty(
        payload.print.material,
        payload.print.colors?.join(", "),
        payload.print.notes,
      ),
      model_source_url: sourceLink,
      licensing_confirmed: true,
      personal_design: false,
      reply_requested: true,
      shipping_requested: false,
      advanced_mode_used: true,
      layer_height: payload.print.layerHeightMm ?? null,
      infill_type: null,
      infill_percent: null,
      wall_count: null,
      rough_estimated_grams: payload.print.estimatedGrams ?? null,
      rough_estimated_material_cost: null,
      rough_estimate_version: payload.source.generatorVersion ?? "tokenforge-generator",
      rough_estimate_generated_at: payload.createdAt ?? new Date().toISOString(),
      owner_notes: [
        `Imported from Tokenforge Generator as ${pricingMode} request.`,
        payload.item.galleryUrl ? `Gallery URL: ${payload.item.galleryUrl}` : "",
        payload.item.imageUrl ? `Image URL: ${payload.item.imageUrl}` : "",
        payload.item.previewUrl ? `Preview URL: ${payload.item.previewUrl}` : "",
        payload.attachments.packagePath ? `Package path: ${payload.attachments.packagePath}` : "",
        payload.attachments.metadataPath ? `Metadata path: ${payload.attachments.metadataPath}` : "",
        payload.source.projectName ? `Project: ${payload.source.projectName}` : "",
      ].filter(Boolean).join("\n"),
    })
    .select("id")
    .single();

  if (error) throw error;
  if (!data?.id || typeof data.id !== "string") throw new Error("Imported request was not assigned an id.");
  return data.id;
}
