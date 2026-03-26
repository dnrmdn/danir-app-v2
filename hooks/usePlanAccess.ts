"use client";

import { useCallback, useEffect, useState } from "react";

export type ClientPlanAccess = {
  planType: "FREE" | "PRO_TRIAL" | "PRO";
  subscriptionStatus: "NONE" | "TRIALING" | "ACTIVE" | "EXPIRED" | "CANCELED";
  label: "Free" | "Pro Trial" | "Pro";
  trialStartAt: string | Date | null;
  trialEndAt: string | Date | null;
  trialDaysRemaining: number;
  isTrialActive: boolean;
  isPaidPro: boolean;
  hasSharedFeatures: boolean;
  savedLinksLimit: number | null;
  moneyHistoryMonths: number | null;
  moneyHistoryStartAt: string | Date | null;
  canUpgrade: boolean;
  savedLinksCount: number;
  savedLinksRemaining: number | null;
  freeSavedLinksLimit: number;
};

export function usePlanAccess() {
  const [plan, setPlan] = useState<ClientPlanAccess | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/user/plan", {
        cache: "no-store",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setPlan(null);
        return;
      }

      setPlan(json.data);
    } catch (error) {
      console.error("Failed to load plan access:", error);
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    plan,
    loading,
    reload,
  };
}
