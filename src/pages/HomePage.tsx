import { Link } from "react-router-dom";
import "./HomePage.css";

export function HomePage() {
  return (
    <div className="container">
      {/* Hero */}
      <section className="home-hero section">
        <div className="home-hero__badge badge badge-primary">v0.1 Scaffold</div>
        <h1 className="home-hero__title">
          TokenForge <span className="text-primary">PrintDesk</span>
        </h1>
        <p className="home-hero__subtitle">
          A request-and-quote system for 3D printing. Submit a request, get an
          owner-reviewed quote, and coordinate pickup or shipping — no automatic
          payment, no guesswork.
        </p>
        <div className="home-hero__actions">
          <Link to="/request" className="btn btn-primary">
            Request a Quote
          </Link>
          <Link to="/gallery" className="btn btn-secondary">
            View Gallery
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <h2 className="section-title">How it works</h2>
        <p className="section-subtitle">
          Simple, transparent, owner-reviewed at every step.
        </p>
        <div className="grid-3">
          <div className="card home-step-card">
            <div className="home-step-card__number">1</div>
            <h3>Submit a request</h3>
            <p>
              Fill out the form with your design details, material preference,
              and upload an STL file. Include as much context as you can.
            </p>
          </div>
          <div className="card home-step-card">
            <div className="home-step-card__number">2</div>
            <h3>Owner review</h3>
            <p>
              The owner reviews your request, checks printability, selects
              settings, and generates a quote with a material cost breakdown.
              <strong> Quotes are manual — nothing is automatic.</strong>
            </p>
          </div>
          <div className="card home-step-card">
            <div className="home-step-card__number">3</div>
            <h3>Approve &amp; coordinate</h3>
            <p>
              You receive a quote link. Accept it, arrange payment (via the
              provided link), and coordinate pickup or shipping with the owner.
            </p>
          </div>
        </div>
      </section>

      {/* What this is */}
      <section className="section">
        <h2 className="section-title">What TokenForge PrintDesk is for</h2>
        <div className="grid-2">
          <div className="card">
            <ul className="home-feature-list">
              <li>✅ 3D print quote requests</li>
              <li>✅ Owner-reviewed queue and status tracking</li>
              <li>✅ Material and color selection</li>
              <li>✅ Family / trusted requester workflow</li>
              <li>✅ STL file upload (coming in implementation pass)</li>
            </ul>
          </div>
          <div className="card">
            <ul className="home-feature-list">
              <li>✅ Public gallery of completed prints</li>
              <li>✅ Secure quote token delivery</li>
              <li>✅ Rough material cost estimate</li>
              <li>🔜 Raspberry Pi / TokenForge local processing</li>
              <li>🔜 Supabase-backed persistent storage</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="section">
        <div className="alert alert-info">
          <span aria-hidden="true">ℹ️</span>
          <div>
            <strong>Scaffold notice:</strong> This is v0.1 — a structural
            scaffold. Some features use mock data. Supabase integration,
            real STL upload, and production auth are deferred to the next
            implementation pass. See the README for details.
          </div>
        </div>
      </section>
    </div>
  );
}
