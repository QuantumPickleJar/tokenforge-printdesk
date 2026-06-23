import { useState, type ChangeEvent } from "react";
import { isSupabaseConfigured } from "../services/supabaseClient";
import { submitTokenforgePrintRequest } from "../services/requestService";
import {
  TOKENFORGE_PRINT_REQUEST_SCHEMA,
  parseTokenforgePrintRequestJson,
  type TokenforgePrintRequestPayload,
  type TokenforgeValidationResult,
} from "../types/tokenforgeHandoff";

const EXAMPLE_PAYLOAD = JSON.stringify(
  {
    schema: TOKENFORGE_PRINT_REQUEST_SCHEMA,
    createdAt: new Date().toISOString(),
    pricingMode: "quote",
    source: {
      handoff: { sourceApp: "Tokenforge Generator", intent: "public-demo" },
      generatorVersion: "0.1-demo",
      projectName: "Commander token relief",
    },
    customer: {
      displayName: "Demo Requester",
      contact: "demo@example.com",
      notes: "Prefers pickup if accepted.",
    },
    item: {
      name: "Raised mana token plate",
      description: "Embossed token-sized relief generated from the Tokenforge Generator.",
      galleryUrl: "https://example.com/gallery/mana-token",
      imageUrl: "https://example.com/gallery/mana-token.png",
      modelUrl: "https://example.com/model/mana-token.stl",
      previewUrl: "https://example.com/preview/mana-token",
    },
    print: {
      category: "token-card",
      material: "PLA",
      nozzleMm: 0.4,
      layerHeightMm: 0.2,
      colors: ["charcoal", "ivory"],
      estimatedGrams: 18,
      estimatedTimeMinutes: 142,
      requestedQuantity: 2,
      notes: "Manual color swap expected around the raised text layer.",
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
  },
  null,
  2
);

function pricingCopy(payload: TokenforgePrintRequestPayload): string {
  if (payload.pricingMode === "family") return "Family request — no payment is requested automatically.";
  if (payload.pricingMode === "free") return "Free request — no payment is requested automatically.";
  return "Quote request — owner review is required before any payment link exists.";
}

function SummaryCard({ payload }: { payload: TokenforgePrintRequestPayload }) {
  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <div className="card-header">
        <div>
          <h2 className="card-title">Validated request</h2>
          <p className="text-sm text-muted">{pricingCopy(payload)}</p>
        </div>
        <span className="badge badge-info">{payload.pricingMode}</span>
      </div>
      <div className="grid-2">
        <div>
          <h3 className="text-sm">Item</h3>
          <p><strong>{payload.item.name}</strong></p>
          <p className="text-sm text-muted">{payload.item.description || "No description provided."}</p>
          <p className="text-xs text-muted">Project: {payload.source.projectName || "—"}</p>
        </div>
        <div>
          <h3 className="text-sm">Print details</h3>
          <p className="text-sm">Qty {payload.print.requestedQuantity} · {payload.print.material || "material TBD"} · {payload.print.colors.join(", ") || "colors TBD"}</p>
          <p className="text-xs text-muted">
            Nozzle: {payload.print.nozzleMm ?? "—"} mm · Layer: {payload.print.layerHeightMm ?? "—"} mm · Est: {payload.print.estimatedGrams ?? "—"} g / {payload.print.estimatedTimeMinutes ?? "—"} min
          </p>
        </div>
      </div>
    </div>
  );
}

export function TokenforgeIntakePage() {
  const [rawJson, setRawJson] = useState(EXAMPLE_PAYLOAD);
  const [validation, setValidation] = useState<TokenforgeValidationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const supabaseReady = isSupabaseConfigured();

  function validateCurrent(): TokenforgeValidationResult {
    const next = parseTokenforgePrintRequestJson(rawJson);
    setValidation(next);
    setSubmitMessage(null);
    setSubmitError(null);
    return next;
  }

  async function handleJsonFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json")) {
      setValidation({ valid: false, errors: ["Upload a .json file exported by Tokenforge Generator."], warnings: [] });
      return;
    }
    const text = await file.text();
    setRawJson(text);
    setValidation(parseTokenforgePrintRequestJson(text));
    setSubmitMessage(null);
    setSubmitError(null);
  }

  async function submitToQueue() {
    const result = validateCurrent();
    if (!result.valid || !result.payload) return;
    if (!supabaseReady) {
      setSubmitError("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before accepting Generator handoffs.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitMessage(null);
    try {
      const response = await submitTokenforgePrintRequest(result.payload);
      setSubmitMessage(`Request added to Supabase queue. Reference ID: ${response.requestId}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "The request could not be added to the queue.");
    } finally {
      setSubmitting(false);
    }
  }

  const payload = validation?.payload;

  return (
    <div className="container">
      <section className="section">
        <h1 className="section-title">Tokenforge Generator Intake</h1>
        <p className="section-subtitle">
          Paste or upload a <code>{TOKENFORGE_PRINT_REQUEST_SCHEMA}</code> payload. Valid requests are written to Supabase and appear in the owner queue for review before quoting, printing, or declining.
        </p>

        {!supabaseReady && (
          <div className="alert alert-warning" style={{ marginBottom: "1.5rem" }}>
            <span>⚠️</span>
            <span>Supabase is not configured. Validation still works, but adding requests to the queue is disabled.</span>
          </div>
        )}

        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Paste JSON</h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRawJson(EXAMPLE_PAYLOAD)}>Reset example</button>
            </div>
            <textarea
              className="form-textarea font-mono"
              style={{ minHeight: 520 }}
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              spellCheck={false}
              aria-label="Tokenforge print request JSON"
            />
            <div className="flex flex-wrap gap-sm" style={{ marginTop: "1rem" }}>
              <button type="button" className="btn btn-secondary" onClick={validateCurrent}>Validate</button>
              <button type="button" className="btn btn-primary" onClick={submitToQueue} disabled={submitting || !supabaseReady}>{submitting ? "Adding…" : "Add to queue"}</button>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Upload JSON</h2>
            <p className="text-sm text-muted">Use this when the Generator downloads metadata instead of copying it to the clipboard.</p>
            <input className="form-input" type="file" accept="application/json,.json" onChange={handleJsonFile} />

            <div style={{ marginTop: "1.5rem" }}>
              <h2 className="card-title">Validation</h2>
              {!validation && <p className="text-sm text-muted">No validation has been run yet.</p>}
              {validation && validation.errors.length > 0 && (
                <div className="alert alert-error" role="alert">
                  <span>⚠️</span>
                  <div>{validation.errors.map((error) => <p key={error}>{error}</p>)}</div>
                </div>
              )}
              {validation && validation.valid && (
                <div className="alert alert-success">
                  <span>✅</span>
                  <span>Payload is valid and ready for owner review.</span>
                </div>
              )}
              {validation && validation.warnings.length > 0 && (
                <div className="alert alert-warning" style={{ marginTop: "1rem" }}>
                  <span>⚠️</span>
                  <div>{validation.warnings.map((warning) => <p key={warning}>{warning}</p>)}</div>
                </div>
              )}
              {submitMessage && <div className="alert alert-success" style={{ marginTop: "1rem" }}><span>✅</span><span>{submitMessage}</span></div>}
              {submitError && <div className="alert alert-error" style={{ marginTop: "1rem" }} role="alert"><span>⚠️</span><span>{submitError}</span></div>}
            </div>

            {payload && <SummaryCard payload={payload} />}
          </div>
        </div>
      </section>
    </div>
  );
}
