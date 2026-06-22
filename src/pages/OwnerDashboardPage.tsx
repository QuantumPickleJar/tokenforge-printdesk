import { useState } from "react";
import { StatusBadge, PaymentBadge } from "../components/common/StatusBadge";
import type { MockRequestRow } from "../types/printRequest";
import "./OwnerDashboardPage.css";

// TODO (implementation pass):
//   - This route MUST be protected by Supabase Auth.
//   - Verify owner session before rendering ANY data.
//   - Use RLS policies to ensure only the owner can query sensitive tables.
//   - Remove mock data and replace with real Supabase queries.
//   - Add real bulk-action API calls with optimistic UI.

const MOCK_REQUESTS: MockRequestRow[] = [
  {
    id: "req-001",
    createdAt: "2025-05-01T09:12:00Z",
    updatedAt: "2025-05-01T09:12:00Z",
    status: "submitted",
    requestType: "public_quote",
    paymentStatus: "not_started",
    requesterName: "Sam Rivera",
    requesterEmail: "sam@example.invalid",
    title: "Articulated Dragon — 15 cm",
    description: "Print-in-place, no supports needed.",
    materialId: "mat-001",
    color: "Dragon Red",
    replyRequested: true,
    licensingConfirmed: true,
    personalDesign: false,
    shippingRequested: false,
    modelAttached: true,
    advancedMode: false,
    roughMaterialEstimate: 3.50,
    familyBadge: false,
  },
  {
    id: "req-002",
    createdAt: "2025-05-02T14:30:00Z",
    updatedAt: "2025-05-03T10:00:00Z",
    status: "reviewing",
    requestType: "family_free",
    paymentStatus: "not_required",
    requesterName: "Alex (Family)",
    requesterEmail: "alex@example.invalid",
    title: "Raspberry Pi 5 Case",
    description: "Custom snap-fit lid with vent slots.",
    materialId: "mat-003",
    color: "Translucent Blue",
    replyRequested: false,
    licensingConfirmed: true,
    personalDesign: true,
    shippingRequested: false,
    modelAttached: true,
    advancedMode: true,
    advancedSettings: {
      layerHeight: 0.16,
      infillType: "gyroid",
      infillPercent: 20,
      wallCount: 4,
    },
    roughMaterialEstimate: 4.20,
    familyBadge: true,
  },
  {
    id: "req-003",
    createdAt: "2025-05-04T08:00:00Z",
    updatedAt: "2025-05-05T12:00:00Z",
    status: "quoted",
    requestType: "public_quote",
    paymentStatus: "pending",
    requesterName: "Jordan Kim",
    requesterEmail: "jordan@example.invalid",
    title: "Cable Clip Set ×12",
    description: "Standard 4 mm cable clips for desk management.",
    materialId: "mat-001",
    color: "Matte Black",
    replyRequested: false,
    licensingConfirmed: true,
    personalDesign: false,
    shippingRequested: true,
    modelAttached: false,
    advancedMode: false,
    roughMaterialEstimate: 1.80,
    ownerFinalPrice: 8.00,
    familyBadge: false,
  },
  {
    id: "req-004",
    createdAt: "2025-05-06T16:45:00Z",
    updatedAt: "2025-05-06T16:45:00Z",
    status: "needs_more_info",
    requestType: "public_quote",
    paymentStatus: "not_started",
    requesterName: "Casey Nguyen",
    requesterEmail: "casey@example.invalid",
    title: "Custom bracket (unclear dimensions)",
    description: "Need a bracket for my setup.",
    replyRequested: true,
    licensingConfirmed: false,
    personalDesign: false,
    shippingRequested: false,
    modelAttached: false,
    advancedMode: false,
    familyBadge: false,
  },
];

type DashTab =
  | "queue"
  | "requests"
  | "materials"
  | "gallery"
  | "family"
  | "quotes"
  | "settings";

