import { getPublicGalleryImageUrl, uploadGalleryImage } from "./storageService";
import { isSupabaseConfigured, requireSupabase } from "./supabaseClient";
import type { GalleryEntry, GalleryImage, GalleryItemInput, GallerySourceType } from "../types/gallery";

const PORTFOLIO_GALLERY_JSON_URL = import.meta.env.VITE_PORTFOLIO_GALLERY_JSON_URL
  ?? "https://quantumpicklejar.github.io/Personal-Static/data/3d-print-gallery.json";
const PORTFOLIO_GALLERY_BASE_URL = import.meta.env.VITE_PORTFOLIO_GALLERY_BASE_URL
  ?? new URL("../", PORTFOLIO_GALLERY_JSON_URL).toString();

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

interface PortfolioGalleryEntry {
  id?: string;
  title?: string;
  name?: string;
  shortDescription?: string;
  description?: string;
  longDescription?: string;
  material?: string;
  colors?: string[] | string;
  category?: string;
  categories?: string[] | string;
  tags?: string[] | string;
  sourceType?: string;
  modelUrl?: string;
  modelSourceUrl?: string;
  link?: string;
  notes?: string;
  whatILearned?: string;
  image?: string;
  images?: string[] | string;
  alt?: string;
  altText?: string;
  status?: string;
  updatedAt?: string;
  createdAt?: string;
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((entry): entry is string => typeof entry === "string" && Boolean(entry.trim())).map((entry) => entry.trim());
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function resolvePortfolioUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value, PORTFOLIO_GALLERY_BASE_URL).toString();
  } catch {
    return value;
  }
}

function mapPortfolioSourceType(value: string | undefined): GallerySourceType {
  if (value === "designed" || value === "designed_by_me") return "designed_by_me";
  if (value === "remixed" || value === "remixed_by_me") return "remixed_by_me";
  if (value === "other") return "other";
  return "printed_model";
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

function mapPortfolioGallery(entry: PortfolioGalleryEntry, index: number): GalleryEntry {
  const id = entry.id || `portfolio-gallery-${index + 1}`;
  const title = entry.title || entry.name || "Untitled print";
  const description = entry.shortDescription || entry.description || entry.longDescription || null;
  const imagePaths = toArray(entry.images).length ? toArray(entry.images) : toArray(entry.image);
  const images: GalleryImage[] = imagePaths.map((imagePath, imageIndex) => ({
    id: `${id}-image-${imageIndex + 1}`,
    galleryItemId: id,
    storagePath: imagePath,
    publicUrl: resolvePortfolioUrl(imagePath),
    altText: entry.alt || entry.altText || `${title} photo`,
    sortOrder: imageIndex,
  }));
  const sourceType = mapPortfolioSourceType(entry.sourceType);
  const printedAt = entry.updatedAt || entry.createdAt || new Date(0).toISOString();

  return {
    id,
    title,
    description,
    imageUrl: images[0]?.publicUrl ?? resolvePortfolioUrl(entry.image),
    images,
    material: entry.material || "Material not listed",
    color: toArray(entry.colors).join(", ") || "Color not listed",
    category: toArray(entry.categories)[0] || entry.category || null,
    tags: toArray(entry.tags),
    sourceType,
    modelSourceUrl: entry.modelUrl || entry.modelSourceUrl || entry.link || null,
    designedByMe: sourceType === "designed_by_me",
    remixedByMe: sourceType === "remixed_by_me",
    printedByMe: sourceType === "printed_model",
    notes: entry.notes || null,
    whatILearned: entry.whatILearned || entry.longDescription || null,
    published: true,
    featured: false,
    sortOrder: index,
    printedAt,
    publishedAt: printedAt,
  };
}

async function fetchPortfolioGalleryFallback(): Promise<GalleryEntry[]> {
  const response = await fetch(PORTFOLIO_GALLERY_JSON_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`Portfolio gallery JSON returned ${response.status}.`);
  const payload = await response.json() as { entries?: PortfolioGalleryEntry[] } | PortfolioGalleryEntry[];
  const entries = Array.isArray(payload) ? payload : payload.entries ?? [];
  return entries.map(mapPortfolioGallery);
}

export async function fetchPublishedGallery(): Promise<GalleryEntry[]> {
  if (!isSupabaseConfigured()) {
    return fetchPortfolioGalleryFallback();
  }

  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from("gallery_items")
      .select("*, gallery_images(*)")
      .eq("published", true)
      .is("deleted_at", null)
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true });
    if (error) throw error;
    const supabaseEntries = ((data ?? []) as unknown as GalleryRow[]).map(mapGallery);
    return supabaseEntries.length ? supabaseEntries : fetchPortfolioGalleryFallback();
  } catch {
    return fetchPortfolioGalleryFallback();
  }
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
