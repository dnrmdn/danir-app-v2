// =========================
// PARTNER SHARING TYPES
// =========================

export type PartnerFeatureKey = "TASKS" | "MONEY" | "MEAL" | "LINKS";

export type PartnerConnectionStatus = "PENDING" | "ACCEPTED";

export interface PartnerUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface PartnerConnection {
  id: string;
  userAId: string;
  userBId: string;
  status: PartnerConnectionStatus;
  createdAt: string;
  updatedAt: string;
  userA: PartnerUser;
  userB: PartnerUser;
}

export interface PartnerFeatureAccess {
  id: string;
  connectionId: string;
  userId: string;
  feature: PartnerFeatureKey;
  isEnabled: boolean;
}

export type ViewMode = "personal" | "shared";
