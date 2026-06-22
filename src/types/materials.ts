export type MaterialType = "PLA" | "PETG";

export interface Material {
  id: string;
  name: string;
  materialType: MaterialType;
  densityGcm3: number;
  costPerKg: number;
  active: boolean;
  printNotes?: string | null;
  sortOrder: number;
}

export interface MaterialColor {
  id: string;
  materialId: string;
  colorName: string;
  brand?: string | null;
  hexColor?: string | null;
  active: boolean;
  printNotes?: string | null;
  sortOrder: number;
}

export interface MaterialVariant extends MaterialColor {
  materialName: string;
  materialType: MaterialType;
  densityGcm3: number;
  costPerKg: number;
  costPerGram: number;
  label: string;
}

export interface MaterialFormInput {
  name: string;
  materialType: MaterialType;
  densityGcm3: number;
  costPerKg: number;
  active: boolean;
  printNotes?: string;
  sortOrder?: number;
}

export interface MaterialColorFormInput {
  materialId: string;
  colorName: string;
  brand?: string;
  hexColor?: string;
  active: boolean;
  printNotes?: string;
  sortOrder?: number;
}

export function makeMaterialVariant(material: Material, color: MaterialColor): MaterialVariant {
  return {
    ...color,
    materialName: material.name,
    materialType: material.materialType,
    densityGcm3: material.densityGcm3,
    costPerKg: material.costPerKg,
    costPerGram: material.costPerKg / 1000,
    label: `${material.materialType} — ${color.colorName}${color.brand ? ` (${color.brand})` : ""}`,
  };
}

export const FALLBACK_MATERIALS: Material[] = [
  {
    id: "00000000-0000-0000-0000-000000000101",
    name: "Generic PLA",
    materialType: "PLA",
    densityGcm3: 1.24,
    costPerKg: 22,
    active: true,
    printNotes: "Fallback only; edit seeded Supabase materials after migration.",
    sortOrder: 10,
  },
  {
    id: "00000000-0000-0000-0000-000000000102",
    name: "Generic PETG",
    materialType: "PETG",
    densityGcm3: 1.27,
    costPerKg: 26,
    active: true,
    printNotes: "Fallback only; edit seeded Supabase materials after migration.",
    sortOrder: 20,
  },
];

export const FALLBACK_MATERIAL_COLORS: MaterialColor[] = [
  {
    id: "00000000-0000-0000-0000-000000000201",
    materialId: "00000000-0000-0000-0000-000000000101",
    colorName: "Black",
    hexColor: "#1f1f1f",
    active: true,
    sortOrder: 10,
  },
  {
    id: "00000000-0000-0000-0000-000000000202",
    materialId: "00000000-0000-0000-0000-000000000101",
    colorName: "White",
    hexColor: "#f3f3f3",
    active: true,
    sortOrder: 20,
  },
  {
    id: "00000000-0000-0000-0000-000000000203",
    materialId: "00000000-0000-0000-0000-000000000102",
    colorName: "Translucent Blue",
    hexColor: "#5b8de0",
    active: true,
    sortOrder: 30,
  },
];

export const FALLBACK_MATERIAL_VARIANTS = FALLBACK_MATERIAL_COLORS.map((color) => {
  const material = FALLBACK_MATERIALS.find((m) => m.id === color.materialId) ?? FALLBACK_MATERIALS[0];
  return makeMaterialVariant(material, color);
});
