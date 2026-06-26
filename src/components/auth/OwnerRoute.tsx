import { useEffect, useState, type ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";
import { isSupabaseConfigured } from "../../services/supabaseClient";
import { getCurrentOwnerMember } from "../../services/ownerService";
import {
  getLocalOwnerStatus,
  isLocalOwnerUnlockConfigured,
} from "../../services/localOwnerAuthService";

interface OwnerRouteProps {
  children: ReactNode;
}

type OwnerRouteState = "loading" | "allowed" | "blocked" | "not-configured";

async function isLocalOwnerUnlocked(): Promise<boolean> {
  if (!isLocalOwnerUnlockConfigured()) {
    return false;
  }

  try {
    const status = await getLocalOwnerStatus();
    return Boolean(status.enabled && status.unlocked);
  } catch (error) {
    console.warn("Local owner unlock status check failed.", error);
    return false;
  }
}

export function OwnerRoute({ children }: OwnerRouteProps) {
  const [state, setState] = useState<OwnerRouteState>("loading");

  useEffect(() => {
    let active = true;
    async function verifyOwner() {
      if (isSupabaseConfigured()) {
        try {
          const owner = await getCurrentOwnerMember();
          if (owner) {
            if (active) setState("allowed");
            return;
          }
        } catch (error) {
          console.error(error);
        }
      }

      const localUnlocked = await isLocalOwnerUnlocked();
      if (localUnlocked) {
        if (active) setState("allowed");
        return;
      }

      if (!isSupabaseConfigured() && !isLocalOwnerUnlockConfigured()) {
        if (active) setState("not-configured");
        return;
      }

      if (active) setState("blocked");
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
            <span>Supabase is not configured in this build. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before building or deploying.</span>
          </div>
          <Link className="btn btn-secondary" to="/login?next=/owner" style={{ marginTop: "1rem" }}>Sign in</Link>
        </section>
      </div>
    );
  }

  if (state === "blocked") {
    return <Navigate to="/login?next=/owner" replace />;
  }

  return <>{children}</>;
}
