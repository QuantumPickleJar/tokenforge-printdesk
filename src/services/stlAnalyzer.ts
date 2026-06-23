import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

export const MAX_STL_SIZE_BYTES = 40 * 1024 * 1024;

export interface StlAnalysisResult {
  triangleCount?: number;
  boundingBoxMm?: { x: number; y: number; z: number };
  estimatedVolumeCm3?: number;
}

export function validateStlFile(file: File): { valid: boolean; error?: string } {
  if (!file.name.toLowerCase().endsWith(".stl")) {
    return { valid: false, error: "Only .stl files are accepted for v0.1." };
  }

  if (file.size <= 0) {
    return { valid: false, error: "The STL file is empty." };
  }

  if (file.size > MAX_STL_SIZE_BYTES) {
    return { valid: false, error: "STL file size must be 40 MB or less." };
  }

  return { valid: true };
}

export async function analyzeStlFile(file: File): Promise<StlAnalysisResult> {
  const validation = validateStlFile(file);
  if (!validation.valid) {
    throw new Error(validation.error ?? "Invalid STL file.");
  }

  const buffer = await file.arrayBuffer();
  const loader = new STLLoader();
  const geometry = loader.parse(buffer);
  geometry.computeBoundingBox();

  const box = geometry.boundingBox;
  const size = new THREE.Vector3();
  box?.getSize(size);

  const triangleCount = Math.floor((geometry.getAttribute("position")?.count ?? 0) / 3);
  const estimatedVolumeCm3 = estimateClosedMeshVolumeCm3(geometry);
  geometry.dispose();

  return {
    triangleCount,
    boundingBoxMm: box ? { x: size.x, y: size.y, z: size.z } : undefined,
    estimatedVolumeCm3,
  };
}

function estimateClosedMeshVolumeCm3(geometry: THREE.BufferGeometry): number | undefined {
  const position = geometry.getAttribute("position");
  if (!position || position.count < 3) return undefined;

  let signedVolumeMm3 = 0;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();

  for (let i = 0; i < position.count; i += 3) {
    a.fromBufferAttribute(position, i);
    b.fromBufferAttribute(position, i + 1);
    c.fromBufferAttribute(position, i + 2);
    signedVolumeMm3 += a.dot(b.cross(c)) / 6;
  }

  const cm3 = Math.abs(signedVolumeMm3) / 1000;
  return Number.isFinite(cm3) && cm3 > 0 ? Number(cm3.toFixed(3)) : undefined;
}
