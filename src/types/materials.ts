// ─────────────────────────────────────────────
// Materials
// ─────────────────────────────────────────────

export type FilamentType =
  | "PLA"
  | "PETG"
  | "ABS"
  | "ASA"
  | "TPU"
  | "Resin"
  | "Other";

export interface Material {
  id: string;
  name: string;             // e.g. "Overture PLA Matte"
  filamentType: FilamentType;
  color: string;            // e.g. "Marble White"
  hexColor?: string;        // e.g. "#F0EBE3"
  costPerGram: number;      // USD
  inStock: boolean;
  notes?: string;
}

// ─────────────────────────────────────────────
// Mock Materials — scaffold only
// Replace with Supabase query in implementation pass.
// ─────────────────────────────────────────────

export const MOCK_MATERIALS: Material[] = [
  {
    id: "mat-001",
    name: "Overture PLA Matte",
    filamentType: "PLA",
    color: "Black",
    hexColor: "#1a1a1a",
    costPerGram: 0.018,
    inStock: true,
  },
  {
    id: "mat-002",
    name: "Overture PLA Matte",
    filamentType: "PLA",
    color: "White",
    hexColor: "#f5f5f5",
    costPerGram: 0.018,
    inStock: true,
  },
  {
    id: "mat-003",
    name: "Hatchbox PETG",
    filamentType: "PETG",
    color: "Translucent Blue",
    hexColor: "#5b8de0",
    costPerGram: 0.022,
    inStock: true,
  },
  {
    id: "mat-004",
    name: "eSUN TPU 95A",
    filamentType: "TPU",
    color: "Natural",
    hexColor: "#e8dcc8",
    costPerGram: 0.035,
    inStock: false,
    notes: "Flexible filament — limited availability",
  },
];
