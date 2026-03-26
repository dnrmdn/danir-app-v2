import { auth } from "@/lib/auth";
import { getUserIdFromSession } from "@/lib/finance/session";
import { seedDefaultCategories } from "@/lib/finance/default-categories";
import { NextRequest, NextResponse } from "next/server";

/**
 * Force re-seed default categories for a user.
 * This deletes existing system categories and re-creates them.
 * User-created (non-system) categories are NOT affected.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = getUserIdFromSession(session);

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Force re-seed by passing force flag
    await seedDefaultCategories(userId, true);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("finance categories seed POST error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}