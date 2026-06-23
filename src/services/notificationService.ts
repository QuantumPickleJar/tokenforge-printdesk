import { requireSupabase } from "./supabaseClient";

export type NotificationType =
  | "owner_new_public_quote_request"
  | "owner_new_family_request"
  | "owner_quote_accepted"
  | "owner_quote_declined"
  | "owner_payment_marked_paid"
  | "requester_request_received"
  | "requester_family_request_received"
  | "requester_quote_sent"
  | "requester_needs_more_info"
  | "requester_request_declined"
  | "requester_job_ready"
  | "requester_job_completed";

export async function logNotification(type: NotificationType, options: { requestId?: string; quoteId?: string; recipientEmail?: string; recipientRole?: string; payload?: Record<string, unknown> }): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("notification_logs").insert({
    request_id: options.requestId ?? null,
    quote_id: options.quoteId ?? null,
    notification_type: type,
    recipient_email: options.recipientEmail ?? null,
    recipient_role: options.recipientRole ?? null,
    status: "queued",
    payload: options.payload ?? {},
  });
  if (error) throw error;
}

export async function invokeNotificationProcessor(): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.functions.invoke("send-notification-stub", { body: { dryRun: true } });
  if (error) throw error;
}
