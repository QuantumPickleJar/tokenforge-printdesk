import { useEffect, useState, type ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";
import { isSupabaseConfigured } from "../../services/supabaseClient";
import { getCurrentOwnerMember } from "../../services/ownerService";

interface OwnerRouteProps {
  children: ReactNode;
}

export function OwnerRoute({ children }: OwnerRouteProps) {
  const [state, setState] = useState<"loading" | "allowed" | "blocked" | "not-configured">("loading");

  useEffect(() => {
    let active = true;
    async function verifyOwner() {
      if (!isSupabaseConfigured()) {
        if (active) setState("not-configured");
        return;
      }
      try {
        const owner = await getCurrentOwnerMember();
        if (active) setState(owner ? "allowed" : "blocked");
      } catch (error) {
        console.error(error);
        if (active) setState("blocked");
      }
    }
    verifyOwner();
    return () => {
      active = false;
    };
  }, []);

  if (state === "loading") {
    return <p className="text-muted">Checking owner access…</p>;
  }

  if (state === "not-configured") {
    return (
      <div className="container">
        <section className="section">
          <div className="alert alert-warning">
            <span>⚠️</span>
            <span>Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before using owner routes.</span>
          </div>
          <Link className="btn btn-secondary" to="/owner/login" style={{ marginTop: "1rem" }}>Owner login</Link>
        </section>
      </div>
    );
  }

  if (state === "blocked") {
    return <Navigate to="/owner/login" replace />;
  }

  return <>{children}</>;
}
