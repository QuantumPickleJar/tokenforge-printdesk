import { getPublicGalleryImageUrl, uploadGalleryImage } from "./storageService";
import { requireSupabase } from "./supabaseClient";
import type { GalleryEntry, GalleryImage, GalleryItemInput, GallerySourceType } from "../types/gallery";

interface GalleryImageRow {
  id: string;
  gallery_item_id: string;
  storage_path: string;
  public_url: string | null;
  alt_text: string | null;
  sort_order: number;
}

interface GalleryRow {
  id: string;
  title: string;
  description: string | null;
  material_summary: string | null;
  color_summary: string | null;
  category: string | null;
  tags: string[] | null;
  source_type: GallerySourceType;
  model_source_url: string | null;
  designed_by_me: boolean;
  remixed_by_me: boolean;
  printed_by_me: boolean;
  notes: string | null;
  what_i_learned: string | null;
  published: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  published_at: string | null;
  gallery_images?: GalleryImageRow[];
}

function mapImage(row: GalleryImageRow): GalleryImage {
  return {
    id: row.id,
    galleryItemId: row.gallery_item_id,
    storagePath: row.storage_path,
    publicUrl: row.public_url ?? getPublicGalleryImageUrl(row.storage_path),
    altText: row.alt_text,
    sortOrder: row.sort_order,
  };
}

function mapGallery(row: GalleryRow): GalleryEntry {
  const images = (row.gallery_images ?? []).map(mapImage).sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: images[0]?.publicUrl ?? null,
    images,
    material: row.material_summary ?? "Material not listed",
    color: row.color_summary ?? "Color not listed",
    category: row.category,
    tags: row.tags ?? [],
    sourceType: row.source_type,
    modelSourceUrl: row.model_source_url,
    designedByMe: row.designed_by_me,
    remixedByMe: row.remixed_by_me,
    printedByMe: row.printed_by_me,
    notes: row.notes,
    whatILearned: row.what_i_learned,
    published: row.published,
    featured: row.featured,
    sortOrder: row.sort_order,
    printedAt: row.created_at,
    publishedAt: row.published_at,
  };
}

export async function fetchPublishedGallery(): Promise<GalleryEntry[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("gallery_items")
    .select("*, gallery_images(*)")
    .eq("published", true)
    .is("deleted_at", null)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as unknown as GalleryRow[]).map(mapGallery);
}

export async function fetchAllGallery(): Promise<GalleryEntry[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("gallery_items")
    .select("*, gallery_images(*)")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as unknown as GalleryRow[]).map(mapGallery);
}

export async function upsertGalleryItem(input: GalleryItemInput, id?: string): Promise<string> {
  const client = requireSupabase();
  const payload = {
    title: input.title.trim(),
    description: input.description || null,
    material_summary: input.materialSummary || null,
    color_summary: input.colorSummary || null,
    category: input.category || null,
    tags: input.tags ?? [],
    source_type: input.sourceType ?? "printed_model",
    model_source_url: input.modelSourceUrl || null,
    designed_by_me: input.designedByMe ?? false,
    remixed_by_me: input.remixedByMe ?? false,
    printed_by_me: input.printedByMe ?? true,
    notes: input.notes || null,
    what_i_learned: input.whatILearned || null,
    published: input.published ?? false,
    featured: input.featured ?? false,
    sort_order: input.sortOrder ?? 0,
    published_at: input.published ? new Date().toISOString() : null,
  };

  const query = id
    ? client.from("gallery_items").update(payload).eq("id", id).select("id").single()
    : client.from("gallery_items").insert(payload).select("id").single();
  const { data, error } = await query;
  if (error) throw error;
  return data.id as string;
}

export async function setGalleryPublished(id: string, published: boolean): Promise<void> {
  const client = requireSupabase();
  const { error } = await client
    .from("gallery_items")
    .update({ published, published_at: published ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
}

export async function softDeleteGalleryItem(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("gallery_items").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function addGalleryImage(galleryItemId: string, file: File, altText?: string): Promise<void> {
  const client = requireSupabase();
  const storagePath = await uploadGalleryImage(file, galleryItemId);
  const publicUrl = getPublicGalleryImageUrl(storagePath);
  const { error } = await client.from("gallery_images").insert({
    gallery_item_id: galleryItemId,
    bucket: "gallery-images",
    storage_path: storagePath,
    public_url: publicUrl,
    alt_text: altText || null,
  });
  if (error) throw error;
}
