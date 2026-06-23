import { useMemo, useState } from "react";
import { importTokenforgePrintRequest } from "../../services/tokenforgePrintRequestImportService";
import { parseTokenforgePrintRequestJson } from "../../services/tokenforgePrintRequestPayload";
import type { TokenforgePrintRequestPayload } from "../../types/tokenforgePrintRequest";

const SAMPLE_PAYLOAD = {
  schema: "tokenforge.print-request.v1",
  createdAt: new Date().toISOString(),
  source: {
    handoff: {},
    generatorVersion: "demo",
    projectName: "Example token tray",
  },
  customer: {
    displayName: "Demo User",
    contact: "demo@example.com",
    notes: "Prefers local pickup.",
  },
  item: {
    name: "Example token tray",
    description: "Generated from the portfolio → Tokenforge handoff flow.",
    galleryUrl: "https://quantumpicklejar.github.io/Personal-Static/",
    imageUrl: "",
    modelUrl: "https://example.com/model.stl",
    previewUrl: "",
  },
  print: {
    category: "tabletop",
    material: "PLA",
    nozzleMm: 0.4,
    layerHeightMm: 0.2,
    colors: ["black", "gold"],
    estimatedGrams: 42,
    estimatedTimeMinutes: 180,
    requestedQuantity: 1,
    notes: "Demo import only; owner still reviews final print settings.",
  },
  attachments: {
    packagePath: "",
    stlPath: "",
    previewPath: "",
    metadataPath: "",
  },
  state: {
    status: "new",
    quoteStatus: "not_quoted",
    paymentStatus: "not_requested",
  },
  pricingMode: "quote",
};

export function OwnerGeneratorIntakeTab({ reload }: { reload: () => Promise<void> }) {
  const [jsonText, setJsonText] = useState(() => JSON.stringify(SAMPLE_PAYLOAD, null, 2));
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<TokenforgePrintRequestPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const preview = useMemo(() => {
    if (!parsed) return null;
    return {
      name: parsed.item.name || parsed.source.projectName || "Untitled Tokenforge request",
      requester: parsed.customer.displayName || "Unknown requester",
      contact: parsed.customer.contact || "No contact provided",
      material: parsed.print.material || "Not specified",
      quantity: parsed.print.requestedQuantity ?? 1,
      pricingMode: parsed.pricingMode ?? "quote",
    };
  }, [parsed]);

  function validate() {
    setSuccess(null);
    const result = parseTokenforgePrintRequestJson(jsonText);
    if (result.ok === false) {
      setParsed(null);
      setError(result.error);
      return null;
    }

    const payload = result.payload;
    setError(null);
    setParsed(payload);
    return payload;
  }

  async function addToQueue() {
    const payload = validate();
    if (!payload) return;
    setSubmitting(true);
    setSuccess(null);
    try {
      const requestId = await importTokenforgePrintRequest(payload);
      setSuccess(`Added Tokenforge request to queue: ${requestId}`);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tokenforge request could not be imported.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onFileChange(file?: File) {
    setSuccess(null);
    setError(null);
    setParsed(null);
    if (!file) {
      setSelectedFileName(null);
      return;
    }
    if (!file.name.toLowerCase().endsWith(".json")) {
      setSelectedFileName(null);
      setError("Please upload a .json file exported from Tokenforge Generator.");
      return;
    }
    const text = await file.text();
    setSelectedFileName(file.name);
    setJsonText(text);
  }

  return (
    <div className="grid-2">
      <div className="card">
        <h2 className="section-title" style={{ fontSize: "1.25rem" }}>Import Tokenforge request JSON</h2>
        <p className="text-sm text-muted">
          Owner-only intake wizard. Paste or upload the JSON produced by Tokenforge Generator, validate it, then add it to the owner queue. Public users should not see this tool.
        </p>

        <label className="form-label" htmlFor="tokenforge-request-json">Request JSON</label>
        <textarea
          id="tokenforge-request-json"
          className="form-textarea"
          rows={18}
          value={jsonText}
          onChange={(event) => {
            setJsonText(event.target.value);
            setParsed(null);
            setSuccess(null);
          }}
          spellCheck={false}
        />

        <label className="form-label" htmlFor="tokenforge-request-json-upload">Upload JSON</label>
        <input
          id="tokenforge-request-json-upload"
          className="form-input"
          type="file"
          accept="application/json,.json"
          onChange={(event) => onFileChange(event.target.files?.[0])}
        />
        {selectedFileName && <p className="text-xs text-muted">Loaded {selectedFileName}</p>}

        <div className="form-actions" style={{ marginTop: "1rem" }}>
          <button className="btn btn-secondary" type="button" onClick={validate}>Validate</button>
          <button className="btn btn-primary" type="button" disabled={submitting} onClick={addToQueue}>
            {submitting ? "Adding…" : "Add to queue"}
          </button>
        </div>

        {error && <div className="alert alert-error" style={{ marginTop: "1rem" }}><span>⚠️</span><span>{error}</span></div>}
        {success && <div className="alert alert-success" style={{ marginTop: "1rem" }}><span>✅</span><span>{success}</span></div>}
      </div>

      <div className="card">
        <h3>Validation preview</h3>
        {!preview && <p className="text-sm text-muted">Validate a Tokenforge print request payload to preview what will enter the queue.</p>}
        {preview && (
          <dl className="text-sm">
            <dt className="text-muted">Item</dt>
            <dd>{preview.name}</dd>
            <dt className="text-muted">Requester</dt>
            <dd>{preview.requester} · {preview.contact}</dd>
            <dt className="text-muted">Material / quantity</dt>
            <dd>{preview.material} · Qty {preview.quantity}</dd>
            <dt className="text-muted">Pricing mode</dt>
            <dd>{preview.pricingMode === "family" ? "Family / no quote required" : preview.pricingMode === "free" ? "Free / comped" : "Manual quote"}</dd>
            <dt className="text-muted">Model source</dt>
            <dd>{parsed?.item.modelUrl || parsed?.attachments.stlPath || "No model URL/path provided"}</dd>
            <dt className="text-muted">Notes</dt>
            <dd>{parsed?.print.notes || parsed?.customer.notes || "—"}</dd>
          </dl>
        )}
        <div className="alert alert-info" style={{ marginTop: "1rem" }}>
          <span>ℹ️</span>
          <span>No payment is requested automatically. Imported requests enter the queue for owner review.</span>
        </div>
      </div>
    </div>
  );
}
