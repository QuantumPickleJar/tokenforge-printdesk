// ─────────────────────────────────────────────
// Processing Jobs
// ─────────────────────────────────────────────
//
// Future architecture:
//   - Supabase stores request/model metadata and processing job records.
//   - A private Raspberry Pi (TokenForge local worker) polls Supabase for
//     "pending" jobs and claims them by setting status → "claimed".
//   - The worker processes the STL (slicing, analysis, estimation) using
//     local tools (e.g. PrusaSlicer CLI, TokenForge toolchain).
//   - Results (estimated weight, print time, layer count) are written back
//     to Supabase by the worker.
//   - The frontend reads completed processing metadata and presents it to
//     the owner and, partially, the requester.
//
// DO NOT implement the Pi worker in this scaffold.

export type ProcessingJobStatus =
  | "pending"
  | "claimed"
  | "processing"
  | "completed"
  | "failed";

export interface ProcessingJob {
  id: string;
  requestId: string;
  status: ProcessingJobStatus;
  workerId?: string;         // ID of the Pi/worker that claimed the job
  claimedAt?: string;        // ISO 8601
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  errorMessage?: string;

  // Results (populated by worker on completion)
  estimatedWeightGrams?: number;
  estimatedPrintTimeMinutes?: number;
  estimatedLayerCount?: number;
  slicerVersion?: string;
  profileUsed?: string;
}
