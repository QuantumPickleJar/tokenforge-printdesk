// ─────────────────────────────────────────────
// Storage Service — scaffold stub
// ─────────────────────────────────────────────
// Handles private STL file storage via Supabase Storage.
//
// IMPORTANT SECURITY NOTES (implementation pass):
//   - STL files must be stored in a PRIVATE Supabase Storage bucket.
//   - Never expose STL files publicly via a public bucket URL.
//   - Validate file type (must be .stl or .3mf), size, and basic header
//     integrity BEFORE uploading.
//   - Generate a unique storage key per request, never use requester-supplied
//     filenames directly as storage keys.
//   - Signed URLs with short expiry should be used when the owner needs to
//     download a file for review.
//   - TODO: Enforce per-user upload quotas.

/** Upload an STL file to private storage (stub — not implemented). */
export async function uploadStlFile(
  _requestId: string,
  _file: File
): Promise<{ success: boolean; storageKey?: string; error?: string }> {
  // TODO (implementation pass):
  //   1. Validate file.type and file.name extension (.stl, .3mf only).
  //   2. Validate file.size <= configured max (e.g. 50 MB).
  //   3. Perform basic STL header check before upload.
  //   4. Generate key: `stl/${_requestId}/${crypto.randomUUID()}.stl`
  //   5. supabase!.storage.from("private-stl").upload(key, _file, { upsert: false })
  console.warn("[storageService] uploadStlFile is not implemented in scaffold.");
  return { success: false, error: "STL upload is not implemented in this scaffold." };
}

/** Generate a short-lived signed download URL for an STL file (owner only, stub). */
export async function getSignedStlUrl(
  _storageKey: string,
  _expiresInSeconds = 300
): Promise<string | null> {
  // TODO: supabase!.storage.from("private-stl").createSignedUrl(_storageKey, _expiresInSeconds)
  // Must verify owner session before calling.
  console.warn("[storageService] getSignedStlUrl is not implemented in scaffold.");
  return null;
}
