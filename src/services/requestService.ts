import type { PrintRequest } from "../types/printRequest";
import type { RequestStatus } from "../types/printRequest";

// ─────────────────────────────────────────────
// Request Service — scaffold stub
// ─────────────────────────────────────────────
// TODO (implementation pass):
//   - Replace mock data with real Supabase queries.
//   - Validate all inputs server-side via Supabase Edge Functions or RLS.
//   - Sanitize free-text fields before storage.
//   - Rate-limit public submissions.

/** Submit a new print request (stub — does not persist). */
export async function submitRequest(
  _data: Omit<PrintRequest, "id" | "createdAt" | "updatedAt" | "status" | "paymentStatus">
): Promise<{ success: boolean; requestId: string }> {
  // TODO: POST to Supabase via supabase.from("requests").insert(...)
  // For scaffold, simulate a short delay and return a fake ID.
  await new Promise((r) => setTimeout(r, 600));
  return { success: true, requestId: `mock-${Date.now()}` };
}

/** Fetch all requests (owner-only). */
export async function fetchRequests(): Promise<PrintRequest[]> {
  // TODO: supabase.from("requests").select("*").order("created_at", { ascending: true })
  // Requires authenticated owner session.
  return [];
}

/** Update a request's status (owner-only). */
export async function updateRequestStatus(
  _requestId: string,
  _status: RequestStatus
): Promise<void> {
  // TODO: supabase.from("requests").update({ status: _status }).eq("id", _requestId)
  // Verify owner auth before calling.
}
