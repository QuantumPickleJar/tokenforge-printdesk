export interface FamilyGroup {
  id: string;
  name: string;
  active: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  groupId?: string | null;
  name: string;
  email: string;
  active: boolean;
  notes?: string | null;
  paymentRequiredOverride: boolean;
  verificationStatus: "unverified" | "pending" | "verified";
  verificationTodo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyGroupInput {
  name: string;
  active: boolean;
  notes?: string;
}

export interface FamilyMemberInput {
  groupId?: string;
  name: string;
  email: string;
  active: boolean;
  notes?: string;
  paymentRequiredOverride: boolean;
  verificationStatus?: FamilyMember["verificationStatus"];
}
