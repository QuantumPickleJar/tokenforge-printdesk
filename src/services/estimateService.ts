import type { MaterialVariant } from "../types/materials";
import type { AdvancedPrintSettings, RoughMaterialEstimate } from "../types/printRequest";
import type { StlAnalysisResult } from "./stlAnalyzer";

export interface RoughEstimateResult extends RoughMaterialEstimate {
  isApproximate: boolean;
}

export function estimateMaterialCost(
  material: MaterialVariant,
  analysis?: StlAnalysisResult,
  advancedSettings?: AdvancedPrintSettings
): RoughEstimateResult {
  const generatedAt = new Date().toISOString();
  const density = material.densityGcm3;
  const costPerKg = material.costPerKg;
  const volume = analysis?.estimatedVolumeCm3;
  const infill = Math.max(0, Math.min(100, advancedSettings?.infillPercent ?? 15));

  const grams = volume
    ? volume * density * approximateInfillMultiplier(infill)
    : 25;

  const cost = (grams / 1000) * costPerKg;

  return {
    estimatedVolumeCm3: volume,
    estimatedGrams: Number(grams.toFixed(1)),
    estimatedMaterialCost: Number(cost.toFixed(2)),
    selectedMaterialDensityGcm3: density,
    selectedMaterialCostPerKg: costPerKg,
    estimateVersion: "client-stl-volume-v0.1",
    generatedAt,
    isApproximate: true,
    disclaimer:
      "Rough material estimate only. Mesh volume and infill are approximated client-side; final pricing is set by the owner after review.",
  };
}

function approximateInfillMultiplier(infillPercent: number): number {
  // This approximates slicer behavior without pretending to replace one: shells/top/bottom still use material even at low infill.
  return 0.35 + (infillPercent / 100) * 0.65;
}
