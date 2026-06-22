import { requireSupabase } from "./supabaseClient";
import { validateStlFile } from "./stlAnalyzer";

export const REQUEST_MODELS_BUCKET = "request-models";
export const GALLERY_IMAGES_BUCKET = "gallery-images";

export function getRequestModelPath(requestId: string): string {
  return `requests/${requestId}/model.stl`;
}

export async function uploadStlFile(
  requestId: string,
  file: File
): Promise<{ success: boolean; storageKey?: string; error?: string }> {
  const validation = validateStlFile(file);
  if (!validation.valid) return { success: false, error: validation.error };

  const client = requireSupabase();
  const storageKey = getRequestModelPath(requestId);
  const { error: uploadError } = await client.storage
    .from(REQUEST_MODELS_BUCKET)
    .upload(storageKey, file, {
      cacheControl: "0",
      contentType: file.type || "model/stl",
      upsert: false,
    });

  if (uploadError) return { success: false, error: uploadError.message };

  const { error: metadataError } = await client.rpc("record_request_file", {
    p_request_id: requestId,
    p_storage_path: storageKey,
    p_original_filename: file.name,
    p_content_type: file.type || "model/stl",
    p_size_bytes: file.size,
  });

  if (metadataError) return { success: false, error: metadataError.message };
  return { success: true, storageKey };
}

export async function getSignedStlUrl(storageKey: string, expiresInSeconds = 300): Promise<string | null> {
  const client = requireSupabase();
  const { data, error } = await client.storage
    .from(REQUEST_MODELS_BUCKET)
    .createSignedUrl(storageKey, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

export async function uploadGalleryImage(file: File, galleryItemId: string): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Gallery uploads must be image files.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Gallery images must be 10 MB or less.");
  }

  const client = requireSupabase();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `gallery/${galleryItemId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from(GALLERY_IMAGES_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export function getPublicGalleryImageUrl(storagePath: string): string | null {
  const client = requireSupabase();
  const { data } = client.storage.from(GALLERY_IMAGES_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}
