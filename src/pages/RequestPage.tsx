import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { StlPreview } from "../components/stl/StlPreview";
import { HelpPopover } from "../components/common/HelpPopover";
import { estimateMaterialCost, type RoughEstimateResult } from "../services/estimateService";
import { fetchMaterialVariants } from "../services/materialService";
import { submitRequest } from "../services/requestService";
import { isSupabaseConfigured } from "../services/supabaseClient";
import { analyzeStlFile, validateStlFile, type StlAnalysisResult } from "../services/stlAnalyzer";
import type { MaterialVariant } from "../types/materials";
import type { InfillType, ModelSourceMode } from "../types/printRequest";
import "./RequestPage.css";

interface FormState {
  name: string;
  email: string;
  title: string;
  description: string;
  materialType: string;
  materialColorId: string;
  sourceMode: ModelSourceMode;
  sourceLink: string;
  replyRequested: boolean;
  licensingConfirmed: boolean;
  personalDesign: boolean;
  shippingRequested: boolean;
  shippingNotes: string;
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
  materialType: "",
  materialColorId: "",
  sourceMode: "link",
  sourceLink: "",
  replyRequested: false,
  licensingConfirmed: false,
  personalDesign: false,
  shippingRequested: false,
  shippingNotes: "",
  layerHeight: "0.20",
  infillType: "grid",
  infillPercent: "15",
  wallCount: "3",
};

const INFILL_OPTIONS: { value: InfillType; label: string }[] = [
  { value: "grid", label: "Grid" },
  { value: "gyroid", label: "Gyroid" },
  { value: "honeycomb", label: "Honeycomb" },
  { value: "triangles", label: "Triangles" },
  { value: "cubic", label: "Cubic" },
  { value: "lines", label: "Lines" },
];

