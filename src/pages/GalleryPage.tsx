import { useEffect, useMemo, useState } from "react";
import { fetchPublishedGallery } from "../services/galleryService";
import type { GalleryEntry, GalleryImage } from "../types/gallery";
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

function uniqueImages(entry: GalleryEntry): GalleryImage[] {
  const imageMap = new Map<string, GalleryImage>();

  for (const image of entry.images ?? []) {
    const url = image.publicUrl || image.storagePath;
    if (url) imageMap.set(url, image);
  }

  if (entry.imageUrl && !imageMap.has(entry.imageUrl)) {
    imageMap.set(entry.imageUrl, {
      id: `${entry.id}-primary-image`,
      galleryItemId: entry.id,
      storagePath: entry.imageUrl,
      publicUrl: entry.imageUrl,
      altText: entry.title,
      sortOrder: 0,
    });
  }

  return Array.from(imageMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);
}

function GalleryCard({ entry }: { entry: GalleryEntry }) {
  const images = useMemo(() => uniqueImages(entry), [entry]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = images[activeImageIndex] ?? images[0];
  const printDate = new Date(entry.printedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  useEffect(() => {
    setActiveImageIndex(0);
  }, [entry.id, images.length]);

  function previousImage() {
    setActiveImageIndex((index) => (index - 1 + images.length) % images.length);
  }

  function nextImage() {
    setActiveImageIndex((index) => (index + 1) % images.length);
  }

  return (
    <article className="card gallery-card">
      <div className="gallery-card__media">
        {activeImage?.publicUrl ? (
          <img src={activeImage.publicUrl} alt={activeImage.altText || entry.title} className="gallery-card__image" loading="lazy" />
        ) : (
          <div className="gallery-card__image-placeholder" aria-hidden="true"><span>⬡</span></div>
        )}
        {images.length > 1 && (
          <>
            <div className="gallery-card__carousel" aria-label={`Images for ${entry.title}`}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={previousImage}>Previous</button>
              <span className="text-xs text-muted">{activeImageIndex + 1} / {images.length}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={nextImage}>Next</button>
            </div>
            <div className="gallery-card__thumbnails" aria-label={`Choose image for ${entry.title}`}>
              {images.map((image, index) => (
                <button
                  key={image.id || `${entry.id}-image-${index}`}
                  type="button"
                  className={index === activeImageIndex ? "gallery-card__thumbnail is-active" : "gallery-card__thumbnail"}
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`Show image ${index + 1} of ${images.length} for ${entry.title}`}
                  aria-pressed={index === activeImageIndex}
                >
                  {image.publicUrl ? (
                    <img src={image.publicUrl} alt="" loading="lazy" />
                  ) : (
                    <span aria-hidden="true">⬡</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
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
