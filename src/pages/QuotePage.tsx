import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchQuoteByToken } from "../services/quoteService";
import type { Quote } from "../types/quotes";
import "./QuotePage.css";

export function QuotePage() {
  const { token } = useParams<{ token: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchQuoteByToken(token).then((q) => {
      setQuote(q);
      setLoading(false);
    });
  }, [token]);

  if (!token) {
    return (
      <div className="container">
        <section className="section">
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>No quote token provided.</span>
          </div>
          <Link to="/" className="btn btn-secondary" style={{ marginTop: "1rem" }}>Back to home</Link>
        </section>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <section className="section">
          <p className="text-muted">Loading quote…</p>
        </section>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="container">
        <section className="section">
          <div className="alert alert-error">
            <span>⚠️</span>
            <div>
              <strong>Quote not found.</strong>
              <br />
              The token <code>{token}</code> did not match any quote.
              It may have expired or the link may be incorrect.
            </div>
          </div>
          <Link to="/" className="btn btn-secondary" style={{ marginTop: "1rem" }}>Back to home</Link>
        </section>
      </div>
    );
  }

  const expiresDate = quote.expiresAt
    ? new Date(quote.expiresAt).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : null;

  return (
    <div className="container">
      <section className="section">
        <div className="scaffold-banner">
          🏗️ This is a mock quote displayed for scaffold demonstration only.
          In the real app, quote tokens are validated server-side via Supabase.
        </div>

        <div className="quote-header">
          <div>
            <h1 className="section-title" style={{ marginBottom: "0.25rem" }}>Your Quote</h1>
            <p className="text-muted text-sm">
              Token: <code className="font-mono">{quote.token}</code>
            </p>
          </div>
          <span className="badge badge-warning">Pending acceptance</span>
        </div>

        {/* Quote card */}
        <div className="card quote-card">
          <div className="card-header">
            <span className="card-title">Cost Breakdown</span>
            <span className="text-sm text-muted">All prices in USD</span>
          </div>

          <table className="quote-table">
            <tbody>
              <tr>
                <td>Material cost</td>
                <td className="quote-amount">${quote.materialCost.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Labor</td>
                <td className="quote-amount">${quote.laborCost.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Shipping</td>
                <td className="quote-amount">${quote.shippingCost.toFixed(2)}</td>
              </tr>
              {quote.discount > 0 && (
                <tr>
                  <td>Discount</td>
                  <td className="quote-amount text-success">-${quote.discount.toFixed(2)}</td>
                </tr>
              )}
              <tr className="quote-total-row">
                <td><strong>Total asking price</strong></td>
                <td className="quote-amount"><strong>${quote.finalAskingPrice.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>

          {quote.quoteNotes && (
            <div className="alert alert-info" style={{ marginTop: "1rem" }}>
              <span>💬</span>
              <span>{quote.quoteNotes}</span>
            </div>
          )}

          {expiresDate && (
            <p className="text-xs text-muted" style={{ marginTop: "1rem" }}>
              Quote expires: {expiresDate}
            </p>
          )}
        </div>

        {/* Actions */}
        {actionMsg ? (
          <div className="alert alert-success" style={{ marginTop: "1.5rem" }}>
            <span>✅</span>
            <span>{actionMsg}</span>
          </div>
        ) : (
          <div className="quote-actions">
            <button
              className="btn btn-primary"
              onClick={() => setActionMsg("Quote accepted (scaffold mock — not persisted).")}
            >
              Accept Quote
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setActionMsg("Quote declined (scaffold mock — not persisted).")}
            >
              Decline
            </button>
          </div>
        )}

        <div className="alert alert-warning" style={{ marginTop: "2rem" }}>
          <span>⚠️</span>
          <div>
            <strong>Payment note:</strong> If you accept, the owner will provide
            a payment link. <strong>Do not send payment</strong> until you receive
            an official link from the owner directly. This site does not process
            payments automatically.
          </div>
        </div>
      </section>
    </div>
  );
}
