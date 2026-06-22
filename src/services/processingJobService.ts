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
  _requestId: string
): Promise<ProcessingJob | null> {
  // TODO: supabase.from("processing_jobs").insert({ request_id: _requestId, status: "pending" })
  console.warn("[processingJobService] createProcessingJob not implemented.");
  return null;
}

/** Fetch the latest processing job for a request (stub). */
export async function fetchProcessingJob(
  _requestId: string
): Promise<ProcessingJob | null> {
  // TODO: supabase.from("processing_jobs").select("*").eq("request_id", _requestId)
  //         .order("created_at", { ascending: false }).limit(1).single()
  return null;
}

/** Update job status (worker-side, stub). */
export async function updateJobStatus(
  _jobId: string,
  _status: ProcessingJobStatus
): Promise<void> {
  // TODO: supabase.from("processing_jobs").update({ status: _status }).eq("id", _jobId)
  // Worker must authenticate with a service-role key stored only on the Pi.
  // DO NOT use service-role key on the frontend.
  console.warn("[processingJobService] updateJobStatus not implemented.");
}
