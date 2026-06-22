import "./AppFooter.css";

export function AppFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer" role="contentinfo">
      <div className="container app-footer__inner">
        <p className="app-footer__copy">
          © {year} TokenForge PrintDesk &mdash; request-and-quote system for 3D printing.
        </p>
        <p className="app-footer__note">
          Quotes are owner-reviewed. Payment is not automatic.
        </p>
      </div>
    </footer>
  );
}
