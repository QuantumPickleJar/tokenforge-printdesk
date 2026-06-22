import type { FormEvent } from "react";
import { setGalleryPublished, softDeleteGalleryItem, upsertGalleryItem } from "../../services/galleryService";
import type { GalleryEntry } from "../../types/gallery";

export function OwnerGalleryTab({ gallery, reload }: { gallery: GalleryEntry[]; reload: () => Promise<void> }) {
  async function createGallery(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await upsertGalleryItem({
      title: String(form.get("title")),
      description: String(form.get("description") || ""),
      materialSummary: String(form.get("material") || ""),
      colorSummary: String(form.get("color") || ""),
      tags: String(form.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean),
      published: form.get("published") === "on",
    });
    e.currentTarget.reset();
    await reload();
  }

  return (
    <div>
      <form onSubmit={createGallery} className="card request-form">
        <h2 className="card-title">Create gallery item</h2>
        <input name="title" className="form-input" placeholder="Title" required />
        <textarea name="description" className="form-textarea" placeholder="Description" />
        <input name="material" className="form-input" placeholder="Material summary" />
        <input name="color" className="form-input" placeholder="Color summary" />
        <input name="tags" className="form-input" placeholder="tags, comma, separated" />
        <label className="form-checkbox-group"><input name="published" type="checkbox" /><span>Publish now</span></label>
        <button className="btn btn-primary">Save</button>
      </form>

      <div className="grid-2" style={{ marginTop: "1rem" }}>
        {gallery.map((item) => (
          <div className="card" key={item.id}>
            <h3>{item.title}</h3>
            <p className="text-sm text-muted">{item.published ? "Published" : "Draft"}</p>
            <button className="btn btn-secondary btn-sm" onClick={() => setGalleryPublished(item.id, !item.published).then(reload)}>{item.published ? "Unpublish" : "Publish"}</button>
            <button className="btn btn-danger btn-sm" onClick={() => softDeleteGalleryItem(item.id).then(reload)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
