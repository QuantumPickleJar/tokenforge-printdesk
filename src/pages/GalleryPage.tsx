import { useEffect, useState } from "react";
import { fetchPublishedGallery } from "../services/galleryService";
import type { GalleryEntry } from "../types/gallery";
import "./GalleryPage.css";

export function GalleryPage() {
  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedGallery().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container">
      <section className="section">
        <div className="scaffold-banner">
          🏗️ Gallery is using mock data in this scaffold. Real entries will be
          loaded from Supabase in the implementation pass.
        </div>
        <h1 className="section-title">Gallery</h1>
        <p className="section-subtitle">
          Completed prints from TokenForge PrintDesk. All prints were reviewed,
          quoted, and produced by the owner.
        </p>

        {loading ? (
          <p className="text-muted">Loading gallery…</p>
        ) : entries.length === 0 ? (
          <div className="alert alert-info">
            <span>ℹ️</span>
            <span>No published gallery entries yet.</span>
          </div>
        ) : (
          <div className="gallery-grid">
            {entries.map((entry) => (
              <GalleryCard key={entry.id} entry={entry} />
            ))}
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
        <img
          src={entry.imageUrl}
          alt={entry.title}
          className="gallery-card__image"
          loading="lazy"
        />
      ) : (
        <div className="gallery-card__image-placeholder" aria-hidden="true">
          <span>⬡</span>
        </div>
      )}
      <div className="gallery-card__body">
        <h2 className="gallery-card__title">{entry.title}</h2>
        {entry.description && (
          <p className="gallery-card__desc text-muted">{entry.description}</p>
        )}
        <div className="gallery-card__meta">
          <span className="badge badge-primary">{entry.material}</span>
          <span className="badge badge-muted">{entry.color}</span>
        </div>
        {entry.tags && entry.tags.length > 0 && (
          <div className="gallery-card__tags">
            {entry.tags.map((tag) => (
              <span key={tag} className="gallery-tag">#{tag}</span>
            ))}
          </div>
        )}
        <p className="gallery-card__date text-xs text-subtle">
          Printed {printDate}
        </p>
      </div>
    </article>
  );
}
