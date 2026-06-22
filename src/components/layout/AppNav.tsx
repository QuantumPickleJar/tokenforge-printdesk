import { NavLink, Link } from "react-router-dom";
import "./AppNav.css";

export function AppNav() {
  return (
    <header className="app-nav" role="banner">
      <div className="container app-nav__inner">
        <Link to="/" className="app-nav__brand" aria-label="TokenForge PrintDesk home">
          <span className="app-nav__logo-mark" aria-hidden="true">⬡</span>
          <span className="app-nav__brand-name">TokenForge <span className="app-nav__brand-sub">PrintDesk</span></span>
        </Link>

        <nav aria-label="Main navigation">
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
                Request a Quote
              </NavLink>
            </li>
            <li>
              <NavLink to="/owner/login" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Owner Login
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
