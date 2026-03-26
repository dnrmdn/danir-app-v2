import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { getUserIdFromSession } from "@/lib/finance/session";
import { FREE_SAVED_LINK_LIMIT, getPlanAccessForUserId, toClientPlanSummary } from "@/lib/plan";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = getUserIdFromSession(session);

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const access = await getPlanAccessForUserId(userId);

    if (!access) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const savedLinksCount = await prisma.savedLink.count({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...toClientPlanSummary(access),
        savedLinksCount,
        savedLinksRemaining:
          access.savedLinksLimit === null ? null : Math.max(0, access.savedLinksLimit - savedLinksCount),
        freeSavedLinksLimit: FREE_SAVED_LINK_LIMIT,
      },
    });
  } catch (error) {
    console.error("plan GET error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
