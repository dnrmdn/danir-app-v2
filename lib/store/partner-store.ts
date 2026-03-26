"use client";

import { create } from "zustand";
import type {
  PartnerConnection,
  PartnerFeatureAccess,
  PartnerFeatureKey,
  ViewMode,
} from "@/types/partner";

interface PartnerStore {
  // State
  connection: PartnerConnection | null;
  featureAccess: PartnerFeatureAccess[];
  isLoading: boolean;
  error: string | null;

  // View Mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Actions
  fetchConnection: () => Promise<void>;
  sendInvite: (email: string) => Promise<{ success: boolean; error?: string }>;
  acceptInvite: (connectionId: string) => Promise<{ success: boolean; error?: string }>;
  removeConnection: (connectionId: string) => Promise<{ success: boolean; error?: string }>;
  fetchFeatureAccess: () => Promise<void>;
  toggleFeature: (feature: PartnerFeatureKey, isEnabled: boolean) => Promise<void>;

  // Computed helpers
  isFeatureShared: (feature: PartnerFeatureKey) => boolean;
  getPartnerUser: (currentUserId: string) => PartnerConnection["userA"] | null;
  getActiveConnectionId: () => string | null;
}

export const usePartnerStore = create<PartnerStore>((set, get) => ({
  connection: null,
  featureAccess: [],
  isLoading: false,
  error: null,
  viewMode: "personal",

  setViewMode: (mode) => set({ viewMode: mode }),

  fetchConnection: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/partner/connection");
      const result = await res.json();
      if (result.success) {
        set({ connection: result.data, isLoading: false });
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      console.error("Failed to fetch partner connection:", error);
      set({ error: "Failed to fetch partner connection", isLoading: false });
    }
  },

  sendInvite: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/partner/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (result.success) {
        set({ connection: result.data, isLoading: false });
        return { success: true };
      } else {
        set({ error: result.error, isLoading: false });
        return { success: false, error: result.error };
      }
    } catch {
      set({ error: "Failed to send invite", isLoading: false });
      return { success: false, error: "Failed to send invite" };
    }
  },

  acceptInvite: async (connectionId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/partner/connection", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, action: "ACCEPT" }),
      });
      const result = await res.json();
      if (result.success) {
        set({ connection: result.data, isLoading: false });
        return { success: true };
      } else {
        set({ error: result.error, isLoading: false });
        return { success: false, error: result.error };
      }
    } catch {
      set({ error: "Failed to accept invite", isLoading: false });
      return { success: false, error: "Failed to accept invite" };
    }
  },

  removeConnection: async (connectionId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/partner/connection?connectionId=${connectionId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        set({ connection: null, featureAccess: [], viewMode: "personal", isLoading: false });
        return { success: true };
      } else {
        set({ error: result.error, isLoading: false });
        return { success: false, error: result.error };
      }
    } catch {
      set({ error: "Failed to remove connection", isLoading: false });
      return { success: false, error: "Failed to remove connection" };
    }
  },

  fetchFeatureAccess: async () => {
    try {
      const res = await fetch("/api/partner/features");
      const result = await res.json();
      if (result.success) {
        set({ featureAccess: result.data });
      }
    } catch (error) {
      console.error("Failed to fetch feature access:", error);
    }
  },

  toggleFeature: async (feature, isEnabled) => {
    try {
      const res = await fetch("/api/partner/features", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature, isEnabled }),
      });
      const result = await res.json();
      if (result.success) {
        // Refresh the list
        await get().fetchFeatureAccess();
      }
    } catch (error) {
      console.error("Failed to toggle feature:", error);
    }
  },

  // A feature is considered "shared" when BOTH users have enabled it
  isFeatureShared: (feature) => {
    const { connection, featureAccess } = get();
    if (!connection || connection.status !== "ACCEPTED") return false;

    const entries = featureAccess.filter((fa) => fa.feature === feature && fa.isEnabled);
    // Both users must have it enabled
    return entries.length >= 2;
  },

  getPartnerUser: (currentUserId) => {
    const { connection } = get();
    if (!connection) return null;
    return connection.userAId === currentUserId ? connection.userB : connection.userA;
  },

  getActiveConnectionId: () => {
    const { connection } = get();
    if (!connection || connection.status !== "ACCEPTED") return null;
    return connection.id;
  },
}));
