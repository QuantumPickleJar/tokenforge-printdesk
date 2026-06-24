import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { signInWithMagicLink } from "../services/authService";
import { isSupabaseConfigured } from "../services/supabaseClient";
import "./OwnerLoginPage.css";

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const supabaseReady = isSupabaseConfigured();
  const nextPath = searchParams.get("next") || "/owner";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      await signInWithMagicLink(email, nextPath);
      setMessage(`Magic link requested for ${email}. After sign-in, owner-only areas unlock when your Supabase Auth email matches an active owner_members row.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <section className="section owner-login-section">
        <h1 className="section-title">Sign in</h1>
        <p className="section-subtitle text-muted">
          Use one magic-link login for requesters and owners. Owner access is granted only when the signed-in Supabase user email matches an active row in <code>owner_members</code>.
        </p>

        {!supabaseReady && (
          <div className="alert alert-warning" style={{ marginBottom: "1.5rem" }}>
            <span>⚠️</span>
            <span>Supabase is not configured in this build. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> before building or deploying.</span>
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
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={!supabaseReady || submitting}>
            {submitting ? "Sending…" : "Send magic link"}
          </button>
          <p className="text-xs text-muted" style={{ marginTop: "0.5rem" }}>
            Signing in does not automatically make every user an owner. Owner tools check <code>owner_members</code> after the magic link succeeds.
          </p>
        </form>

        <div style={{ marginTop: "2rem" }}>
          <Link to="/" className="btn btn-ghost btn-sm">Back to home</Link>
        </div>
      </section>
    </div>
  );
}
