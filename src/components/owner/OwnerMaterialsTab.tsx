import type { FormEvent } from "react";
import { setMaterialColorActive, upsertMaterial, upsertMaterialColor } from "../../services/materialService";
import type { Material, MaterialColor, MaterialType } from "../../types/materials";

const COMMON_MATERIAL_TYPES = ["PLA", "PLA+", "PETG", "TPU", "ABS", "ASA", "Wood PLA", "Silk PLA"];

export function OwnerMaterialsTab({ materials, colors, reload }: { materials: Material[]; colors: MaterialColor[]; reload: () => Promise<void> }) {
  const materialTypes = Array.from(new Set([...COMMON_MATERIAL_TYPES, ...materials.map((material) => material.materialType)])).filter(Boolean);

  async function createMaterial(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await upsertMaterial({
      name: String(form.get("name")),
      materialType: String(form.get("type")) as MaterialType,
      densityGcm3: Number(form.get("density")),
      costPerKg: Number(form.get("cost")),
      active: true,
      printNotes: String(form.get("notes") || ""),
    });
    e.currentTarget.reset();
    await reload();
  }

  async function createColor(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await upsertMaterialColor({
      materialId: String(form.get("materialId")),
      colorName: String(form.get("color")),
      brand: String(form.get("brand") || ""),
      hexColor: String(form.get("hex") || ""),
      active: true,
      printNotes: String(form.get("notes") || ""),
    });
    e.currentTarget.reset();
    await reload();
  }

  return (
    <div className="grid-2">
      <div className="card">
        <h2 className="card-title">Materials</h2>
        <form onSubmit={createMaterial} className="request-form">
          <input name="name" className="form-input" placeholder="Material name" required />
          <input name="type" className="form-input" placeholder="Material type, e.g. PLA, PETG, TPU" list="material-type-options" required />
          <datalist id="material-type-options">
            {materialTypes.map((type) => <option key={type} value={type} />)}
          </datalist>
          <input name="density" className="form-input" type="number" step="0.001" placeholder="Density g/cm³" required />
          <input name="cost" className="form-input" type="number" step="0.01" placeholder="Cost per kg" required />
          <input name="notes" className="form-input" placeholder="Print notes" />
          <button className="btn btn-primary">Add material</button>
        </form>
        <ul>{materials.map((m) => <li key={m.id} className="text-sm">{m.materialType} — {m.name} (${m.costPerKg}/kg, {m.densityGcm3} g/cm³)</li>)}</ul>
      </div>

      <div className="card">
        <h2 className="card-title">Colors / Variants</h2>
        <form onSubmit={createColor} className="request-form">
          <select name="materialId" className="form-select" required>{materials.map((m) => <option key={m.id} value={m.id}>{m.materialType} — {m.name}</option>)}</select>
          <input name="color" className="form-input" placeholder="Color name" required />
          <input name="brand" className="form-input" placeholder="Brand optional" />
          <input name="hex" className="form-input" placeholder="#hex optional" />
          <input name="notes" className="form-input" placeholder="Print notes" />
          <button className="btn btn-primary">Add color</button>
        </form>
        <ul>{colors.map((c) => <li key={c.id} className="text-sm">{c.colorName} {c.active ? "" : "(inactive)"} <button className="btn btn-ghost btn-sm" onClick={() => setMaterialColorActive(c.id, !c.active).then(reload)}>{c.active ? "Disable" : "Enable"}</button></li>)}</ul>
      </div>
    </div>
  );
}
