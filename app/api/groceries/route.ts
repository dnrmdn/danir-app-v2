import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Session } from "better-auth";
import { NextRequest, NextResponse } from "next/server";
import { resolveFinanceUserIds } from "@/lib/finance/partner-helper";

/**
 * GET /api/groceries — Fetch all grocery categories + items for the user (or partner)
 */
export async function GET(req: NextRequest) {
  try {
    const sessionResponse = await auth.api.getSession({ headers: req.headers });
    const session = sessionResponse?.session as Session | null;
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const view = req.nextUrl.searchParams.get("view");
    const connectionId = req.nextUrl.searchParams.get("connectionId");
    const resolved = await resolveFinanceUserIds(session.userId, view, connectionId);
    if (!resolved) return NextResponse.json({ success: false, error: "Invalid connection" }, { status: 403 });

    const targetUserId = resolved.userIds[0];

    const categories = await prisma.groceryCategory.findMany({
      where: { userId: targetUserId },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("GET groceries error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/groceries — Bulk save (replace all categories + items)
 * Body: { categories: [...], view?, connectionId? }
 */
export async function POST(req: NextRequest) {
  try {
    const sessionResponse = await auth.api.getSession({ headers: req.headers });
    const session = sessionResponse?.session as Session | null;
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const view = body.view || null;
    const connectionIdParam = body.connectionId || null;
    const resolved = await resolveFinanceUserIds(session.userId, view, connectionIdParam);
    if (!resolved) return NextResponse.json({ success: false, error: "Invalid connection" }, { status: 403 });

    const targetUserId = resolved.userIds[0];
    const incoming: Array<{ name: string; items: Array<{ name: string; checked: boolean }> }> = body.categories || [];

    await prisma.$transaction(async (tx) => {
      // Delete all existing categories (cascade deletes items)
      await tx.groceryCategory.deleteMany({ where: { userId: targetUserId } });

      // Create new categories with items
      for (let i = 0; i < incoming.length; i++) {
        const cat = incoming[i];
        await tx.groceryCategory.create({
          data: {
            userId: targetUserId,
            name: cat.name,
            sortOrder: i,
            items: {
              create: (cat.items || []).map((item, j) => ({
                name: item.name,
                checked: item.checked ?? false,
                sortOrder: j,
              })),
            },
          },
        });
      }
    });

    // Return fresh data
    const categories = await prisma.groceryCategory.findMany({
      where: { userId: targetUserId },
      include: { items: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("POST groceries error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
