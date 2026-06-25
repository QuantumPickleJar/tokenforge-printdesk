import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import "./AppNav.css";

export function AppNav() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.session));
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="app-nav" role="banner">
      <div className="container app-nav__inner">
        <Link to="/" className="app-nav__brand" aria-label="TokenForge PrintDesk home">
          <span className="app-nav__logo-mark" aria-hidden="true">⬡</span>
          <span className="app-nav__brand-name">TokenForge <span className="app-nav__brand-sub">PrintDesk</span></span>
        </Link>

        <nav className="app-nav__nav" aria-label="Main navigation">
          <ul className="app-nav__links" role="list">
            <li>
              <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/gallery" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Gallery
              </NavLink>
            </li>
            <li>
              <NavLink to="/request" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Request
              </NavLink>
            </li>
            {signedIn ? (
              <>
                <li>
                  <NavLink to="/owner/materials" className={({ isActive }) => isActive ? "nav-link nav-link-owner active" : "nav-link nav-link-owner"}>
                    Materials
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/owner" className={({ isActive }) => isActive ? "nav-link nav-link-owner active" : "nav-link nav-link-owner"}>
                    Owner
                  </NavLink>
                </li>
              </>
            ) : (
              <li>
                <NavLink to="/login?next=/owner" className={({ isActive }) => isActive ? "nav-link nav-link-owner active" : "nav-link nav-link-owner"}>
                  Sign in
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
