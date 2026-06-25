import { useEffect } from "react";
import { HashRouter, useNavigate } from "react-router-dom";
import { AppRoutes } from "./routes";
import { supabase } from "../services/supabaseClient";

function MagicLinkRedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) return;

    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    const hasAuthCallback = params.has("code") || params.has("error") || params.has("error_description");
    if (!next && !hasAuthCallback) return;

    let cancelled = false;
    const destination = next && next.startsWith("/") ? next : "/";

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) {
        window.history.replaceState({}, document.title, `${import.meta.env.BASE_URL}#${destination}`);
        navigate(destination, { replace: true });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return null;
}

export function App() {
  return (
    <HashRouter>
      <MagicLinkRedirectHandler />
      <AppRoutes />
    </HashRouter>
  );
}
