import { useState } from "react";
import { PaymentBadge, StatusBadge } from "../common/StatusBadge";
import { bulkUpdateRequestStatus, updateOwnerNotes, updateRequestStatus } from "../../services/requestService";
import { getSignedStlUrl } from "../../services/storageService";
import { isSafeHttpUrl } from "../../types/tokenforgeHandoff";
import type { PricingMode, TokenforgePrintRequestPayload } from "../../types/tokenforgeHandoff";
import type { PrintRequest, RequestStatus } from "../../types/printRequest";

type QueueGroup = "all" | "new" | "reviewing" | "accepted_quote" | "printing" | "ready" | "done" | "declined";

const STATUS_FILTERS: { id: QueueGroup; label: string; statuses?: RequestStatus[] }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New", statuses: ["submitted"] },
  { id: "reviewing", label: "Reviewing", statuses: ["reviewing", "needs_more_info"] },
  { id: "accepted_quote", label: "Accepted / Quote Sent", statuses: ["accepted", "accepted_for_quote", "quote_draft", "quoted", "quote_viewed", "quote_accepted", "payment_pending", "paid"] },
  { id: "printing", label: "Printing", statuses: ["printing"] },
  { id: "ready", label: "Ready", statuses: ["ready_for_pickup", "shipped"] },
  { id: "done", label: "Done", statuses: ["completed", "archived"] },
  { id: "declined", label: "Declined", statuses: ["declined", "canceled"] },
];

const STATUS_ACTIONS: RequestStatus[] = [
  "submitted",
  "reviewing",
  "accepted",
  "accepted_for_quote",
  "quoted",
  "needs_more_info",
  "declined",
  "printing",
  "ready_for_pickup",
  "completed",
  "archived",
];

export function OwnerQueueTab({ requests, reload }: { requests: PrintRequest[]; reload: () => Promise<void> }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<QueueGroup>("all");

  const activeFilter = STATUS_FILTERS.find((entry) => entry.id === filter);
  const filtered = requests.filter((req) => !activeFilter?.statuses || activeFilter.statuses.includes(req.status));

  async function runBulk(status: RequestStatus) {
    await bulkUpdateRequestStatus(Array.from(selected), status);
    setSelected(new Set());
    await reload();
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="queue-tab">
      <div className="grid-4" style={{ marginBottom: "1rem" }}>
        {STATUS_FILTERS.filter((entry) => entry.id !== "all").map((group) => {
          const count = requests.filter((request) => group.statuses?.includes(request.status)).length;
          return (
            <button key={group.id} className={`card ${filter === group.id ? "badge-primary" : ""}`} style={{ textAlign: "left", cursor: "pointer" }} onClick={() => setFilter(group.id)}>
              <span className="text-xs text-muted">{group.label}</span>
              <strong style={{ display: "block", fontSize: "1.4rem" }}>{count}</strong>
            </button>
          );
        })}
      </div>

      <div className="bulk-actions">
        <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value as QueueGroup)} style={{ maxWidth: 260 }}>
          {STATUS_FILTERS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>
        <span className="text-sm text-muted">{selected.size ? `${selected.size} selected` : "Oldest received first"}</span>
        <div className="bulk-actions__btns">
          {STATUS_ACTIONS.slice(1, 7).map((status) => (
            <button key={status} className="btn btn-secondary btn-sm" disabled={!selected.size} onClick={() => runBulk(status)}>{status.replaceAll("_", " ")}</button>
          ))}
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Received</th>
              <th>Request</th>
              <th>Requester</th>
              <th>Pricing</th>
              <th>Status</th>
              <th>Source / Links</th>
              <th>Print Details</th>
              <th>Owner Notes</th>
              <th>Payment</th>
              <th>Controls</th>
            </tr>
          </thead>
          <tbody>{filtered.map((req) => <QueueRow key={req.id} req={req} selected={selected.has(req.id)} toggle={toggle} reload={reload} />)}</tbody>
        </table>
      </div>
    </div>
  );
}

