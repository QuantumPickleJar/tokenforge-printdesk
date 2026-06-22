import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { StlPreview } from "../components/stl/StlPreview";
import { HelpPopover } from "../components/common/HelpPopover";
import { fetchMaterials } from "../services/materialService";
import { estimateMaterialCost } from "../services/estimateService";
import { submitRequest } from "../services/requestService";
import { validateStlFile } from "../services/stlAnalyzer";
import type { Material } from "../types/materials";
import type { InfillType } from "../types/printRequest";
import "./RequestPage.css";

interface FormState {
  name: string;
  email: string;
  title: string;
  description: string;
  materialId: string;
  color: string;
  sourceLink: string;
  replyRequested: boolean;
  licensingConfirmed: boolean;
  personalDesign: boolean;
  shippingRequested: boolean;
  // Advanced
  layerHeight: string;
  infillType: InfillType;
  infillPercent: string;
  wallCount: string;
}

const DEFAULT_FORM: FormState = {
  name: "",
  email: "",
  title: "",
  description: "",
  materialId: "",
  color: "",
  sourceLink: "",
  replyRequested: false,
  licensingConfirmed: false,
  personalDesign: false,
  shippingRequested: false,
  layerHeight: "0.20",
  infillType: "grid",
  infillPercent: "15",
  wallCount: "3",
};

const INFILL_OPTIONS: { value: InfillType; label: string }[] = [
  { value: "grid",       label: "Grid" },
  { value: "gyroid",     label: "Gyroid" },
  { value: "honeycomb",  label: "Honeycomb" },
  { value: "triangles",  label: "Triangles" },
  { value: "cubic",      label: "Cubic" },
  { value: "lines",      label: "Lines" },
];

