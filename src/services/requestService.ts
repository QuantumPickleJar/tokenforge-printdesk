import { requireSupabase } from "./supabaseClient";
import { uploadStlFile } from "./storageService";
import type {
  InfillType,
  PaymentStatus,
  PrintRequest,
  RequestFile,
  RequestStatus,
  RequestType,
  SubmitPrintRequestInput,
} from "../types/printRequest";

interface RequestFileRow {
  id: string;
  request_id: string;
  bucket: "request-models";
  storage_path: string;
  original_filename: string;
  content_type: string | null;
  size_bytes: number;
  uploaded_at: string;
  expires_at: string | null;
  checksum: string | null;
  validation_status: string;
  owner_download_supported: boolean;
}

interface RequestRow {
  id: string;
  created_at: string;
  updated_at: string;
  received_at: string;
  status: RequestStatus;
  request_type: RequestType;
  payment_required: boolean;
  payment_status: PaymentStatus;
  requester_name: string;
  requester_email: string;
  request_title: string;
  request_description: string;
  material_color_id: string | null;
  model_source_url: string | null;
  licensing_confirmed: boolean;
  personal_design: boolean;
  reply_requested: boolean;
  shipping_requested: boolean;
  shipping_notes: string | null;
  advanced_mode_used: boolean;
  layer_height: number | null;
  infill_type: InfillType | null;
  infill_percent: number | null;
  wall_count: number | null;
  rough_estimated_volume_cm3: number | null;
  rough_estimated_grams: number | null;
  rough_estimated_material_cost: number | null;
  rough_estimate_version: string | null;
  rough_estimate_generated_at: string | null;
  owner_notes: string | null;
  family_group_id: string | null;
  family_member_id: string | null;
  material_colors?: { color_name: string; materials?: { material_type: string; name: string } } | null;
  request_files?: RequestFileRow[];
  quotes?: { final_asking_price: number | null }[];
}

function mapFile(row: RequestFileRow): RequestFile {
  return {
    id: row.id,
    requestId: row.request_id,
    bucket: row.bucket,
    storagePath: row.storage_path,
    originalFilename: row.original_filename,
    contentType: row.content_type,
    sizeBytes: row.size_bytes,
    uploadedAt: row.uploaded_at,
    expiresAt: row.expires_at,
    checksum: row.checksum,
    validationStatus: row.validation_status,
    ownerDownloadSupported: row.owner_download_supported,
  };
}

function mapRequest(row: RequestRow): PrintRequest {
  const files = (row.request_files ?? []).map(mapFile);
  const materialType = row.material_colors?.materials?.material_type;
  const colorName = row.material_colors?.color_name;
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    receivedAt: row.received_at,
    status: row.status,
    requestType: row.request_type,
    paymentRequired: row.payment_required,
    paymentStatus: row.payment_status,
    requesterName: row.requester_name,
    requesterEmail: row.requester_email,
    title: row.request_title,
    description: row.request_description,
    materialColorId: row.material_color_id,
    materialLabel: materialType && colorName ? `${materialType} — ${colorName}` : null,
    color: colorName ?? null,
    sourceLink: row.model_source_url,
    licensingConfirmed: row.licensing_confirmed,
    personalDesign: row.personal_design,
    replyRequested: row.reply_requested,
    shippingRequested: row.shipping_requested,
    shippingNotes: row.shipping_notes,
    familyGroupId: row.family_group_id,
    familyMemberId: row.family_member_id,
    modelAttached: files.length > 0,
    files,
    advancedMode: row.advanced_mode_used,
    advancedSettings: row.advanced_mode_used
      ? {
          layerHeight: Number(row.layer_height ?? 0.2),
          infillType: row.infill_type ?? "grid",
          infillPercent: Number(row.infill_percent ?? 15),
          wallCount: Number(row.wall_count ?? 3),
        }
      : undefined,
    roughEstimate: row.rough_estimated_grams
      ? {
          estimatedVolumeCm3: row.rough_estimated_volume_cm3 ?? undefined,
          estimatedGrams: Number(row.rough_estimated_grams),
          estimatedMaterialCost: Number(row.rough_estimated_material_cost ?? 0),
          selectedMaterialDensityGcm3: 0,
          selectedMaterialCostPerKg: 0,
          estimateVersion: row.rough_estimate_version ?? "unknown",
          generatedAt: row.rough_estimate_generated_at ?? row.created_at,
          disclaimer: "Stored rough estimate; final price is owner-reviewed.",
        }
      : undefined,
    roughMaterialEstimate: row.rough_estimated_material_cost ?? undefined,
    ownerFinalPrice: row.quotes?.[0]?.final_asking_price ?? undefined,
    ownerNotes: row.owner_notes,
  };
}

