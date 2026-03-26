import prisma from "@/lib/db";

export const FREE_SAVED_LINK_LIMIT = 50;
export const FREE_MONEY_HISTORY_MONTHS = 6;
export const TRIAL_DURATION_DAYS = 30;
export const PLAN_LIMIT_ERROR_CODE = "PLAN_LIMIT_REQUIRES_PRO";

export type AppPlanType = "FREE" | "PRO_TRIAL" | "PRO";
export type AppSubscriptionStatus = "NONE" | "TRIALING" | "ACTIVE" | "EXPIRED" | "CANCELED";

type PersistedUserPlanRecord = {
  id: string;
  createdAt: Date;
  planType: AppPlanType | null;
  subscriptionStatus: AppSubscriptionStatus | null;
  trialStartAt: Date | null;
  trialEndAt: Date | null;
  proStartedAt: Date | null;
  subscriptionEndsAt: Date | null;
};

export type PlanAccess = {
  userId: string;
  planType: AppPlanType;
  subscriptionStatus: AppSubscriptionStatus;
  trialStartAt: Date;
  trialEndAt: Date | null;
  trialDaysRemaining: number;
  isTrialActive: boolean;
  isPaidPro: boolean;
  hasSharedFeatures: boolean;
  savedLinksLimit: number | null;
  moneyHistoryMonths: number | null;
  moneyHistoryStartAt: Date | null;
  proStartedAt: Date | null;
  subscriptionEndsAt: Date | null;
  label: "Free" | "Pro Trial" | "Pro";
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthsAgoStart(date: Date, monthsAgo: number) {
  return new Date(date.getFullYear(), date.getMonth() - monthsAgo, 1);
}

export function getFreeMoneyHistoryStart(referenceDate = new Date()) {
  return getMonthsAgoStart(referenceDate, FREE_MONEY_HISTORY_MONTHS - 1);
}

export function isMonthString(value: string) {
  return /^\d{4}-\d{2}$/.test(value);
}

export function isMonthBeforeDate(month: string, minDate: Date) {
  if (!isMonthString(month)) return false;
  const [year, monthIndex] = month.split("-").map(Number);
  const monthStart = new Date(year, monthIndex - 1, 1);
  return monthStart < startOfMonth(minDate);
}

export function isMoneyDateRangeRestricted(access: PlanAccess, start: Date | null, end: Date | null) {
  if (!access.moneyHistoryStartAt) return false;
  if (start && start < access.moneyHistoryStartAt) return true;
  if (!start && end && end < access.moneyHistoryStartAt) return true;
  return false;
}

function calculateTrialDaysRemaining(trialEndAt: Date | null, now: Date) {
  if (!trialEndAt || trialEndAt <= now) return 0;
  const today = startOfDay(now).getTime();
  const endDay = startOfDay(trialEndAt).getTime();
  return Math.max(0, Math.ceil((endDay - today) / (1000 * 60 * 60 * 24)));
}

function getPlanLabel(planType: AppPlanType): PlanAccess["label"] {
  if (planType === "PRO") return "Pro";
  if (planType === "PRO_TRIAL") return "Pro Trial";
  return "Free";
}

function resolvePlanAccess(user: PersistedUserPlanRecord, now = new Date()) {
  const trialStartAt = user.trialStartAt ?? user.createdAt;
  const trialEndAt = user.trialEndAt ?? addDays(trialStartAt, TRIAL_DURATION_DAYS);

  let planType: AppPlanType = user.planType ?? "PRO_TRIAL";
  let subscriptionStatus: AppSubscriptionStatus = user.subscriptionStatus ?? "TRIALING";
  let proStartedAt = user.proStartedAt;

  if (
    planType === "PRO" &&
    subscriptionStatus === "ACTIVE" &&
    user.subscriptionEndsAt &&
    user.subscriptionEndsAt <= now
  ) {
    planType = "FREE";
    subscriptionStatus = "EXPIRED";
  }

  if (planType === "PRO_TRIAL" && trialEndAt <= now) {
    planType = "FREE";
    if (subscriptionStatus === "TRIALING") {
      subscriptionStatus = "EXPIRED";
    }
  }

  if (planType === "PRO" && !proStartedAt) {
    proStartedAt = now;
  }

  const isTrialActive = planType === "PRO_TRIAL" && trialEndAt > now;
  const isPaidPro = planType === "PRO" && subscriptionStatus === "ACTIVE";
  const moneyHistoryStartAt = planType === "FREE" ? getFreeMoneyHistoryStart(now) : null;

  const access: PlanAccess = {
    userId: user.id,
    planType,
    subscriptionStatus,
    trialStartAt,
    trialEndAt,
    trialDaysRemaining: calculateTrialDaysRemaining(trialEndAt, now),
    isTrialActive,
    isPaidPro,
    hasSharedFeatures: planType !== "FREE",
    savedLinksLimit: planType === "FREE" ? FREE_SAVED_LINK_LIMIT : null,
    moneyHistoryMonths: planType === "FREE" ? FREE_MONEY_HISTORY_MONTHS : null,
    moneyHistoryStartAt,
    proStartedAt,
    subscriptionEndsAt: user.subscriptionEndsAt,
    label: getPlanLabel(planType),
  };

  return {
    access,
    needsSync:
      user.planType !== planType ||
      user.subscriptionStatus !== subscriptionStatus ||
      user.trialStartAt === null ||
      user.trialEndAt === null ||
      (planType === "PRO" && user.proStartedAt === null),
    syncData: {
      planType,
      subscriptionStatus,
      trialStartAt,
      trialEndAt,
      proStartedAt,
    },
  };
}

export async function getPlanAccessForUserId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      createdAt: true,
      planType: true,
      subscriptionStatus: true,
      trialStartAt: true,
      trialEndAt: true,
      proStartedAt: true,
      subscriptionEndsAt: true,
    },
  });

  if (!user) {
    return null;
  }

  const resolved = resolvePlanAccess(user);

  if (resolved.needsSync) {
    await prisma.user.update({
      where: { id: userId },
      data: resolved.syncData,
    });
  }

  return resolved.access;
}

export function toClientPlanSummary(access: PlanAccess) {
  return {
    planType: access.planType,
    subscriptionStatus: access.subscriptionStatus,
    label: access.label,
    trialStartAt: access.trialStartAt,
    trialEndAt: access.trialEndAt,
    trialDaysRemaining: access.trialDaysRemaining,
    isTrialActive: access.isTrialActive,
    isPaidPro: access.isPaidPro,
    hasSharedFeatures: access.hasSharedFeatures,
    savedLinksLimit: access.savedLinksLimit,
    moneyHistoryMonths: access.moneyHistoryMonths,
    moneyHistoryStartAt: access.moneyHistoryStartAt,
    canUpgrade: access.planType !== "PRO",
  };
}

export function createPlanLimitResponse(message: string, access: PlanAccess, extra: Record<string, unknown> = {}) {
  return {
    success: false,
    errorCode: PLAN_LIMIT_ERROR_CODE,
    error: message,
    plan: toClientPlanSummary(access),
    ...extra,
  };
}
