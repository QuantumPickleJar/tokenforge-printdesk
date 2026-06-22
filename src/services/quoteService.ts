import { MOCK_QUOTE, type Quote } from "../types/quotes";

// ─────────────────────────────────────────────
// Quote Service — scaffold stub
// ─────────────────────────────────────────────
// TODO (implementation pass):
//   - Validate quote token via secure Supabase query (server-side or Edge Function).
//   - Do NOT expose all quotes to anonymous users — use token-based lookup only.
//   - Expiry must be enforced server-side, not just client-side.

/** Fetch a quote by its secure token. Returns mock quote in scaffold. */
export async function fetchQuoteByToken(_token: string): Promise<Quote | null> {
  // TODO: supabase.from("quotes").select("*").eq("token", _token).single()
  // Validate token server-side; do not trust client-supplied token without checks.
  if (_token === "MOCK-TOKEN-PREVIEW" || import.meta.env.DEV) {
    return { ...MOCK_QUOTE, token: _token };
  }
  return null;
}

/** Mark a quote as accepted by the requester. */
export async function acceptQuote(_quoteId: string, _token: string): Promise<void> {
  // TODO: supabase.from("quotes").update({ accepted_at: new Date().toISOString() })
  //         .eq("id", _quoteId).eq("token", _token)
}

/** Mark a quote as declined by the requester. */
export async function declineQuote(_quoteId: string, _token: string): Promise<void> {
  // TODO: supabase.from("quotes").update({ declined_at: new Date().toISOString() })
  //         .eq("id", _quoteId).eq("token", _token)
}
