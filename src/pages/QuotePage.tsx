import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { acceptQuote, declineQuote, fetchQuoteByToken } from "../services/quoteService";
import type { Quote } from "../types/quotes";
import "./QuotePage.css";

export function QuotePage() {
  const { token } = useParams<{ token: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [working, setWorking] = useState(false);
  const [acceptedNow, setAcceptedNow] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchQuoteByToken(token)
      .then((loadedQuote) => {
        if (!cancelled) setQuote(loadedQuote);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load quote.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function respond(response: "accepted" | "declined") {
    if (!quote || !token) return;
    setWorking(true);
    setError(null);
    try {
      if (response === "accepted") {
        await acceptQuote(quote.id, token);
        setAcceptedNow(true);
        setActionMsg("Quote accepted. Use the payment link below only if one was provided by the owner.");
      } else {
        await declineQuote(quote.id, token);
        setAcceptedNow(false);
        setActionMsg("Quote declined. The owner has been notified.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update quote response.");
    } finally {
      setWorking(false);
    }
  }

  if (!token) {
    return <QuoteShell><div className="alert alert-error"><span>⚠️</span><span>No quote token provided.</span></div></QuoteShell>;
  }

  if (loading) {
    return <QuoteShell><p className="text-muted">Loading quote…</p></QuoteShell>;
  }

  if (error) {
    return <QuoteShell><div className="alert alert-error"><span>⚠️</span><span>{error}</span></div></QuoteShell>;
  }

  if (!quote) {
    return (
      <QuoteShell>
        <div className="alert alert-error">
          <span>⚠️</span>
          <div><strong>Quote not found.</strong><br />This quote may have expired or the link may be incorrect.</div>
        </div>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: "1rem" }}>Back to home</Link>
      </QuoteShell>
    );
  }

  const expiresDate = quote.expiresAt ? new Date(quote.expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null;
  const alreadyResponded = Boolean(quote.acceptedAt || quote.declinedAt || actionMsg);
  const shouldShowPayment = Boolean(quote.paymentUrl && (quote.acceptedAt || acceptedNow));

  return (
    <QuoteShell>
      <div className="quote-header">
        <div>
          <h1 className="section-title" style={{ marginBottom: "0.25rem" }}>Your Quote</h1>
          {quote.requestTitle && <p className="text-muted text-sm">Request: {quote.requestTitle}</p>}
        </div>
        <span className="badge badge-warning">Manual payment flow</span>
      </div>

      <div className="card quote-card">
        <div className="card-header"><span className="card-title">Cost Breakdown</span><span className="text-sm text-muted">All prices in USD</span></div>
        <table className="quote-table"><tbody>
          <tr><td>Material cost</td><td className="quote-amount">${quote.materialCost.toFixed(2)}</td></tr>
          <tr><td>Labor</td><td className="quote-amount">${quote.laborCost.toFixed(2)}</td></tr>
          <tr><td>Shipping</td><td className="quote-amount">${quote.shippingCost.toFixed(2)}</td></tr>
          {quote.discount > 0 && <tr><td>Discount</td><td className="quote-amount text-success">-${quote.discount.toFixed(2)}</td></tr>}
          <tr className="quote-total-row"><td><strong>Total asking price</strong></td><td className="quote-amount"><strong>${quote.finalAskingPrice.toFixed(2)}</strong></td></tr>
        </tbody></table>
        {quote.quoteNotes && <div className="alert alert-info" style={{ marginTop: "1rem" }}><span>💬</span><span>{quote.quoteNotes}</span></div>}
        {expiresDate && <p className="text-xs text-muted" style={{ marginTop: "1rem" }}>Quote expires: {expiresDate}</p>}
      </div>

      {actionMsg && <div className="alert alert-success" style={{ marginTop: "1.5rem" }}><span>✅</span><span>{actionMsg}</span></div>}

      {!alreadyResponded && (
        <div className="quote-actions">
          <button className="btn btn-primary" disabled={working} onClick={() => respond("accepted")}>Accept Quote</button>
          <button className="btn btn-danger" disabled={working} onClick={() => respond("declined")}>Decline</button>
        </div>
      )}

      {shouldShowPayment && (
        <div className="alert alert-info" style={{ marginTop: "1.5rem" }}>
          <span>🔗</span>
          <div><strong>Payment link:</strong> <a href={quote.paymentUrl ?? "#"} target="_blank" rel="noreferrer">Open {quote.paymentProvider} payment page</a></div>
        </div>
      )}

      <div className="alert alert-warning" style={{ marginTop: "2rem" }}>
        <span>⚠️</span>
        <div><strong>Payment note:</strong> This site does not process payment automatically. Use only the manual link provided by the owner.</div>
      </div>
    </QuoteShell>
  );
}

function QuoteShell({ children }: { children: ReactNode }) {
  return <div className="container"><section className="section">{children}</section></div>;
}
