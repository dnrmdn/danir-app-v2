"use client";

import { Sparkles, Clock, Zap, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePlanAccess } from "@/hooks/usePlanAccess";

/**
 * PlanStatusBadge
 *
 * Displays the user's current plan in a pill below the greeting trigger.
 * Uses the existing usePlanAccess hook — no new API needed.
 *
 * States:
 *   FREE      → "Free Plan" + subtle Upgrade link
 *   PRO_TRIAL → "Pro Trial · N days left" + subtle Upgrade link
 *   PRO       → "Danir Pro" (no CTA)
 */
export function PlanStatusBadge() {
  const { plan, loading } = usePlanAccess();

  // While loading, render a ghost placeholder that holds layout space
  if (loading || !plan) {
    return (
      <div
        aria-hidden
        className="h-6 w-28 animate-pulse rounded-full bg-muted/60 dark:bg-white/[0.06]"
      />
    );
  }

  /* ── Pro ───────────────────────────────────────────────────────── */
  if (plan.isPaidPro) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/60 bg-gradient-to-r from-cyan-400/15 to-emerald-400/10 px-3 py-1 shadow-sm shadow-cyan-500/10 dark:border-cyan-400/25 dark:from-cyan-400/20 dark:to-emerald-400/15">
        <Sparkles className="h-3 w-3 text-cyan-500 dark:text-cyan-400" />
        <span className="text-[11px] font-semibold tracking-wide text-cyan-700 dark:text-cyan-300">
          Danir Pro
        </span>
      </div>
    );
  }

  /* ── Pro Trial ─────────────────────────────────────────────────── */
  if (plan.isTrialActive) {
    const days = plan.trialDaysRemaining;
    return (
      <div className="inline-flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/50 bg-amber-50/80 px-3 py-1 dark:border-amber-400/20 dark:bg-amber-400/10">
          <Clock className="h-3 w-3 text-amber-500 dark:text-amber-400" />
          <span className="text-[11px] font-semibold tracking-wide text-amber-700 dark:text-amber-300">
            Pro Trial
            {days > 0 && (
              <span className="ml-1 font-normal opacity-80">
                · {days} day{days !== 1 ? "s" : ""} left
              </span>
            )}
          </span>
        </div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
        >
          Upgrade
          <ArrowUpRight className="h-2.5 w-2.5" />
        </Link>
      </div>
    );
  }

  /* ── Free (expired trial or always-free) ───────────────────────── */
  return (
    <div className="inline-flex items-center gap-2">
      <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 dark:border-white/10 dark:bg-white/[0.05]">
        <Zap className="h-3 w-3 text-muted-foreground dark:text-slate-500" />
        <span className="text-[11px] font-semibold tracking-wide text-muted-foreground dark:text-slate-400">
          Free Plan
        </span>
      </div>
      <Link
        href="/settings"
        className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
      >
        Upgrade
        <ArrowUpRight className="h-2.5 w-2.5" />
      </Link>
    </div>
  );
}
