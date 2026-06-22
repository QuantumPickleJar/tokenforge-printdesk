// ─────────────────────────────────────────────
// STL Analyzer Service — scaffold stub
// ─────────────────────────────────────────────
// TODO (implementation pass):
//   - Use Three.js STLLoader to parse the STL file client-side for preview.
//   - Validate STL file size and type BEFORE parsing or uploading.
//   - For accurate slicer estimates, route the file through the
//     TokenForge local processing worker (see processingJobService.ts).
//   - Do NOT run expensive analysis synchronously on the main thread;
//     use a Web Worker for Three.js parsing.

/** Basic client-side STL validation (scaffold stub). */
export function validateStlFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

  if (!file.name.toLowerCase().endsWith(".stl") &&
      !file.name.toLowerCase().endsWith(".3mf")) {
    return { valid: false, error: "Only .stl and .3mf files are accepted." };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: "File size must be 50 MB or less." };
  }

  // TODO: Read first 80 bytes and validate STL ASCII/binary header.
  return { valid: true };
}

export interface StlAnalysisResult {
  triangleCount?: number;
  boundingBoxMm?: { x: number; y: number; z: number };
  estimatedVolumesCm3?: number;
}

/** Analyze an STL file client-side (scaffold stub — returns null). */
export async function analyzeStlFile(
  _file: File
): Promise<StlAnalysisResult | null> {
  // TODO: Use Three.js STLLoader inside a Web Worker.
  //   const loader = new STLLoader();
  //   const geometry = loader.parse(await _file.arrayBuffer());
  //   ... compute volume, bounding box, triangle count ...
  console.warn("[stlAnalyzer] analyzeStlFile is not implemented in scaffold.");
  return null;
}