function QueueRow({ req, selected, toggle, reload }: { req: PrintRequest; selected: boolean; toggle: (id: string) => void; reload: () => Promise<void> }) {
  const [ownerNoteDraft, setOwnerNoteDraft] = useState(req.ownerNotes ?? "");

  async function openModel() {
    const file = req.files[0];
    if (!file) return;
    const url = await getSignedStlUrl(file.storagePath);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  async function changeStatus(status: RequestStatus) {
    await updateRequestStatus(req.id, status);
    await reload();
  }

  async function saveOwnerNotes() {
    await updateOwnerNotes(req.id, ownerNoteDraft);
    await reload();
  }

  return (
    <tr className={selected ? "row-selected" : ""}>
      <td><input type="checkbox" checked={selected} onChange={() => toggle(req.id)} aria-label={`Select ${req.title}`} /></td>
      <td className="text-xs text-muted" style={{ whiteSpace: "nowrap" }}>{new Date(req.receivedAt).toLocaleDateString()}</td>
      <td style={{ minWidth: 240 }}>
        <details>
          <summary className="queue-title">{req.title}</summary>
          <p className="text-sm text-muted" style={{ whiteSpace: "pre-line" }}>{req.description}</p>
          {req.shippingRequested && <p className="text-xs">Shipping requested: {req.shippingNotes ?? "details not provided"}</p>}
        </details>
      </td>
      <td className="text-sm">{req.requesterName}<br /><span className="text-xs text-muted">{req.requesterEmail}</span></td>
      <td><PricingModeBadge mode={req.pricingMode} /></td>
      <td><StatusBadge status={req.status} /></td>
      <td className="text-xs"><ModelSource req={req} openModel={openModel} /></td>
      <td className="text-xs"><PrintDetails req={req} /></td>
      <td style={{ minWidth: 220 }}>
        <textarea className="form-textarea" value={ownerNoteDraft} onChange={(e) => setOwnerNoteDraft(e.target.value)} rows={3} placeholder="Internal owner notes" />
        <button className="btn btn-secondary btn-sm" type="button" onClick={saveOwnerNotes}>Save notes</button>
      </td>
      <td><PaymentBadge status={req.paymentStatus} /></td>
      <td style={{ minWidth: 220 }}>
        <select className="form-select" value={req.status} onChange={(e) => changeStatus(e.target.value as RequestStatus)}>{STATUS_ACTIONS.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select>
        <div className="flex flex-wrap gap-sm" style={{ marginTop: "0.5rem" }}>
          <button className="btn btn-secondary btn-sm" type="button" onClick={() => changeStatus("accepted_for_quote")}>Quote needed</button>
          <button className="btn btn-secondary btn-sm" type="button" onClick={() => changeStatus("quoted")}>Quote sent</button>
        </div>
      </td>
    </tr>
  );
}

function PricingModeBadge({ mode }: { mode: PricingMode }) {
  const config: Record<PricingMode, { label: string; className: string }> = {
    quote: { label: "Quote", className: "badge-primary" },
    family: { label: "Family", className: "badge-success" },
    free: { label: "Free", className: "badge-info" },
  };
  return <span className={`badge ${config[mode].className}`}>{config[mode].label}</span>;
}

function ModelSource({ req, openModel }: { req: PrintRequest; openModel: () => Promise<void> }) {
  const payload = req.tokenforgePayload;
  if (payload) return <TokenforgeLinks payload={payload} fallbackSourceLink={req.sourceLink} />;

  if (req.modelAttached) {
    return <button className="btn btn-ghost btn-sm" onClick={openModel}>Open STL</button>;
  }

  if (req.sourceLink) {
    if (isSafeHttpUrl(req.sourceLink)) {
      return (
        <a className="btn btn-ghost btn-sm" href={req.sourceLink} target="_blank" rel="noopener noreferrer">
          Open link
        </a>
      );
    }
    return <span className="text-muted text-xs">Invalid link format</span>;
  }

  return <span className="text-muted">—</span>;
}

function TokenforgeLinks({ payload, fallbackSourceLink }: { payload: TokenforgePrintRequestPayload; fallbackSourceLink?: string | null }) {
  const links = [
    ["Gallery", payload.item.galleryUrl],
    ["Image", payload.item.imageUrl],
    ["Model", payload.item.modelUrl || fallbackSourceLink || ""],
    ["Preview", payload.item.previewUrl],
  ].filter(([, value]) => Boolean(value));

  return (
    <details>
      <summary>Generator handoff</summary>
      {links.length === 0 && <p className="text-muted">No external links.</p>}
      {links.map(([label, value]) => <LinkOrText key={label} label={label} value={value} />)}
      <PathText label="STL path" value={payload.attachments.stlPath} />
      <PathText label="Package" value={payload.attachments.packagePath} />
      <PathText label="Metadata" value={payload.attachments.metadataPath} />
    </details>
  );
}

function LinkOrText({ label, value }: { label: string; value: string }) {
  if (isSafeHttpUrl(value)) {
    return <p><a href={value} target="_blank" rel="noopener noreferrer">{label}</a></p>;
  }
  return <p><strong>{label}:</strong> <span className="text-muted">{value}</span></p>;
}

function PathText({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return <p><strong>{label}:</strong> <span className="text-muted">{value}</span></p>;
}

function PrintDetails({ req }: { req: PrintRequest }) {
  const payload = req.tokenforgePayload;
  if (!payload) {
    return (
      <span className="text-muted">
        {req.materialLabel ?? "Material TBD"}{req.advancedSettings ? ` · ${req.advancedSettings.layerHeight} mm` : ""}
      </span>
    );
  }

  return (
    <div>
      <p><strong>{payload.print.category || "Print"}</strong> · Qty {payload.print.requestedQuantity}</p>
      <p className="text-muted">{payload.print.material || "Material TBD"} · {payload.print.colors.join(", ") || "Colors TBD"}</p>
      <p className="text-muted">Nozzle {payload.print.nozzleMm ?? "—"} mm · Layer {payload.print.layerHeightMm ?? "—"} mm</p>
      <p className="text-muted">Estimate {payload.print.estimatedGrams ?? "—"} g · {payload.print.estimatedTimeMinutes ?? "—"} min</p>
      {payload.print.notes && <p style={{ whiteSpace: "pre-line" }}>{payload.print.notes}</p>}
    </div>
  );
}
