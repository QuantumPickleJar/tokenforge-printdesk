import { MOCK_MATERIALS, type Material } from "../types/materials";

// ─────────────────────────────────────────────
// Material Service — scaffold stub
// ─────────────────────────────────────────────
// TODO (implementation pass):
//   - Replace MOCK_MATERIALS with supabase.from("materials").select("*")
//   - Owner CRUD for materials via authenticated Supabase calls.

/** Fetch all available materials. Returns mock data in scaffold. */
export async function fetchMaterials(): Promise<Material[]> {
  // TODO: return (await supabase!.from("materials").select("*")).data ?? [];
  return MOCK_MATERIALS;
}

/** Fetch a single material by ID. */
export async function fetchMaterialById(id: string): Promise<Material | undefined> {
  const materials = await fetchMaterials();
  return materials.find((m) => m.id === id);
}