const TABS: { id: DashTab; label: string }[] = [
  { id: "queue",     label: "Queue" },
  { id: "requests",  label: "Requests" },
  { id: "materials", label: "Materials" },
  { id: "gallery",   label: "Gallery" },
  { id: "family",    label: "Family / Trusted" },
  { id: "quotes",    label: "Quotes / Payments" },
  { id: "settings",  label: "Settings" },
];

export function OwnerDashboardPage() {
  const [tab, setTab] = useState<DashTab>("queue");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === MOCK_REQUESTS.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(MOCK_REQUESTS.map((r) => r.id)));
    }
  }

  return (
    <div className="container">
      <section className="section">
        {/* Auth warning */}
        <div className="scaffold-banner">
          🏗️ <strong>Scaffold only — not auth-protected.</strong> In the
          implementation pass, this route must verify the owner Supabase session
          before rendering any data. Mock data is shown below.
        </div>

        <div className="dash-header">
          <h1 className="section-title" style={{ marginBottom: 0 }}>Owner Dashboard</h1>
          <span className="badge badge-warning">Dev / Scaffold Mode</span>
        </div>

        {/* Tabs */}
        <div className="tabs" role="tablist" aria-label="Dashboard sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              className={`tab-btn ${tab === t.id ? "active" : ""}`}
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="tab-panel" role="tabpanel">
          {tab === "queue" && <QueueTab requests={MOCK_REQUESTS} selected={selected} toggleSelect={toggleSelect} toggleSelectAll={toggleSelectAll} />}
          {tab === "requests" && <PlaceholderTab title="Requests" note="Full request list with filters. Connects to Supabase in implementation pass." />}
          {tab === "materials" && <PlaceholderTab title="Materials" note="Add, edit, and stock materials. Connects to Supabase in implementation pass." />}
          {tab === "gallery" && <PlaceholderTab title="Gallery" note="Publish/unpublish completed prints. Connects to Supabase in implementation pass." />}
          {tab === "family" && <FamilyTab />}
          {tab === "quotes" && <PlaceholderTab title="Quotes / Payments" note="View all quotes, payment status, and paste payment URLs. Connects to Supabase in implementation pass." />}
          {tab === "settings" && <PlaceholderTab title="Settings" note="App-wide settings, notification preferences, owner profile. Implementation deferred." />}
        </div>
      </section>
    </div>
  );
}

// ── Queue Tab ──────────────────────────────────────────────────────────────

interface QueueTabProps {
  requests: MockRequestRow[];
  selected: Set<string>;
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
}

