import { MOCK_GALLERY_ENTRIES, type GalleryEntry } from "../types/gallery";

// ─────────────────────────────────────────────
// Gallery Service — scaffold stub
// ─────────────────────────────────────────────
// TODO (implementation pass):
//   - Replace mock data with supabase.from("gallery").select("*")
//       .not("published_at", "is", null).order("printed_at", { ascending: false })
//   - Owner actions: publish, unpublish, delete.
//   - Images stored in a Supabase public bucket (separate from private STL bucket).

/** Fetch published gallery entries. Returns mock data in scaffold. */
export async function fetchPublishedGallery(): Promise<GalleryEntry[]> {
  // TODO: real Supabase query
  return MOCK_GALLERY_ENTRIES;
}

/** Fetch all gallery entries including drafts (owner-only). */
export async function fetchAllGallery(): Promise<GalleryEntry[]> {
  // TODO: authenticated owner Supabase query
  return MOCK_GALLERY_ENTRIES;
}
