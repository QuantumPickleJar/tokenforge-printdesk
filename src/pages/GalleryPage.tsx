import { useEffect, useState } from "react";
import { fetchPublishedGallery } from "../services/galleryService";
import type { GalleryEntry } from "../types/gallery";
import "./GalleryPage.css";

export function GalleryPage() {
  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublishedGallery()
      .then(setEntries)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load gallery."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <section className="section">
        <h1 className="section-title">Gallery</h1>
        <p className="section-subtitle">
          Published completed prints from TokenForge PrintDesk. Drafts and unpublished work stay owner-only.
        </p>

        {loading ? (
          <p className="text-muted">Loading gallery…</p>
        ) : error ? (
          <div className="alert alert-error"><span>⚠️</span><span>{error}</span></div>
        ) : entries.length === 0 ? (
          <div className="alert alert-info"><span>ℹ️</span><span>No published gallery entries yet.</span></div>
        ) : (
          <div className="gallery-grid">
            {entries.map((entry) => <GalleryCard key={entry.id} entry={entry} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function GalleryCard({ entry }: { entry: GalleryEntry }) {
  const printDate = new Date(entry.printedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article className="card gallery-card">
      {entry.imageUrl ? (
        <img src={entry.imageUrl} alt={entry.title} className="gallery-card__image" loading="lazy" />
      ) : (
        <div className="gallery-card__image-placeholder" aria-hidden="true"><span>⬡</span></div>
      )}
      <div className="gallery-card__body">
        <h2 className="gallery-card__title">{entry.title}</h2>
        {entry.description && <p className="gallery-card__desc text-muted">{entry.description}</p>}
        <div className="gallery-card__meta">
          <span className="badge badge-primary">{entry.material}</span>
          <span className="badge badge-muted">{entry.color}</span>
          {entry.featured && <span className="badge badge-success">Featured</span>}
        </div>
        {entry.tags.length > 0 && (
          <div className="gallery-card__tags">
            {entry.tags.map((tag) => <span key={tag} className="gallery-tag">#{tag}</span>)}
          </div>
        )}
        <p className="gallery-card__date text-xs text-subtle">Published {printDate}</p>
      </div>
    </article>
  );
}