function QueueTab({ requests, selected, toggleSelect, toggleSelectAll }: QueueTabProps) {
  const allSelected = selected.size === requests.length && requests.length > 0;

  return (
    <div className="queue-tab">
      {/* Bulk actions */}
      <div className="bulk-actions">
        <span className="text-sm text-muted">
          {selected.size > 0 ? `${selected.size} selected` : "Select rows to bulk-act"}
        </span>
        <div className="bulk-actions__btns">
          <button className="btn btn-secondary btn-sm" disabled title="Mark reviewing (scaffold — disabled)">Mark reviewing</button>
          <button className="btn btn-secondary btn-sm" disabled title="Accept selected (scaffold — disabled)">Accept selected</button>
          <button className="btn btn-secondary btn-sm" disabled title="Accept for quote (scaffold — disabled)">Accept for quote</button>
          <button className="btn btn-secondary btn-sm" disabled title="Request more info (scaffold — disabled)">Request more info</button>
          <button className="btn btn-danger btn-sm" disabled title="Decline (scaffold — disabled)">Decline</button>
          <button className="btn btn-ghost btn-sm" disabled title="Archive (scaffold — disabled)">Archive</button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Received</th>
              <th>Title</th>
              <th>Requester</th>
              <th>Type</th>
              <th>Status</th>
              <th>Material</th>
              <th>Model</th>
              <th>Adv.</th>
              <th>Est.</th>
              <th>Price</th>
              <th>Payment</th>
              <th>Reply?</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className={selected.has(req.id) ? "row-selected" : ""}>
                <td>
                  <input
                    type="checkbox"
                    aria-label={`Select ${req.title}`}
                    checked={selected.has(req.id)}
                    onChange={() => toggleSelect(req.id)}
                  />
                </td>
                <td className="text-xs text-muted" style={{ whiteSpace: "nowrap" }}>
                  {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </td>
                <td style={{ maxWidth: "160px" }}>
                  <span className="queue-title">{req.title}</span>
                </td>
                <td className="text-sm">
                  {req.requesterName}
                  {req.familyBadge && (
                    <span className="badge badge-accent" style={{ marginLeft: "0.4rem", fontSize: "0.65rem" }}>Family</span>
                  )}
                </td>
                <td>
                  <span className="badge badge-muted text-xs">
                    {req.requestType === "public_quote" ? "Public" : req.requestType === "family_free" ? "Family" : "Internal"}
                  </span>
                </td>
                <td><StatusBadge status={req.status} /></td>
                <td className="text-sm text-muted">{req.color ?? "—"}</td>
                <td className="text-xs">{req.modelAttached ? "✅" : "—"}</td>
                <td className="text-xs">{req.advancedMode ? "✅" : "—"}</td>
                <td className="text-xs text-muted font-mono">
                  {req.roughMaterialEstimate != null ? `$${req.roughMaterialEstimate.toFixed(2)}` : "—"}
                </td>
                <td className="text-xs font-mono">
                  {req.ownerFinalPrice != null ? `$${req.ownerFinalPrice.toFixed(2)}` : "—"}
                </td>
                <td><PaymentBadge status={req.paymentStatus} /></td>
                <td className="text-xs">{req.replyRequested ? "✅" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Family Tab ──────────────────────────────────────────────────────────────

function FamilyTab() {
  return (
    <div className="placeholder-tab">
      <h2 className="section-title" style={{ fontSize: "1.1rem" }}>Family / Trusted Requesters</h2>
      <p className="text-muted text-sm" style={{ marginBottom: "1.5rem" }}>
        Family / trusted requesters default to <strong>no payment required</strong>.
        Public requesters go through the standard quote/payment workflow.
        The owner can override payment behavior per request.
      </p>

      <div className="alert alert-info" style={{ marginBottom: "1.5rem" }}>
        <span>ℹ️</span>
        <span>
          Email verification for family members is deferred to the implementation
          pass. Types and mock data exist in <code>src/types/family.ts</code>.
        </span>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Household</span>
            <span className="badge badge-success">Active</span>
          </div>
          <p className="text-sm text-muted">Payment required: No</p>
          <ul style={{ listStyle: "none", marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li className="text-sm flex items-center gap-sm">
              <span className="badge badge-success">Active</span>
              Alex — alex@example.invalid
            </li>
          </ul>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Trusted Friends</span>
            <span className="badge badge-success">Active</span>
          </div>
          <p className="text-sm text-muted">Payment required: No</p>
          <ul style={{ listStyle: "none", marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li className="text-sm flex items-center gap-sm">
              <span className="badge badge-success">Active</span>
              Jordan — jordan@example.invalid
            </li>
          </ul>
        </div>
      </div>

      <button className="btn btn-secondary" style={{ marginTop: "1.5rem" }} disabled>
        + Add family member (scaffold — disabled)
      </button>
    </div>
  );
}

// ── Generic Placeholder Tab ────────────────────────────────────────────────

function PlaceholderTab({ title, note }: { title: string; note: string }) {
  return (
    <div className="placeholder-tab">
      <h2 className="section-title" style={{ fontSize: "1.1rem" }}>{title}</h2>
      <div className="alert alert-info">
        <span>🏗️</span>
        <span>{note}</span>
      </div>
    </div>
  );
}