const GALLERY_HANDOFF_SCHEMA = "tokenforge.printdesk.gallery-handoff.v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(source: unknown, key: string): string {
  if (!isRecord(source)) return "";
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(source: unknown, key: string): number | null {
  if (!isRecord(source)) return null;
  const value = source[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function decodeUrlSafeBase64Json(value: string): unknown {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function formatLayerHeight(value: number | null): string | null {
  if (value === null) return null;
  const rounded = Math.round(value * 100) / 100;
  const allowed = [0.12, 0.16, 0.2, 0.28];
  const match = allowed.find((option) => Math.abs(option - rounded) < 0.001);
  return match ? match.toFixed(2) : null;
}

function readGalleryHandoffPreset(): { form: Partial<FormState>; advancedMode: boolean } | null {
  const encoded = new URLSearchParams(window.location.search).get("handoff");
  if (!encoded) return null;

  const payload = decodeUrlSafeBase64Json(encoded);
  if (!isRecord(payload) || readString(payload, "schema") !== GALLERY_HANDOFF_SCHEMA) return null;

  const item = isRecord(payload.item) ? payload.item : {};
  const print = isRecord(payload.print) ? payload.print : {};
  const source = isRecord(payload.source) ? payload.source : {};
  const title = readString(item, "name") || "Portfolio gallery print";
  const description = readString(item, "description");
  const galleryUrl = readString(item, "galleryUrl") || readString(source, "galleryUrl");
  const imageUrl = readString(item, "imageUrl");
  const modelUrl = readString(item, "modelUrl");
  const previewUrl = readString(item, "previewUrl");
  const material = readString(print, "material");
  const printNotes = readString(print, "notes");
  const layerHeight = formatLayerHeight(readNumber(print, "layerHeightMm"));
  const sourceLink = modelUrl || galleryUrl || previewUrl || imageUrl;
  const descriptionParts = [
    description,
    material ? `Preferred material from gallery: ${material}` : "",
    printNotes ? `Gallery notes: ${printNotes}` : "",
    galleryUrl ? `Portfolio gallery item: ${galleryUrl}` : "",
    imageUrl ? `Reference image: ${imageUrl}` : "",
  ].filter(Boolean);

  return {
    advancedMode: Boolean(layerHeight),
    form: {
      title,
      description: descriptionParts.join("\n\n"),
      materialType: material,
      sourceMode: "link",
      sourceLink,
      layerHeight: layerHeight ?? DEFAULT_FORM.layerHeight,
    },
  };
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function RequestPage() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [stlFile, setStlFile] = useState<File | undefined>();
  const [stlAnalysis, setStlAnalysis] = useState<StlAnalysisResult | undefined>();
  const [stlError, setStlError] = useState<string | undefined>();
  const [materials, setMaterials] = useState<MaterialVariant[]>([]);
  const [estimate, setEstimate] = useState<RoughEstimateResult | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [handoffNotice, setHandoffNotice] = useState<string | null>(null);
  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    fetchMaterialVariants()
      .then(setMaterials)
      .catch((err) => setSubmitError(err instanceof Error ? err.message : "Could not load materials."));
  }, []);

  useEffect(() => {
    try {
      const preset = readGalleryHandoffPreset();
      if (!preset) return;
      setForm((prev) => ({ ...prev, ...preset.form }));
      if (preset.advancedMode) setAdvancedMode(true);
      setHandoffNotice("Loaded this form from the portfolio gallery. Add your contact details, confirm licensing, then submit when ready.");
    } catch (error) {
      setHandoffNotice(null);
      setSubmitError(error instanceof Error ? `Could not read gallery handoff: ${error.message}` : "Could not read gallery handoff.");
    }
  }, []);

  const materialTypes = useMemo(() => Array.from(new Set(materials.map((m) => m.materialType))), [materials]);
  const filteredColors = form.materialType ? materials.filter((m) => m.materialType === form.materialType) : materials;
  const selectedMaterial = materials.find((m) => m.id === form.materialColorId);
  const canEstimate = form.sourceMode === "upload" && Boolean(selectedMaterial && stlFile && !stlError);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      ...(name === "materialType" ? { materialColorId: "" } : {}),
    }));
  }

  function handleSourceModeChange(e: ChangeEvent<HTMLSelectElement>) {
    const sourceMode = e.target.value as ModelSourceMode;
    setForm((prev) => ({
      ...prev,
      sourceMode,
      sourceLink: sourceMode === "upload" ? "" : prev.sourceLink,
    }));
    setSubmitError(undefined);
    setEstimate(null);
    if (sourceMode === "link") {
      setStlFile(undefined);
      setStlAnalysis(undefined);
      setStlError(undefined);
    }
  }

  async function handleStlChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setStlError(undefined);
    setStlAnalysis(undefined);
    setEstimate(null);
    if (!file) {
      setStlFile(undefined);
      return;
    }
    const validation = validateStlFile(file);
    if (!validation.valid) {
      setStlError(validation.error);
      setStlFile(undefined);
      return;
    }
    setStlFile(file);
    try {
      setStlAnalysis(await analyzeStlFile(file));
    } catch (error) {
      setStlError(error instanceof Error ? error.message : "Could not parse STL file.");
    }
  }

  function readAdvancedSettings() {
    return {
      layerHeight: parseFloat(form.layerHeight) || 0.2,
      infillType: form.infillType,
      infillPercent: parseInt(form.infillPercent, 10) || 15,
      wallCount: parseInt(form.wallCount, 10) || 3,
    };
  }

  function handleEstimate() {
    if (!selectedMaterial) {
      setSubmitError("Choose a material and color before estimating.");
      return;
    }
    if (form.sourceMode !== "upload") {
      setSubmitError("Material estimates are only available when an STL is uploaded. Linked models are estimated after owner review.");
      return;
    }
    if (!stlFile || stlError) {
      setSubmitError("Upload a valid STL before estimating.");
      return;
    }
    setEstimating(true);
    setSubmitError(undefined);
    try {
      setEstimate(estimateMaterialCost(selectedMaterial, stlAnalysis, advancedMode ? readAdvancedSettings() : undefined));
    } finally {
      setEstimating(false);
    }
  }

  function resetForm() {
    setSubmitted(null);
    setForm(DEFAULT_FORM);
    setEstimate(null);
    setStlFile(undefined);
    setStlAnalysis(undefined);
    setStlError(undefined);
    setAdvancedMode(false);
    setHandoffNotice(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      if (!supabaseReady) throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before accepting live requests.");
      if (form.sourceMode === "upload" && !stlFile) throw new Error("Upload a valid .stl file before submitting.");
      if (form.sourceMode === "upload" && stlError) throw new Error(`Fix the STL upload before submitting: ${stlError}`);
      if (form.sourceMode === "link" && !isValidHttpUrl(form.sourceLink.trim())) throw new Error("Paste a valid http or https model URL before submitting.");
      if (!form.licensingConfirmed) throw new Error("You must confirm licensing/source rights before submitting.");
      const result = await submitRequest({
        requesterName: form.name,
        requesterEmail: form.email,
        title: form.title,
        description: form.description,
        materialColorId: form.materialColorId || undefined,
        sourceMode: form.sourceMode,
        sourceLink: form.sourceMode === "link" ? form.sourceLink.trim() : undefined,
        replyRequested: form.replyRequested,
        licensingConfirmed: form.licensingConfirmed,
        personalDesign: form.personalDesign,
        shippingRequested: form.shippingRequested,
        shippingNotes: form.shippingNotes || undefined,
        advancedMode,
        advancedSettings: advancedMode ? readAdvancedSettings() : undefined,
        roughEstimate: estimate ?? undefined,
        stlFile: form.sourceMode === "upload" ? stlFile : undefined,
      });
      setSubmitted(result.requestId);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Submission failed. Please try again.");
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
              <strong>Request received.</strong><br />Reference ID: <code className="font-mono">{submitted}</code>
            </div>
          </div>
          <p className="text-muted">The owner will review your model source and request details before quoting. No payment is requested at submission time.</p>
          <button className="btn btn-secondary" style={{ marginTop: "1rem" }} onClick={resetForm}>
            Submit another request
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="container">
      <section className="section">
        <h1 className="section-title">Request a Quote</h1>
        <p className="section-subtitle">Paste a model URL or upload an STL, then describe the print. The owner reviews requests before accepting, quoting, or asking follow-up questions.</p>

        {handoffNotice && (
          <div className="alert alert-success" style={{ marginBottom: "1.5rem" }}>
            <span>✅</span>
            <span>{handoffNotice}</span>
          </div>
        )}

        {!supabaseReady && (
          <div className="alert alert-warning" style={{ marginBottom: "1.5rem" }}>
            <span>⚠️</span>
            <span>Supabase is not configured yet. You can explore the form and STL preview, but live request submission is disabled until environment variables are set.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="request-form" noValidate>
          <fieldset className="request-fieldset">
            <legend>Your Information</legend>
            <div className="grid-2">
              <div className="form-group"><label className="form-label" htmlFor="req-name">Name <span className="required">*</span></label><input id="req-name" name="name" className="form-input" value={form.name} onChange={handleChange} required autoComplete="name" /></div>
              <div className="form-group"><label className="form-label" htmlFor="req-email">Email <span className="required">*</span></label><input id="req-email" name="email" type="email" className="form-input" value={form.email} onChange={handleChange} required autoComplete="email" /></div>
            </div>
          </fieldset>

          <fieldset className="request-fieldset">
            <legend>Print Request Details</legend>
            <div className="form-group"><label className="form-label" htmlFor="req-title">Request title <span className="required">*</span></label><input id="req-title" name="title" className="form-input" value={form.title} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label" htmlFor="req-description">Description <span className="required">*</span></label><textarea id="req-description" name="description" className="form-textarea" value={form.description} onChange={handleChange} required rows={5} /></div>
          </fieldset>

          <fieldset className="request-fieldset">
            <legend>Model Source</legend>
            <div className="form-group">
              <label className="form-label" htmlFor="req-source-mode">How do you want to provide the model? <span className="required">*</span></label>
              <select id="req-source-mode" name="sourceMode" className="form-select" value={form.sourceMode} onChange={handleSourceModeChange}>
                <option value="link">Paste a model URL</option>
                <option value="upload">Upload an STL file</option>
              </select>
              <p className="form-hint">Choose one source. The other option is hidden so the request stays unambiguous.</p>
            </div>

            {form.sourceMode === "link" ? (
              <div className="form-group">
                <label className="form-label" htmlFor="req-source-link">Model URL <span className="required">*</span></label>
                <input id="req-source-link" name="sourceLink" type="url" className="form-input" value={form.sourceLink} onChange={handleChange} placeholder="https://www.printables.com/model/..." required />
                <p className="form-hint">Use a public model page, gallery reference, or download link. The owner will inspect the model before accepting or quoting.</p>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label" htmlFor="req-stl">Upload STL file <span className="text-subtle">(.stl only, max 40 MB)</span></label>
                <input id="req-stl" name="stlFile" type="file" accept=".stl" className="form-input" onChange={handleStlChange} required />
                <p className="form-hint">
                  Testing the flow? Use the included <a href={`${import.meta.env.BASE_URL}test-assets/smoke-cube.stl`} download>smoke-test cube STL</a>.
                </p>
                {stlError && <p className="text-error text-sm" role="alert">{stlError}</p>}
                {stlAnalysis?.boundingBoxMm && <p className="form-hint">Bounds: {stlAnalysis.boundingBoxMm.x.toFixed(1)} × {stlAnalysis.boundingBoxMm.y.toFixed(1)} × {stlAnalysis.boundingBoxMm.z.toFixed(1)} mm</p>}
                <StlPreview file={stlFile} />
              </div>
            )}
          </fieldset>

          <fieldset className="request-fieldset">
            <legend>Material &amp; Color</legend>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="req-material">Preferred material</label>
                <select id="req-material" name="materialType" className="form-select" value={form.materialType} onChange={handleChange}>
                  <option value="">— No preference —</option>
                  {form.materialType && !materialTypes.includes(form.materialType) && <option value={form.materialType}>{form.materialType}</option>}
                  {materialTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="req-color">Preferred color</label>
                <select id="req-color" name="materialColorId" className="form-select" value={form.materialColorId} onChange={handleChange}>
                  <option value="">— No preference —</option>
                  {filteredColors.map((m) => <option key={m.id} value={m.id}>{m.colorName}{m.brand ? ` (${m.brand})` : ""}</option>)}
                </select>
              </div>
            </div>
            <div className="estimate-block">
              <button type="button" className="btn btn-secondary" onClick={handleEstimate} disabled={estimating || !canEstimate}>{estimating ? "Estimating…" : "Estimate material cost"}</button>
              {form.sourceMode === "link" && <p className="form-hint">Material estimates are skipped for link-only requests until the owner reviews the model.</p>}
              {estimate && <div className="estimate-result"><div className="badge badge-warning" style={{ marginBottom: "0.5rem" }}>Rough material estimate</div><p>≈ <strong>{estimate.estimatedGrams} g</strong> | Material cost ≈ <strong>${estimate.estimatedMaterialCost.toFixed(2)}</strong></p><p className="text-xs text-muted">{estimate.disclaimer}</p></div>}
            </div>
          </fieldset>

          <fieldset className="request-fieldset">
            <legend>Options &amp; Licensing</legend>
            <label className="form-checkbox-group"><input type="checkbox" name="replyRequested" checked={form.replyRequested} onChange={handleChange} /><span>I would like a reply before the quote is finalized</span></label>
            <label className="form-checkbox-group"><input type="checkbox" name="licensingConfirmed" checked={form.licensingConfirmed} onChange={handleChange} required /><span>I confirm that this model is licensed for this print or I have the rights to request it.</span></label>
            <label className="form-checkbox-group"><input type="checkbox" name="personalDesign" checked={form.personalDesign} onChange={handleChange} /><span>This is my own original design</span></label>
            <label className="form-toggle" htmlFor="req-shipping"><span className="toggle-switch"><input id="req-shipping" name="shippingRequested" type="checkbox" checked={form.shippingRequested} onChange={handleChange} /><span className="toggle-slider" /></span><span>Shipping requested</span></label>
            {form.shippingRequested && <textarea name="shippingNotes" className="form-textarea" value={form.shippingNotes} onChange={handleChange} rows={3} placeholder="Shipping address/details or questions" />}
          </fieldset>

          <fieldset className="request-fieldset">
            <legend>Advanced Print Settings</legend>
            <label className="form-toggle" htmlFor="req-advanced"><span className="toggle-switch"><input id="req-advanced" type="checkbox" checked={advancedMode} onChange={(e) => setAdvancedMode(e.target.checked)} /><span className="toggle-slider" /></span><span>Advanced mode</span></label>
            {advancedMode && <div className="advanced-settings-panel"><div className="grid-2">
              <div className="form-group"><label className="form-label" htmlFor="req-layer-height">Layer height <HelpPopover label="Layer height">0.20 mm is a good default; lower is finer/slower.</HelpPopover></label><select id="req-layer-height" name="layerHeight" className="form-select" value={form.layerHeight} onChange={handleChange}><option value="0.12">0.12 mm</option><option value="0.16">0.16 mm</option><option value="0.20">0.20 mm</option><option value="0.28">0.28 mm</option></select></div>
              <div className="form-group"><label className="form-label" htmlFor="req-wall-count">Wall count</label><input id="req-wall-count" name="wallCount" type="number" min={1} max={10} className="form-input" value={form.wallCount} onChange={handleChange} /></div>
              <div className="form-group"><label className="form-label" htmlFor="req-infill-type">Infill type</label><select id="req-infill-type" name="infillType" className="form-select" value={form.infillType} onChange={handleChange}>{INFILL_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
              <div className="form-group"><label className="form-label" htmlFor="req-infill-percent">Infill %</label><input id="req-infill-percent" name="infillPercent" type="number" min={0} max={100} className="form-input" value={form.infillPercent} onChange={handleChange} /></div>
            </div></div>}
          </fieldset>

          {submitError && <div className="alert alert-error" style={{ marginBottom: "1rem" }} role="alert"><span>⚠️</span><span>{submitError}</span></div>}
          <div className="request-submit-row"><button type="submit" className="btn btn-primary" disabled={submitting || !supabaseReady}>{submitting ? "Submitting…" : "Submit Request"}</button><p className="text-xs text-muted" style={{ maxWidth: "460px" }}>The owner will review before quoting. Payment is not requested at submission time.</p></div>
        </form>
      </section>
    </div>
  );
}
