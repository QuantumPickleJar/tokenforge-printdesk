import { useState } from "react";
import { PaymentBadge, StatusBadge } from "../common/StatusBadge";
import { bulkUpdateRequestStatus, updateRequestStatus } from "../../services/requestService";
import { getSignedStlUrl } from "../../services/storageService";
import type { PrintRequest, RequestStatus } from "../../types/printRequest";

const STATUS_FILTERS = [
  "all",
  "submitted",
  "reviewing",
  "needs_more_info",
  "accepted",
  "accepted_for_quote",
  "quoted",
  "payment_pending",
  "paid",
  "printing",
  "ready_for_pickup",
  "completed",
  "declined",
  "archived",
  "family",
  "public_quote",
];

const STATUS_ACTIONS: RequestStatus[] = [
  "reviewing",
  "accepted",
  "accepted_for_quote",
  "needs_more_info",
  "declined",
  "archived",
  "printing",
  "ready_for_pickup",
  "completed",
];

export function OwnerQueueTab({ requests, reload }: { requests: PrintRequest[]; reload: () => Promise<void> }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("all");

  const filtered = requests.filter((req) => {
    if (filter === "all") return true;
    if (filter === "family") return req.requestType === "family_free";
    if (filter === "public_quote") return req.requestType === "public_quote";
    return req.status === filter;
  });

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
      <div className="bulk-actions">
        <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ maxWidth: 220 }}>
          {STATUS_FILTERS.map((f) => <option key={f} value={f}>{f.replaceAll("_", " ")}</option>)}
        </select>
        <span className="text-sm text-muted">{selected.size ? `${selected.size} selected` : "Oldest received first"}</span>
        <div className="bulk-actions__btns">
          {STATUS_ACTIONS.slice(0, 6).map((status) => (
            <button key={status} className="btn btn-secondary btn-sm" disabled={!selected.size} onClick={() => runBulk(status)}>{status.replaceAll("_", " ")}</button>
          ))}
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th></th><th>Received</th><th>Title</th><th>Requester</th><th>Type</th><th>Status</th><th>Material</th><th>Model</th><th>Adv.</th><th>Est.</th><th>Price</th><th>Payment</th><th>Reply?</th><th>Action</th></tr></thead>
          <tbody>{filtered.map((req) => <QueueRow key={req.id} req={req} selected={selected.has(req.id)} toggle={toggle} reload={reload} />)}</tbody>
        </table>
      </div>
    </div>
  );
}

function QueueRow({ req, selected, toggle, reload }: { req: PrintRequest; selected: boolean; toggle: (id: string) => void; reload: () => Promise<void> }) {
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

  return (
    <tr className={selected ? "row-selected" : ""}>
      <td><input type="checkbox" checked={selected} onChange={() => toggle(req.id)} aria-label={`Select ${req.title}`} /></td>
      <td className="text-xs text-muted" style={{ whiteSpace: "nowrap" }}>{new Date(req.receivedAt).toLocaleDateString()}</td>
      <td style={{ maxWidth: 220 }}><details><summary className="queue-title">{req.title}</summary><p className="text-sm text-muted">{req.description}</p>{req.shippingRequested && <p className="text-xs">Shipping requested: {req.shippingNotes ?? "details not provided"}</p>}</details></td>
      <td className="text-sm">{req.requesterName}<br /><span className="text-xs text-muted">{req.requesterEmail}</span></td>
      <td><span className="badge badge-muted text-xs">{req.requestType === "family_free" ? "Family" : "Public"}</span></td>
      <td><StatusBadge status={req.status} /></td>
      <td className="text-sm text-muted">{req.materialLabel ?? "—"}</td>
      <td className="text-xs">{req.modelAttached ? <button className="btn btn-ghost btn-sm" onClick={openModel}>Open</button> : "—"}</td>
      <td className="text-xs">{req.advancedMode ? "✅" : "—"}</td>
      <td className="text-xs text-muted font-mono">{req.roughMaterialEstimate != null ? `$${req.roughMaterialEstimate.toFixed(2)}` : "—"}</td>
      <td className="text-xs font-mono">{req.ownerFinalPrice != null ? `$${req.ownerFinalPrice.toFixed(2)}` : "—"}</td>
      <td><PaymentBadge status={req.paymentStatus} /></td>
      <td className="text-xs">{req.replyRequested ? "✅" : "—"}</td>
      <td><select className="form-select" value={req.status} onChange={(e) => changeStatus(e.target.value as RequestStatus)}>{STATUS_ACTIONS.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></td>
    </tr>
  );
}
