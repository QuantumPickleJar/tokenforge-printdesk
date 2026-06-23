import type { ProcessingJob, ProcessingJobStatus } from "../types/processing";

// ─────────────────────────────────────────────
// Processing Job Service — scaffold stub
// ─────────────────────────────────────────────
//
// Future architecture:
//   - Owner submits a request with an STL file.
//   - Frontend (or Edge Function) creates a ProcessingJob record in Supabase.
//   - A private Raspberry Pi worker polls Supabase for "pending" jobs.
//   - Worker claims a job (status → "claimed"), processes with local slicer tools.
//   - Worker writes results (weight, print time, etc.) back to Supabase.
//   - Frontend reads completed job metadata.
//
// DO NOT implement the Pi worker here.
// DO NOT expose processing job internals to unauthenticated users.

/** Create a processing job for a submitted request (stub). */
export async function createProcessingJob(
  requestId: string
): Promise<ProcessingJob | null> {
  // TODO: supabase.from("processing_jobs").insert({ request_id: requestId, status: "pending" })
  console.warn("[processingJobService] createProcessingJob not implemented.", { requestId });
  return null;
}

/** Fetch the latest processing job for a request (stub). */
export async function fetchProcessingJob(
  requestId: string
): Promise<ProcessingJob | null> {
  // TODO: supabase.from("processing_jobs").select("*").eq("request_id", requestId)
  //         .order("created_at", { ascending: false }).limit(1).single()
  console.warn("[processingJobService] fetchProcessingJob not implemented.", { requestId });
  return null;
}

/** Update job status (worker-side, stub). */
export async function updateJobStatus(
  jobId: string,
  status: ProcessingJobStatus
): Promise<void> {
  // TODO: supabase.from("processing_jobs").update({ status }).eq("id", jobId)
  // Worker must authenticate with a service-role key stored only on the Pi.
  // DO NOT use service-role key on the frontend.
  console.warn("[processingJobService] updateJobStatus not implemented.", { jobId, status });
}
