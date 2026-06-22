// ─────────────────────────────────────────────
// Family / Trusted Requesters
// ─────────────────────────────────────────────

// TODO (implementation pass): Add email verification via Supabase magic link.
// Family members should confirm their email before being granted trusted status.

export interface FamilyGroup {
  id: string;
  name: string;              // e.g. "Household", "Close Friends"
  active: boolean;
  paymentRequiredOverride: boolean; // true = require payment even for family
  notes?: string;
}

export interface FamilyMember {
  id: string;
  familyGroupId: string;
  displayName: string;
  email: string;             // Used for lookup / magic-link auth
  active: boolean;
  emailVerified: boolean;    // TODO: enforce in implementation pass
  addedAt: string;           // ISO 8601
}

// ─────────────────────────────────────────────
// Mock Data — scaffold only
// ─────────────────────────────────────────────

export const MOCK_FAMILY_GROUPS: FamilyGroup[] = [
  {
    id: "fam-grp-001",
    name: "Household",
    active: true,
    paymentRequiredOverride: false,
  },
  {
    id: "fam-grp-002",
    name: "Trusted Friends",
    active: true,
    paymentRequiredOverride: false,
    notes: "Close friends — quotes reviewed but payment typically waived.",
  },
];

export const MOCK_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: "fam-001",
    familyGroupId: "fam-grp-001",
    displayName: "Alex",
    email: "alex@example.invalid",
    active: true,
    emailVerified: false,
    addedAt: "2024-10-01T00:00:00Z",
  },
  {
    id: "fam-002",
    familyGroupId: "fam-grp-002",
    displayName: "Jordan",
    email: "jordan@example.invalid",
    active: true,
    emailVerified: false,
    addedAt: "2025-01-15T00:00:00Z",
  },
];
