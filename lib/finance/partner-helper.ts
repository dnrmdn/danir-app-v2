import { resolvePartnerAccess } from "@/lib/partner-access";
import type { PartnerFeatureKey } from "@/types/partner";

/**
 * Resolves the userId to use in finance queries based on the view context.
 *
 * - Personal view: returns the current user's ID
 * - Shared view: validates the connectionId, checks the user belongs to it,
 *   and returns the PARTNER's user ID so the user sees the partner's data.
 *
 * Returns `null` if the connection is invalid (caller should return 403).
 */
export async function resolveFinanceUserIds(
  userId: string,
  view: string | null,
  connectionId: string | null,
  feature: PartnerFeatureKey = "MONEY"
): Promise<{ userIds: string[]; connectionId: string | null } | null> {
  const resolved = await resolvePartnerAccess({
    userId,
    view,
    connectionId,
    feature,
  });

  if (!resolved || resolved.kind === "locked") {
    return null;
  }

  return {
    userIds: resolved.userIds,
    connectionId: resolved.connectionId,
  };
}

/**
 * Builds a Prisma `where` clause fragment for filtering by userId.
 *
 * Always returns a single userId — either the current user (personal)
 * or the partner (shared).
 */
export function buildUserWhereClause(
  userIds: string[],
  connectionId: string | null
): { userId: string } {
  void connectionId;
  return { userId: userIds[0] };
}
