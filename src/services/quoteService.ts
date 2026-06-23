import { requireSupabase } from "./supabaseClient";
import type { Quote, QuoteInput } from "../types/quotes";

interface QuoteRow {
  id: string;
  request_id: string;
  material_cost: number;
  labor_cost: number;
  shipping_cost: number;
  discount: number;
  final_asking_price: number;
  quote_notes: string | null;
  payment_provider: Quote["paymentProvider"];
  payment_url: string | null;
  quote_token: string;
  expires_at: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapQuote(row: QuoteRow): Quote {
  return {
    id: row.id,
    requestId: row.request_id,
    token: row.quote_token,
    materialCost: Number(row.material_cost),
    laborCost: Number(row.labor_cost),
    shippingCost: Number(row.shipping_cost),
    discount: Number(row.discount),
    finalAskingPrice: Number(row.final_asking_price),
    quoteNotes: row.quote_notes,
    paymentStatus: "pending",
    paymentProvider: row.payment_provider,
    paymentUrl: row.payment_url,
    expiresAt: row.expires_at,
    sentAt: row.sent_at,
    viewedAt: row.viewed_at,
    acceptedAt: row.accepted_at,
    declinedAt: row.declined_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchQuoteByToken(token: string): Promise<Quote | null> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("get_public_quote_by_token", { p_quote_token: token });
  if (error) throw error;
  return data ? (data as Quote) : null;
}

export async function acceptQuote(_quoteId: string, token: string): Promise<void> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("respond_to_quote", { p_quote_token: token, p_response: "accepted" });
  if (error) throw error;
  if (data !== true) throw new Error("Quote could not be accepted. It may be expired or invalid.");
}

export async function declineQuote(_quoteId: string, token: string): Promise<void> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("respond_to_quote", { p_quote_token: token, p_response: "declined" });
  if (error) throw error;
  if (data !== true) throw new Error("Quote could not be declined. It may be expired or invalid.");
}

export async function fetchQuotes(): Promise<Quote[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("quotes").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as QuoteRow[]).map(mapQuote);
}

export async function createOrUpdateQuote(input: QuoteInput, id?: string): Promise<Quote> {
  const client = requireSupabase();
  const payload = {
    request_id: input.requestId,
    material_cost: input.materialCost,
    labor_cost: input.laborCost,
    shipping_cost: input.shippingCost,
    discount: input.discount,
    final_asking_price: input.finalAskingPrice,
    quote_notes: input.quoteNotes || null,
    payment_provider: input.paymentProvider,
    payment_url: input.paymentUrl || null,
    expires_at: input.expiresAt || null,
  };
  const query = id
    ? client.from("quotes").update(payload).eq("id", id).select("*").single()
    : client.from("quotes").insert(payload).select("*").single();
  const { data, error } = await query;
  if (error) throw error;
  return mapQuote(data as QuoteRow);
}

export async function sendQuote(quoteId: string): Promise<void> {
  const client = requireSupabase();
  const { data: quote, error: quoteError } = await client
    .from("quotes")
    .update({ sent_at: new Date().toISOString() })
    .eq("id", quoteId)
    .select("request_id")
    .single();
  if (quoteError) throw quoteError;

  const { error: requestError } = await client
    .from("print_requests")
    .update({ status: "quoted" })
    .eq("id", quote.request_id);
  if (requestError) throw requestError;
}

export async function markPaymentPaid(requestId: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client
    .from("print_requests")
    .update({ payment_status: "paid", status: "paid" })
    .eq("id", requestId);
  if (error) throw error;
}
