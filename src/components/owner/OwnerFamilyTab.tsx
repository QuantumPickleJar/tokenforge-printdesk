import type { FormEvent } from "react";
import { setFamilyMemberActive, upsertFamilyGroup, upsertFamilyMember } from "../../services/familyService";
import type { FamilyGroup, FamilyMember } from "../../types/family";

export function OwnerFamilyTab({ groups, members, reload }: { groups: FamilyGroup[]; members: FamilyMember[]; reload: () => Promise<void> }) {
  async function createGroup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await upsertFamilyGroup({ name: String(form.get("name")), active: true, notes: String(form.get("notes") || "") });
    e.currentTarget.reset();
    await reload();
  }

  async function createMember(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await upsertFamilyMember({
      groupId: String(form.get("groupId") || ""),
      name: String(form.get("name")),
      email: String(form.get("email")),
      active: true,
      notes: String(form.get("notes") || ""),
      paymentRequiredOverride: form.get("paymentRequired") === "on",
    });
    e.currentTarget.reset();
    await reload();
  }

  return (
    <div className="grid-2">
      <div className="card">
        <h2 className="card-title">Family / Trusted Groups</h2>
        <p className="text-sm text-muted">Trusted requesters are still owner-reviewed. Email-only matching is v0.1 convenience, not final identity proof.</p>
        <form onSubmit={createGroup} className="request-form">
          <input name="name" className="form-input" placeholder="Group name" required />
          <input name="notes" className="form-input" placeholder="Notes" />
          <button className="btn btn-primary">Add group</button>
        </form>
        <ul>{groups.map((g) => <li key={g.id}>{g.name} {g.active ? "" : "(inactive)"}</li>)}</ul>
      </div>

      <div className="card">
        <h2 className="card-title">Members</h2>
        <form onSubmit={createMember} className="request-form">
          <select name="groupId" className="form-select"><option value="">No group</option>{groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
          <input name="name" className="form-input" placeholder="Name" required />
          <input name="email" className="form-input" type="email" placeholder="Email" required />
          <input name="notes" className="form-input" placeholder="Notes" />
          <label className="form-checkbox-group"><input name="paymentRequired" type="checkbox" /><span>Require payment override</span></label>
          <button className="btn btn-primary">Add member</button>
        </form>
        <ul>{members.map((m) => <li key={m.id}>{m.name} — {m.email} <span className="badge badge-muted">{m.verificationStatus}</span> <button className="btn btn-ghost btn-sm" onClick={() => setFamilyMemberActive(m.id, !m.active).then(reload)}>{m.active ? "Disable" : "Enable"}</button></li>)}</ul>
      </div>
    </div>
  );
}
