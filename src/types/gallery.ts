// ─────────────────────────────────────────────
// Gallery
// ─────────────────────────────────────────────

export interface GalleryEntry {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;        // Public image URL (CDN or Supabase public bucket)
  material: string;
  color: string;
  printedAt: string;        // ISO 8601
  tags?: string[];
  publishedAt?: string;     // ISO 8601; null = draft
}

// ─────────────────────────────────────────────
// Mock Gallery Entries — scaffold only
// Replace with Supabase query in implementation pass.
// ─────────────────────────────────────────────

export const MOCK_GALLERY_ENTRIES: GalleryEntry[] = [
  {
    id: "gal-001",
    title: "Articulated Dragon",
    description: "Print-in-place articulated dragon, 45% infill gyroid.",
    material: "PLA",
    color: "Dragon Red",
    printedAt: "2024-11-10T00:00:00Z",
    tags: ["articulated", "dragon", "PLA"],
    publishedAt: "2024-11-12T00:00:00Z",
  },
  {
    id: "gal-002",
    title: "Raspberry Pi 5 Case",
    description: "Custom vented enclosure with snap-fit lid.",
    material: "PETG",
    color: "Translucent Blue",
    printedAt: "2024-12-03T00:00:00Z",
    tags: ["enclosure", "raspberry-pi", "PETG"],
    publishedAt: "2024-12-05T00:00:00Z",
  },
  {
    id: "gal-003",
    title: "Cable Clip Set (×12)",
    description: "Desk cable management clips for 3–6 mm cables.",
    material: "PLA",
    color: "Matte Black",
    printedAt: "2025-01-15T00:00:00Z",
    tags: ["utility", "cable-management", "PLA"],
    publishedAt: "2025-01-16T00:00:00Z",
  },
  {
    id: "gal-004",
    title: "Flexible Phone Stand",
    description: "Adjustable TPU phone stand — folds flat.",
    material: "TPU",
    color: "Natural",
    printedAt: "2025-02-20T00:00:00Z",
    tags: ["flexible", "TPU", "phone"],
    publishedAt: "2025-02-22T00:00:00Z",
  },
];
