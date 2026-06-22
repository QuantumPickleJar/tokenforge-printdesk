import type { AdvancedPrintSettings } from "../types/printRequest";

// ─────────────────────────────────────────────
// Estimate Service — scaffold stub
// ─────────────────────────────────────────────
// Provides rough, clearly-labelled material cost estimates for the
// request form. These are NOT final prices. Final pricing is always
// set by the owner after review.

export interface RoughEstimateResult {
  /** Estimated material weight in grams (very rough). */
  estimatedWeightGrams: number;
  /** Estimated material cost in USD (very rough). */
  estimatedMaterialCost: number;
  /** Human-readable disclaimer. */
  disclaimer: string;
  /** True when this is mock/scaffold data, not a real slicer estimate. */
  isMock: boolean;
}

/**
 * Returns a rough material cost estimate for display on the request form.
 * This is a MOCK estimate in the scaffold — it does not use a real slicer.
 *
 * TODO (implementation pass):
 *   - Route requests through the TokenForge processing worker for real estimates.
 *   - Worker will use PrusaSlicer CLI or equivalent with the selected profile.
 *   - Replace this stub with a call to processingJobService.createJob().
 */
export async function estimateMaterialCost(
  _materialCostPerGram: number,
  _advancedSettings?: AdvancedPrintSettings
): Promise<RoughEstimateResult> {
  // Scaffold: return clearly fake estimate after brief delay.
  await new Promise((r) => setTimeout(r, 400));

  const mockWeightGrams = 28; // ~1 oz, typical small print
  const mockCost = parseFloat((_materialCostPerGram * mockWeightGrams).toFixed(2));

  return {
    estimatedWeightGrams: mockWeightGrams,
    estimatedMaterialCost: mockCost,
    disclaimer:
      "⚠️ This is a rough scaffold estimate only — not a real slicer result. " +
      "Final pricing is set by the owner after review.",
    isMock: true,
  };
}
