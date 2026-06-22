import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { signInOwnerWithOtp } from "../services/ownerService";
import { isSupabaseConfigured } from "../services/supabaseClient";
import "./OwnerLoginPage.css";

export function OwnerLoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const supabaseReady = isSupabaseConfigured();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      await signInOwnerWithOtp(email);
      setMessage(`Magic link requested for ${email}. Only active owner_members can access /owner after login.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Owner login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <section className="section owner-login-section">
        <h1 className="section-title">Owner Login</h1>
        <p className="section-subtitle text-muted">
          Sign in with Supabase Auth. Dashboard access is granted only when the signed-in user also has an active row in <code>owner_members</code>.
        </p>

        {!supabaseReady && (
          <div className="alert alert-warning" style={{ marginBottom: "1.5rem" }}>
            <span>⚠️</span>
            <span>Supabase is not configured. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env.local</code>.</span>
          </div>
        )}

        {message && (
          <div className="alert alert-success" style={{ marginBottom: "1.5rem" }}>
            <span>✅</span>
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1.5rem" }} role="alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form className="owner-login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="owner-email">Owner email</label>
            <input
              id="owner-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="owner@example.com"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={!supabaseReady || submitting}>
            {submitting ? "Sending…" : "Send magic link"}
          </button>
          <p className="text-xs text-muted" style={{ marginTop: "0.5rem" }}>
            No owner email is hardcoded in the frontend. Configure the allowed owner in Supabase Auth and <code>owner_members</code>.
          </p>
        </form>

        <div style={{ marginTop: "2rem" }}>
          <Link to="/" className="btn btn-ghost btn-sm">Back to home</Link>
        </div>
      </section>
    </div>
  );
}
