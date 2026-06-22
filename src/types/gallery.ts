export type GallerySourceType = "designed_by_me" | "remixed_by_me" | "printed_model" | "other";

export interface GalleryImage {
  id: string;
  galleryItemId: string;
  storagePath: string;
  publicUrl?: string | null;
  altText?: string | null;
  sortOrder: number;
}

export interface GalleryEntry {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  images: GalleryImage[];
  material: string;
  color: string;
  category?: string | null;
  tags: string[];
  sourceType: GallerySourceType;
  modelSourceUrl?: string | null;
  designedByMe: boolean;
  remixedByMe: boolean;
  printedByMe: boolean;
  notes?: string | null;
  whatILearned?: string | null;
  published: boolean;
  featured: boolean;
  sortOrder: number;
  printedAt: string;
  publishedAt?: string | null;
}

export interface GalleryItemInput {
  title: string;
  description?: string;
  materialSummary?: string;
  colorSummary?: string;
  category?: string;
  tags?: string[];
  sourceType?: GallerySourceType;
  modelSourceUrl?: string;
  designedByMe?: boolean;
  remixedByMe?: boolean;
  printedByMe?: boolean;
  notes?: string;
  whatILearned?: string;
  published?: boolean;
  featured?: boolean;
  sortOrder?: number;
}
