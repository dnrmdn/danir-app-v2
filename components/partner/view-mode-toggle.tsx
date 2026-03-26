"use client";

import { User, Users } from "lucide-react";
import { usePartnerStore } from "@/lib/store/partner-store";
import type { PartnerFeatureKey } from "@/types/partner";
import { usePlanAccess } from "@/hooks/usePlanAccess";

interface ViewModeToggleProps {
  feature: PartnerFeatureKey;
  locale?: "id" | "en";
}

const labels = {
  id: { personal: "Personal", shared: "Bersama" },
  en: { personal: "Personal", shared: "Shared" },
};

export function ViewModeToggle({ feature, locale = "id" }: ViewModeToggleProps) {
  const { viewMode, setViewMode, isFeatureShared } = usePartnerStore();
  const { plan } = usePlanAccess();

  const isShared = isFeatureShared(feature);

  // Don't render the toggle if this feature isn't shared
  if (!isShared || !plan?.hasSharedFeatures) return null;

  const t = labels[locale];

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 p-1 dark:border-white/10 dark:bg-white/5">
      <ToggleButton
        active={viewMode === "personal"}
        onClick={() => setViewMode("personal")}
        icon={<User className="h-3.5 w-3.5" />}
        label={t.personal}
      />
      <ToggleButton
        active={viewMode === "shared"}
        onClick={() => setViewMode("shared")}
        icon={<Users className="h-3.5 w-3.5" />}
        label={t.shared}
      />
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
        active
          ? "bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-700 shadow-sm dark:from-cyan-400/15 dark:to-emerald-400/15 dark:text-cyan-200"
          : "text-muted-foreground hover:bg-muted dark:text-slate-400 dark:hover:bg-white/5"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
