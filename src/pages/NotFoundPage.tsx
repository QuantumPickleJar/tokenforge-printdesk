import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="container">
      <section className="section" style={{ textAlign: "center", maxWidth: "480px", margin: "0 auto" }}>
        <p style={{ fontSize: "4rem", lineHeight: 1, marginBottom: "1rem" }} aria-hidden="true">⬡</p>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Page not found</h1>
        <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
          The page you were looking for doesn&apos;t exist or may have moved.
        </p>
        <Link to="/" className="btn btn-primary">Back to home</Link>
      </section>
    </div>
  );
}
