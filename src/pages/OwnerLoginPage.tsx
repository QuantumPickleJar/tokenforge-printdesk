import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { signInWithMagicLink } from "../services/authService";
import {
  isLocalOwnerUnlockConfigured,
  unlockLocalOwner,
  type LocalOwnerStatus,
} from "../services/localOwnerAuthService";
import { isSupabaseConfigured } from "../services/supabaseClient";
import "./OwnerLoginPage.css";

function getSafeNextPath(value: string | null): string {
  return value && value.startsWith("/") ? value : "/owner";
}

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [localOwnerPassword, setLocalOwnerPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localOwnerMessage, setLocalOwnerMessage] = useState<string | null>(null);
  const [localOwnerError, setLocalOwnerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [localOwnerSubmitting, setLocalOwnerSubmitting] = useState(false);
  const supabaseReady = isSupabaseConfigured();
  const localOwnerReady = isLocalOwnerUnlockConfigured();
  const nextPath = getSafeNextPath(searchParams.get("next"));

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

  async function handleLocalOwnerUnlock(e: FormEvent) {
    e.preventDefault();
    setLocalOwnerSubmitting(true);
    setLocalOwnerError(null);
    setLocalOwnerMessage(null);
    try {
      const status: LocalOwnerStatus = await unlockLocalOwner(localOwnerPassword);
      if (!status.unlocked) {
        throw new Error("The Pi accepted the request but did not unlock owner access.");
      }
      setLocalOwnerPassword("");
      setLocalOwnerMessage(status.expiresAt
        ? `Local owner access unlocked until ${new Date(status.expiresAt).toLocaleString()}.`
        : "Local owner access unlocked.");
      navigate(nextPath, { replace: true });
    } catch (err) {
      setLocalOwnerError(err instanceof Error ? err.message : "Local owner unlock failed.");
    } finally {
      setLocalOwnerSubmitting(false);
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

        {localOwnerReady && (
          <div className="card" style={{ marginTop: "1.5rem" }}>
            <h2 className="section-title" style={{ fontSize: "1.25rem" }}>Local owner unlock</h2>
            <p className="text-sm text-muted">
              Use this only on a trusted LAN or Tailnet to avoid Supabase magic-link throttling during development and demo testing.
            </p>
            {localOwnerMessage && (
              <div className="alert alert-success" style={{ marginBottom: "1rem" }}>
                <span>✅</span>
                <span>{localOwnerMessage}</span>
              </div>
            )}
            {localOwnerError && (
              <div className="alert alert-error" style={{ marginBottom: "1rem" }} role="alert">
                <span>⚠️</span>
                <span>{localOwnerError}</span>
              </div>
            )}
            <form className="owner-login-form" onSubmit={handleLocalOwnerUnlock}>
              <div className="form-group">
                <label className="form-label" htmlFor="local-owner-password">Local owner password</label>
                <input
                  id="local-owner-password"
                  type="password"
                  className="form-input"
                  value={localOwnerPassword}
                  onChange={(e) => setLocalOwnerPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Local Tailnet unlock password"
                />
              </div>
              <button type="submit" className="btn btn-secondary" disabled={localOwnerSubmitting}>
                {localOwnerSubmitting ? "Unlocking…" : "Unlock local owner access"}
              </button>
            </form>
          </div>
        )}

        <div style={{ marginTop: "2rem" }}>
          <Link to="/" className="btn btn-ghost btn-sm">Back to home</Link>
        </div>
      </section>
    </div>
  );
}
