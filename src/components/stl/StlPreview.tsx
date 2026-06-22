// ─────────────────────────────────────────────
// STL Preview Placeholder
// ─────────────────────────────────────────────
// TODO (implementation pass):
//   - Use Three.js STLLoader to load and render the STL file in a WebGL canvas.
//   - Run STL parsing in a Web Worker to avoid blocking the main thread.
//   - Validate file type and size BEFORE passing to the loader.
//   - Add camera controls (OrbitControls) for interactive preview.
//   - Show a loading spinner while the model is being parsed.
//   - Handle parse errors gracefully without crashing the page.
//
// Three.js is already installed as a dependency (see package.json).

import "./StlPreview.css";

interface StlPreviewProps {
  /** The STL file selected by the user (not yet uploaded). */
  file?: File;
}

export function StlPreview({ file }: StlPreviewProps) {
  return (
    <div className="stl-preview-panel" aria-label="STL preview panel" role="region">
      <div className="stl-preview-icon" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="40" height="40" rx="6" stroke="currentColor" strokeWidth="2" fill="none" />
          <polyline points="14,32 22,20 28,26 34,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="34" cy="18" r="2" fill="currentColor" />
        </svg>
      </div>
      <p className="stl-preview-label">
        {file ? (
          <>STL preview coming soon — <code>{file.name}</code> selected</>
        ) : (
          "STL preview will render here"
        )}
      </p>
      <p className="stl-preview-note">
        3D model preview requires Three.js STLLoader (not implemented in scaffold).
      </p>
    </div>
  );
}
