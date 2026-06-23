import { Link } from "react-router-dom";
import { OwnerRoute } from "../components/auth/OwnerRoute";
import { OwnerGeneratorIntakeTab } from "../components/owner/OwnerGeneratorIntakeTab";
import { fetchRequests } from "../services/requestService";

async function reloadQueueForIntake() {
  await fetchRequests();
}

function OwnerIntakeContent() {
  return (
    <div className="container">
      <section className="section">
        <div className="dash-header">
          <div>
            <h1 className="section-title" style={{ marginBottom: 0 }}>Generator Intake</h1>
            <p className="text-sm text-muted">Owner-only wizard for importing Tokenforge Generator request JSON.</p>
          </div>
          <Link className="btn btn-secondary btn-sm" to="/owner">Back to owner dashboard</Link>
        </div>
        <OwnerGeneratorIntakeTab reload={reloadQueueForIntake} />
      </section>
    </div>
  );
}

export function OwnerIntakePage() {
  return (
    <OwnerRoute>
      <OwnerIntakeContent />
    </OwnerRoute>
  );
}
