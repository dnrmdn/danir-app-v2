import prisma from "@/lib/db";

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
  connectionId: string | null
): Promise<{ userIds: string[]; connectionId: string | null } | null> {
  if (view === "shared" && connectionId) {
    const conn = await prisma.partnerConnection.findFirst({
      where: {
        id: connectionId,
        status: "ACCEPTED",
        OR: [
          { userAId: userId },
          { userBId: userId },
        ],
      },
    });

    if (!conn) return null;

    // Return ONLY the partner's userId — the user sees the partner's data
    const partnerId = conn.userAId === userId ? conn.userBId : conn.userAId;
    return {
      userIds: [partnerId],
      connectionId: conn.id,
    };
  }

  // Personal view (default)
  return { userIds: [userId], connectionId: null };
}

/**
 * Builds a Prisma `where` clause fragment for filtering by userId.
 *
 * Always returns a single userId — either the current user (personal)
 * or the partner (shared).
 */
export function buildUserWhereClause(
  userIds: string[],
  _connectionId: string | null
): { userId: string } {
  return { userId: userIds[0] };
}