export function RequestPage() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [stlFile, setStlFile] = useState<File | undefined>();
  const [stlError, setStlError] = useState<string | undefined>();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [estimate, setEstimate] = useState<{
    weightGrams: number;
    cost: number;
    disclaimer: string;
    isMock: boolean;
  } | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | undefined>();

  useEffect(() => {
    fetchMaterials().then(setMaterials);
  }, []);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleStlChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setStlError(undefined);
    if (!file) {
      setStlFile(undefined);
      return;
    }
    const validation = validateStlFile(file);
    if (!validation.valid) {
      setStlError(validation.error);
      setStlFile(undefined);
    } else {
      setStlFile(file);
    }
  }

  async function handleEstimate() {
    const mat = materials.find((m) => m.id === form.materialId);
    const costPerGram = mat?.costPerGram ?? 0.02;
    setEstimating(true);
    try {
      const result = await estimateMaterialCost(
        costPerGram,
        advancedMode
          ? {
              layerHeight: parseFloat(form.layerHeight) || 0.2,
              infillType: form.infillType,
              infillPercent: parseInt(form.infillPercent, 10) || 15,
              wallCount: parseInt(form.wallCount, 10) || 3,
            }
          : undefined
      );
      setEstimate({
        weightGrams: result.estimatedWeightGrams,
        cost: result.estimatedMaterialCost,
        disclaimer: result.disclaimer,
        isMock: result.isMock,
      });
    } finally {
      setEstimating(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      const result = await submitRequest({
        requesterName: form.name,
        requesterEmail: form.email,
        title: form.title,
        description: form.description,
        materialId: form.materialId || undefined,
        color: form.color || undefined,
        sourceLink: form.sourceLink || undefined,
        replyRequested: form.replyRequested,
        licensingConfirmed: form.licensingConfirmed,
        personalDesign: form.personalDesign,
        shippingRequested: form.shippingRequested,
        requestType: "public_quote",
        modelAttached: !!stlFile,
        advancedMode,
        advancedSettings: advancedMode
          ? {
              layerHeight: parseFloat(form.layerHeight) || 0.2,
              infillType: form.infillType,
              infillPercent: parseInt(form.infillPercent, 10) || 15,
              wallCount: parseInt(form.wallCount, 10) || 3,
            }
          : undefined,
        roughMaterialEstimate: estimate?.cost,
        familyGroupId: undefined,
        stlFileKey: undefined,   // Not uploaded in scaffold
        // TODO: upload stlFile via storageService.uploadStlFile() in implementation pass
      });
      setSubmitted(result.requestId);
    } catch {
      setSubmitError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="container">
        <section className="section request-success">
          <div className="alert alert-success" style={{ marginBottom: "1.5rem" }}>
            <span aria-hidden="true">✅</span>
            <div>
              <strong>Request received!</strong> (scaffold mock — not persisted)
              <br />
              Reference ID: <code className="font-mono">{submitted}</code>
            </div>
          </div>
          <p className="text-muted">
            In the real app, you would receive a confirmation email and the owner
            would review your request before generating a quote.
          </p>
          <button
            className="btn btn-secondary"
            style={{ marginTop: "1rem" }}
            onClick={() => { setSubmitted(null); setForm(DEFAULT_FORM); setEstimate(null); setStlFile(undefined); }}
          >
            Submit another request
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="container">
      <section className="section">
        <div className="scaffold-banner">
          🏗️ This form is a scaffold placeholder. Submission is mocked and{" "}
          <strong>does not persist data</strong>. STL upload is not implemented yet.
        </div>

        <h1 className="section-title">Request a Quote</h1>
        <p className="section-subtitle">
          Describe your print request below. The owner will review your request,
          assess printability, and send you a quote. Material estimates shown here
          are <strong>rough only</strong> — final pricing is set by the owner.
        </p>

        <form onSubmit={handleSubmit} className="request-form" noValidate>
          {/* Contact */}
          <fieldset className="request-fieldset">
            <legend>Your Information</legend>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="req-name">
                  Name <span className="required">*</span>
                </label>
                <input
                  id="req-name"
                  name="name"
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  placeholder="Your name"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="req-email">
                  Email <span className="required">*</span>
                </label>
                <input
                  id="req-email"
                  name="email"
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>
            </div>
          </fieldset>

          {/* Request details */}
          <fieldset className="request-fieldset">
            <legend>Print Request Details</legend>

            <div className="form-group">
              <label className="form-label" htmlFor="req-title">
                Request title <span className="required">*</span>
              </label>
              <input
                id="req-title"
                name="title"
                type="text"
                className="form-input"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Articulated dragon, 15 cm wingspan"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="req-description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="req-description"
                name="description"
                className="form-textarea"
                value={form.description}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Describe your request: intended use, size, any special requirements…"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="req-source-link">
                Source / model link{" "}
                <span className="text-subtle">(optional)</span>
              </label>
              <input
                id="req-source-link"
                name="sourceLink"
                type="url"
                className="form-input"
                value={form.sourceLink}
                onChange={handleChange}
                placeholder="https://www.printables.com/model/..."
              />
              <p className="form-hint">Thingiverse, Printables, MakerWorld, etc.</p>
            </div>
          </fieldset>

          {/* Material & color */}
          <fieldset className="request-fieldset">
            <legend>Material &amp; Color</legend>
            <p className="form-hint" style={{ marginBottom: "1rem" }}>
              Material cost estimates are rough. The owner will confirm final
              material selection and pricing.
            </p>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="req-material">
                  Preferred material
                </label>
                <select
                  id="req-material"
                  name="materialId"
                  className="form-select"
                  value={form.materialId}
                  onChange={handleChange}
                >
                  <option value="">— No preference —</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id} disabled={!m.inStock}>
                      {m.name} ({m.filamentType}){!m.inStock ? " — Out of stock" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="req-color">
                  Preferred color
                </label>
                <input
                  id="req-color"
                  name="color"
                  type="text"
                  className="form-input"
                  value={form.color}
                  onChange={handleChange}
                  placeholder="e.g. Matte Black, any blue"
                />
              </div>
            </div>

            {/* Estimate button */}
            <div className="estimate-block">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleEstimate}
                disabled={estimating}
              >
                {estimating ? "Estimating…" : "Estimate material cost"}
              </button>
              {estimate && (
                <div className="estimate-result">
                  <div className="badge badge-warning" style={{ marginBottom: "0.5rem" }}>
                    Rough material estimate
                  </div>
                  <p>
                    ≈ <strong>{estimate.weightGrams} g</strong> &nbsp;|&nbsp;
                    Material cost ≈ <strong>${estimate.cost.toFixed(2)}</strong>
                  </p>
                  <p className="text-xs text-muted" style={{ marginTop: "0.25rem" }}>
                    {estimate.disclaimer}
                  </p>
                </div>
              )}
            </div>
          </fieldset>

          {/* STL upload */}
          <fieldset className="request-fieldset">
            <legend>STL / Model File</legend>
            <div className="form-group">
              <label className="form-label" htmlFor="req-stl">
                Upload STL file{" "}
                <span className="text-subtle">(optional — .stl or .3mf, max 50 MB)</span>
              </label>
              <input
                id="req-stl"
                name="stlFile"
                type="file"
                accept=".stl,.3mf"
                className="form-input"
                onChange={handleStlChange}
              />
              {stlError && (
                <p className="text-error text-sm" role="alert">{stlError}</p>
              )}
              <p className="form-hint">
                STL upload is a placeholder in this scaffold — files are{" "}
                <strong>not</strong> actually uploaded.
              </p>
            </div>
            <StlPreview file={stlFile} />
          </fieldset>

          {/* Options */}
          <fieldset className="request-fieldset">
            <legend>Options &amp; Preferences</legend>

            <div className="form-group">
              <label className="form-checkbox-group">
                <input
                  type="checkbox"
                  name="replyRequested"
                  checked={form.replyRequested}
                  onChange={handleChange}
                />
                <span>I would like a reply / questions answered before the quote is finalized</span>
              </label>
            </div>

            <div className="form-group">
              <label className="form-toggle" htmlFor="req-shipping">
                <span className="toggle-switch">
                  <input
                    id="req-shipping"
                    name="shippingRequested"
                    type="checkbox"
                    checked={form.shippingRequested}
                    onChange={handleChange}
                  />
                  <span className="toggle-slider" />
                </span>
                <span>Shipping requested</span>
              </label>
              <p className="form-hint" style={{ marginLeft: "52px" }}>
                Leave off if you plan to pick up locally.
              </p>
            </div>
          </fieldset>

          {/* Licensing */}
          <fieldset className="request-fieldset">
            <legend>Licensing &amp; Source</legend>

            <div className="form-group">
              <label className="form-checkbox-group">
                <input
                  type="checkbox"
                  name="licensingConfirmed"
                  checked={form.licensingConfirmed}
                  onChange={handleChange}
                />
                <span>
                  I confirm that this design is licensed for personal/commercial
                  printing, or that I have the appropriate rights to have it printed.
                </span>
              </label>
            </div>

            <div className="form-group">
              <label className="form-checkbox-group">
                <input
                  type="checkbox"
                  name="personalDesign"
                  checked={form.personalDesign}
                  onChange={handleChange}
                />
                <span>This is my own original design (I created the STL/model myself)</span>
              </label>
            </div>
          </fieldset>

          {/* Advanced mode toggle */}
          <fieldset className="request-fieldset">
            <legend>Advanced Print Settings</legend>

            <div className="form-group">
              <label className="form-toggle" htmlFor="req-advanced">
                <span className="toggle-switch">
                  <input
                    id="req-advanced"
                    type="checkbox"
                    checked={advancedMode}
                    onChange={(e) => setAdvancedMode(e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </span>
                <span>Advanced mode</span>
              </label>
              <p className="form-hint" style={{ marginLeft: "52px" }}>
                Specify layer height, infill type/percent, and wall count. Leave
                off to let the owner choose appropriate defaults.
              </p>
            </div>

            {advancedMode && (
              <div className="advanced-settings-panel">
                <div className="grid-2">
                  {/* Layer height */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="req-layer-height">
                      Layer height (mm){" "}
                      <HelpPopover label="Layer height">
                        Controls print resolution and strength. 0.20 mm is a
                        good all-around default. Lower values (0.12–0.16) give
                        finer detail but take longer. Higher values (0.28–0.32)
                        print faster with less detail.
                      </HelpPopover>
                    </label>
                    <select
                      id="req-layer-height"
                      name="layerHeight"
                      className="form-select"
                      value={form.layerHeight}
                      onChange={handleChange}
                    >
                      <option value="0.12">0.12 mm (fine)</option>
                      <option value="0.16">0.16 mm</option>
                      <option value="0.20">0.20 mm (standard)</option>
                      <option value="0.24">0.24 mm</option>
                      <option value="0.28">0.28 mm</option>
                      <option value="0.32">0.32 mm (draft)</option>
                    </select>
                  </div>

                  {/* Wall count */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="req-wall-count">
                      Wall count{" "}
                      <HelpPopover label="Wall count">
                        Number of perimeter walls. 2–3 is typical for decorative
                        prints. 4+ for functional or structural parts. More walls
                        = stronger part, more filament.
                      </HelpPopover>
                    </label>
                    <input
                      id="req-wall-count"
                      name="wallCount"
                      type="number"
                      min={1}
                      max={10}
                      className="form-input"
                      value={form.wallCount}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Infill type */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="req-infill-type">
                      Infill type{" "}
                      <HelpPopover label="Infill type">
                        Pattern used to fill the inside of the print. Gyroid is
                        strong in all directions and works well with flexible
                        materials. Grid is fast and works for most parts.
                        Honeycomb balances strength and material use.
                      </HelpPopover>
                    </label>
                    <select
                      id="req-infill-type"
                      name="infillType"
                      className="form-select"
                      value={form.infillType}
                      onChange={handleChange}
                    >
                      {INFILL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Infill percent */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="req-infill-percent">
                      Infill % (0–100){" "}
                      <HelpPopover label="Infill percent">
                        How dense the interior fill is. 10–20% is typical for
                        decorative parts. 40–60% for functional parts. 80–100%
                        for maximum strength (rare, slow, heavy).
                      </HelpPopover>
                    </label>
                    <input
                      id="req-infill-percent"
                      name="infillPercent"
                      type="number"
                      min={0}
                      max={100}
                      className="form-input"
                      value={form.infillPercent}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}
          </fieldset>

          {/* Submit */}
          {submitError && (
            <div className="alert alert-error" style={{ marginBottom: "1rem" }} role="alert">
              <span>⚠️</span>
              <span>{submitError}</span>
            </div>
          )}

          <div className="request-submit-row">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
            <p className="text-xs text-muted" style={{ maxWidth: "460px" }}>
              By submitting, you confirm the licensing statement above. The owner
              will review your request and send a quote — no payment is requested
              automatically.
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}
