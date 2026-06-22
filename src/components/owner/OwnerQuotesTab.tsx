import type { FormEvent } from "react";
import { createOrUpdateQuote, markPaymentPaid, sendQuote } from "../../services/quoteService";
import type { PrintRequest } from "../../types/printRequest";

export function OwnerQuotesTab({ requests, reload }: { requests: PrintRequest[]; reload: () => Promise<void> }) {
  async function createQuote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const quote = await createOrUpdateQuote({
      requestId: String(form.get("requestId")),
      materialCost: Number(form.get("material")),
      laborCost: Number(form.get("labor")),
      shippingCost: Number(form.get("shipping")),
      discount: Number(form.get("discount")),
      finalAskingPrice: Number(form.get("final")),
      quoteNotes: String(form.get("notes") || ""),
      paymentProvider: "manual",
      paymentUrl: String(form.get("url") || ""),
    });
    await sendQuote(quote.id);
    e.currentTarget.reset();
    await reload();
  }

  return (
    <div className="card">
      <h2 className="card-title">Create/send manual-link quote</h2>
      <p className="text-sm text-muted">Payment is manual-link-only in v0.1. No Stripe or PayPal API automation is implemented here.</p>
      <form onSubmit={createQuote} className="request-form">
        <select name="requestId" className="form-select" required>{requests.map((r) => <option key={r.id} value={r.id}>{r.title} — {r.requesterName}</option>)}</select>
        <input name="material" className="form-input" type="number" step="0.01" placeholder="Material cost" required />
        <input name="labor" className="form-input" type="number" step="0.01" placeholder="Labor cost" required />
        <input name="shipping" className="form-input" type="number" step="0.01" placeholder="Shipping cost" defaultValue="0" />
        <input name="discount" className="form-input" type="number" step="0.01" placeholder="Discount" defaultValue="0" />
        <input name="final" className="form-input" type="number" step="0.01" placeholder="Final asking price" required />
        <input name="url" className="form-input" type="url" placeholder="Manual payment URL" />
        <textarea name="notes" className="form-textarea" placeholder="Quote notes" />
        <button className="btn btn-primary">Send quote</button>
      </form>
      <h3 style={{ marginTop: "1rem" }}>Pending manual payment</h3>
      {requests.filter((r) => r.paymentStatus === "pending").map((r) => (
        <p key={r.id}>{r.title} <button className="btn btn-secondary btn-sm" onClick={() => markPaymentPaid(r.id).then(reload)}>Mark paid</button></p>
      ))}
    </div>
  );
}
