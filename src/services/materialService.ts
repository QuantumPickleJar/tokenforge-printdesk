import { requireSupabase, supabase } from "./supabaseClient";
import {
  FALLBACK_MATERIAL_VARIANTS,
  makeMaterialVariant,
  type Material,
  type MaterialColor,
  type MaterialColorFormInput,
  type MaterialFormInput,
  type MaterialVariant,
  type MaterialType,
} from "../types/materials";

type MaterialRow = {
  id: string;
  name: string;
  material_type: MaterialType;
  density_g_cm3: number;
  cost_per_kg: number;
  active: boolean;
  print_notes: string | null;
  sort_order: number;
};

type ColorRow = {
  id: string;
  material_id: string;
  color_name: string;
  brand: string | null;
  hex_color: string | null;
  active: boolean;
  print_notes: string | null;
  sort_order: number;
  materials?: MaterialRow;
};

function mapMaterial(row: MaterialRow): Material {
  return {
    id: row.id,
    name: row.name,
    materialType: row.material_type,
    densityGcm3: Number(row.density_g_cm3),
    costPerKg: Number(row.cost_per_kg),
    active: row.active,
    printNotes: row.print_notes,
    sortOrder: row.sort_order,
  };
}

function mapColor(row: ColorRow): MaterialColor {
  return {
    id: row.id,
    materialId: row.material_id,
    colorName: row.color_name,
    brand: row.brand,
    hexColor: row.hex_color,
    active: row.active,
    printNotes: row.print_notes,
    sortOrder: row.sort_order,
  };
}

export async function fetchMaterialVariants(): Promise<MaterialVariant[]> {
  if (!supabase) return FALLBACK_MATERIAL_VARIANTS;

  const { data, error } = await supabase
    .from("material_colors")
    .select("id, material_id, color_name, brand, hex_color, active, print_notes, sort_order, materials!inner(id, name, material_type, density_g_cm3, cost_per_kg, active, print_notes, sort_order)")
    .eq("active", true)
    .eq("materials.active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as unknown as ColorRow[]).map((row) => {
    const material = mapMaterial(row.materials as MaterialRow);
    return makeMaterialVariant(material, mapColor(row));
  });
}

export async function fetchMaterials(): Promise<Material[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("materials").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as MaterialRow[]).map(mapMaterial);
}

export async function fetchMaterialColors(): Promise<MaterialColor[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("material_colors").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as ColorRow[]).map(mapColor);
}

export async function upsertMaterial(input: MaterialFormInput, id?: string): Promise<void> {
  const client = requireSupabase();
  const payload = {
    name: input.name.trim(),
    material_type: input.materialType,
    density_g_cm3: input.densityGcm3,
    cost_per_kg: input.costPerKg,
    active: input.active,
    print_notes: input.printNotes ?? null,
    sort_order: input.sortOrder ?? 0,
  };
  const query = id ? client.from("materials").update(payload).eq("id", id) : client.from("materials").insert(payload);
  const { error } = await query;
  if (error) throw error;
}

export async function upsertMaterialColor(input: MaterialColorFormInput, id?: string): Promise<void> {
  const client = requireSupabase();
  const payload = {
    material_id: input.materialId,
    color_name: input.colorName.trim(),
    brand: input.brand || null,
    hex_color: input.hexColor || null,
    active: input.active,
    print_notes: input.printNotes ?? null,
    sort_order: input.sortOrder ?? 0,
  };
  const query = id ? client.from("material_colors").update(payload).eq("id", id) : client.from("material_colors").insert(payload);
  const { error } = await query;
  if (error) throw error;
}

export async function setMaterialColorActive(id: string, active: boolean): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("material_colors").update({ active }).eq("id", id);
  if (error) throw error;
}
