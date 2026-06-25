import { useEffect, useState } from "react";
import { OwnerFamilyTab } from "../components/owner/OwnerFamilyTab";
import { OwnerMaterialsTab } from "../components/owner/OwnerMaterialsTab";
import { OwnerQueueTab } from "../components/owner/OwnerQueueTab";
import { OwnerQuotesTab } from "../components/owner/OwnerQuotesTab";
import { fetchFamilyGroups, fetchFamilyMembers } from "../services/familyService";
import { fetchMaterialColors, fetchMaterials } from "../services/materialService";
import { signOutOwner } from "../services/ownerService";
import { fetchRequests } from "../services/requestService";
import type { FamilyGroup, FamilyMember } from "../types/family";
import type { Material, MaterialColor } from "../types/materials";
import type { PrintRequest } from "../types/printRequest";
import "./OwnerDashboardPage.css";

type DashTab = "queue" | "materials" | "gallery" | "family" | "quotes" | "settings";

const PORTFOLIO_GALLERY_URL = "https://quantumpicklejar.github.io/Personal-Static/";

const TABS: { id: DashTab; label: string }[] = [
  { id: "queue", label: "Queue Requests" },
  { id: "materials", label: "Materials" },
  { id: "gallery", label: "Portfolio Gallery" },
  { id: "family", label: "Family / Trusted Requesters" },
  { id: "quotes", label: "Quotes / Payments" },
  { id: "settings", label: "Settings" },
];

export function OwnerDashboardPage({ initialTab = "queue" }: { initialTab?: DashTab }) {
  const [tab, setTab] = useState<DashTab>(initialTab);
  const [requests, setRequests] = useState<PrintRequest[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [colors, setColors] = useState<MaterialColor[]>([]);
  const [groups, setGroups] = useState<FamilyGroup[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const [requestRows, materialRows, colorRows, groupRows, memberRows] = await Promise.all([
      fetchRequests(),
      fetchMaterials(),
      fetchMaterialColors(),
      fetchFamilyGroups(),
      fetchFamilyMembers(),
    ]);
    setError(null);
    setRequests(requestRows);
    setMaterials(materialRows);
    setColors(colorRows);
    setGroups(groupRows);
    setMembers(memberRows);
  }

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve()
      .then(() => reload())
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Dashboard data could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container">
      <section className="section">
        <div className="dash-header">
          <h1 className="section-title" style={{ marginBottom: 0 }}>Owner Dashboard</h1>
          <button className="btn btn-ghost btn-sm" onClick={() => signOutOwner()}>Sign out</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}><span>⚠️</span><span>{error}</span></div>}
        {loading && <p className="text-muted">Loading owner data…</p>}

        <div className="tabs" role="tablist" aria-label="Dashboard sections">
          {TABS.map((t) => (
            <button key={t.id} role="tab" className={`tab-btn ${tab === t.id ? "active" : ""}`} aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="tab-panel" role="tabpanel">
          {tab === "queue" && <OwnerQueueTab requests={requests} reload={reload} />}
          {tab === "materials" && <OwnerMaterialsTab materials={materials} colors={colors} reload={reload} />}
          {tab === "gallery" && <PortfolioGalleryTab />}
          {tab === "family" && <OwnerFamilyTab groups={groups} members={members} reload={reload} />}
          {tab === "quotes" && <OwnerQuotesTab requests={requests} reload={reload} />}
          {tab === "settings" && <SettingsTab />}
        </div>
      </section>
    </div>
  );
}

function PortfolioGalleryTab() {
  return (
    <div className="alert alert-info">
      <span>↗️</span>
      <span>
        Successful print photos should live in the portfolio instead of being duplicated here. Open the Personal-Static portfolio gallery to add or review public-facing work: {" "}
        <a href={PORTFOLIO_GALLERY_URL} target="_blank" rel="noopener noreferrer">Open portfolio</a>.
      </span>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="alert alert-info">
      <span>ℹ️</span>
      <span>Notifications are recorded in notification_logs. Email-provider delivery remains an Edge Function integration task.</span>
    </div>
  );
}
