import { useState } from "react";
import { Link } from "react-router-dom";
import { isSupabaseConfigured } from "../services/supabaseClient";
import "./OwnerLoginPage.css";

// TODO (implementation pass):
//   - Implement Supabase email magic-link or email+password auth.
//   - Verify that only the owner account (specific email) can access /owner routes.
//   - Add session management and redirect to /owner on success.
//   - Rate-limit login attempts server-side.
//   - Do NOT expose owner dashboard to unauthenticated users.

export function OwnerLoginPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const supabaseReady = isSupabaseConfigured();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: supabase!.auth.signInWithOtp({ email })
    // For scaffold, just show mock confirmation.
    setSubmitted(true);
  }

  return (
    <div className="container">
      <section className="section owner-login-section">
        <div className="scaffold-banner">
          🏗️ Owner authentication is not implemented in this scaffold.
          Supabase Auth (magic link or email+password) will be wired up in
          the implementation pass.
        </div>

        <h1 className="section-title">Owner Login</h1>
        <p className="section-subtitle text-muted">
          Access the owner dashboard to manage requests, materials, quotes,
          and gallery entries.
        </p>

        {!supabaseReady && (
          <div className="alert alert-warning" style={{ marginBottom: "1.5rem" }}>
            <span>⚠️</span>
            <span>
              Supabase is not configured. Set{" "}
              <code>VITE_SUPABASE_URL</code> and{" "}
              <code>VITE_SUPABASE_ANON_KEY</code> in your{" "}
              <code>.env</code> file.
            </span>
          </div>
        )}

        {submitted ? (
          <div className="alert alert-success" style={{ marginBottom: "1.5rem" }}>
            <span>✅</span>
            <div>
              <strong>Mock login triggered</strong> — in the real app, a magic
              link would be sent to <strong>{email}</strong>.
            </div>
          </div>
        ) : (
          <form className="owner-login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="owner-email">
                Owner email
              </label>
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
            <button type="submit" className="btn btn-primary">
              Send magic link
            </button>
            <p className="text-xs text-muted" style={{ marginTop: "0.5rem" }}>
              A secure sign-in link will be sent to your email (scaffold: mocked).
            </p>
          </form>
        )}

        <div style={{ marginTop: "2rem" }}>
          <Link to="/owner" className="btn btn-ghost btn-sm">
            → Skip to dashboard (scaffold dev shortcut)
          </Link>
        </div>
      </section>
    </div>
  );
}