export async function submitRequest(data: SubmitPrintRequestInput): Promise<{ success: boolean; requestId: string }> {
  if (data.sourceMode === "upload" && !data.stlFile) throw new Error("An STL file is required for upload-based requests.");
  if (data.sourceMode === "link" && !data.sourceLink?.trim()) throw new Error("A model link is required for link-based requests.");

  const client = requireSupabase();
  const requestPayload = {
    requester_name: data.requesterName,
    requester_email: data.requesterEmail,
    request_title: data.title,
    request_description: data.description,
    material_color_id: data.materialColorId ?? "",
    material_request_notes: data.materialRequestNotes ?? "",
    model_source_url: data.sourceMode === "link" ? data.sourceLink?.trim() ?? "" : "",
    reply_requested: data.replyRequested,
    licensing_confirmed: data.licensingConfirmed,
    personal_design: data.personalDesign,
    shipping_requested: data.shippingRequested,
    shipping_notes: data.shippingNotes ?? "",
    advanced_mode_used: data.advancedMode,
    layer_height: data.advancedSettings?.layerHeight?.toString() ?? "",
    infill_type: data.advancedSettings?.infillType ?? "",
    infill_percent: data.advancedSettings?.infillPercent?.toString() ?? "",
    wall_count: data.advancedSettings?.wallCount?.toString() ?? "",
    rough_estimated_volume_cm3: data.roughEstimate?.estimatedVolumeCm3?.toString() ?? "",
    rough_estimated_grams: data.roughEstimate?.estimatedGrams?.toString() ?? "",
    rough_estimated_material_cost: data.roughEstimate?.estimatedMaterialCost?.toString() ?? "",
    rough_estimate_version: data.roughEstimate?.estimateVersion ?? "",
    rough_estimate_generated_at: data.roughEstimate?.generatedAt,
  };

  const { data: requestId, error } = await client.rpc("submit_print_request", { request_payload: requestPayload });
  if (error) throw error;
  if (!requestId || typeof requestId !== "string") throw new Error("Supabase did not return a request id.");

  if (data.stlFile) {
    const uploadResult = await uploadStlFile(requestId, data.stlFile);
    if (!uploadResult.success) throw new Error(uploadResult.error ?? "STL upload failed.");
  }

  return { success: true, requestId };
}

export async function fetchRequests(): Promise<PrintRequest[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("print_requests")
    .select("*, material_colors(color_name, materials(material_type, name)), request_files(*), quotes(final_asking_price)")
    .is("deleted_at", null)
    .order("received_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as unknown as RequestRow[]).map(mapRequest);
}

export async function updateRequestStatus(requestId: string, status: RequestStatus): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("print_requests").update({ status }).eq("id", requestId);
  if (error) throw error;
}

export async function bulkUpdateRequestStatus(requestIds: string[], status: RequestStatus): Promise<void> {
  if (requestIds.length === 0) return;
  const client = requireSupabase();
  const { error } = await client.from("print_requests").update({ status }).in("id", requestIds);
  if (error) throw error;
}

export async function updateOwnerNotes(requestId: string, ownerNotes: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("print_requests").update({ owner_notes: ownerNotes }).eq("id", requestId);
  if (error) throw error;
}