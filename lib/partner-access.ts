import prisma from "@/lib/db";
import { createPlanLimitResponse, getPlanAccessForUserId, type PlanAccess, type AppPlanType } from "@/lib/plan";
import type { PartnerFeatureKey } from "@/types/partner";

type ResolvePartnerAccessParams = {
  userId: string;
  view: string | null;
  connectionId: string | null;
  feature: PartnerFeatureKey;
};

type PersonalPartnerAccess = {
  kind: "personal";
  userIds: [string];
  connectionId: null;
  access: PlanAccess;
};

type SharedPartnerAccess = {
  kind: "shared";
  userIds: [string];
  connectionId: string;
  access: PlanAccess;
  partnerUserId: string;
};

type LockedPartnerAccess = {
  kind: "locked";
  status: 403;
  payload: ReturnType<typeof createPlanLimitResponse>;
};

export type ResolvedPartnerAccess = PersonalPartnerAccess | SharedPartnerAccess | LockedPartnerAccess | null;

function getSharedFeatureName(feature: PartnerFeatureKey) {
  switch (feature) {
    case "MONEY":
      return "shared money";
    case "MEAL":
      return "shared meal planning";
    case "LINKS":
      return "shared saved links";
    case "TASKS":
      return "shared tasks";
    default:
      return "shared features";
  }
}

function getPlanLabel(planType: AppPlanType) {
  if (planType === "PRO") return "Pro";
  if (planType === "PRO_TRIAL") return "Pro Trial";
  return "Free";
}

function createSharedPlanLockedResponse(access: PlanAccess) {
  return createPlanLimitResponse(
    `${getPlanLabel(access.planType)} accounts cannot use shared features. Upgrade to Pro to unlock partner sharing.`,
    access,
    { feature: "shared" }
  );
}

function createFeatureToggleLockedResponse(access: PlanAccess, feature: PartnerFeatureKey) {
  return createPlanLimitResponse(
    `${getPlanLabel(access.planType)} accounts cannot use ${getSharedFeatureName(feature)}. Upgrade to Pro to unlock it.`,
    access,
    { feature }
  );
}

export async function resolvePartnerAccess({
  userId,
  view,
  connectionId,
  feature,
}: ResolvePartnerAccessParams): Promise<ResolvedPartnerAccess> {
  const access = await getPlanAccessForUserId(userId);
  if (!access) {
    return null;
  }

  if (view !== "shared" || !connectionId) {
    return {
      kind: "personal",
      userIds: [userId],
      connectionId: null,
      access,
    };
  }

  const connection = await prisma.partnerConnection.findFirst({
    where: {
      id: connectionId,
      status: "ACCEPTED",
      OR: [{ userAId: userId }, { userBId: userId }],
    },
  });

  if (!connection) {
    return null;
  }

  const partnerUserId = connection.userAId === userId ? connection.userBId : connection.userAId;
  const partnerAccess = await getPlanAccessForUserId(partnerUserId);

  if (!partnerAccess || !access.hasSharedFeatures || !partnerAccess.hasSharedFeatures) {
    return {
      kind: "locked",
      status: 403,
      payload: createSharedPlanLockedResponse(access),
    };
  }

  const enabledEntries = await prisma.partnerFeatureAccess.findMany({
    where: {
      connectionId: connection.id,
      feature,
      isEnabled: true,
    },
    select: { userId: true },
  });

  if (enabledEntries.length < 2) {
    return {
      kind: "locked",
      status: 403,
      payload: createPlanLimitResponse(
        `This ${getSharedFeatureName(feature)} flow is not active yet. Both partners need to enable it first.`,
        access,
        { feature }
      ),
    };
  }

  return {
    kind: "shared",
    userIds: [partnerUserId],
    connectionId: connection.id,
    access,
    partnerUserId,
  };
}

export async function requireSharedFeaturePlan(userId: string, feature: PartnerFeatureKey) {
  const access = await getPlanAccessForUserId(userId);
  if (!access) {
    return null;
  }

  if (access.hasSharedFeatures) {
    return { access };
  }

  return {
    status: 403 as const,
    payload: createFeatureToggleLockedResponse(access, feature),
  };
}

export async function requireSharedPlanAccess(userId: string) {
  const access = await getPlanAccessForUserId(userId);
  if (!access) {
    return null;
  }

  if (access.hasSharedFeatures) {
    return { access };
  }

  return {
    status: 403 as const,
    payload: createSharedPlanLockedResponse(access),
  };
}
