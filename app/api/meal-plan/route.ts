import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Session } from "better-auth";
import { NextRequest, NextResponse } from "next/server";
import { startOfWeek, format, parseISO } from "date-fns";
import { resolvePartnerAccess } from "@/lib/partner-access";

function getWeekStartString(input?: string | null) {
  const base = input ? parseISO(input) : new Date();
  const weekStart = startOfWeek(base, { weekStartsOn: 1 });
  return format(weekStart, "yyyy-MM-dd");
}

export async function GET(req: NextRequest) {
  try {
    const sessionResponse = await auth.api.getSession({ headers: req.headers });
    const session = sessionResponse?.session as Session | null;

    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const view = req.nextUrl.searchParams.get("view");
    const connectionId = req.nextUrl.searchParams.get("connectionId");
    const resolved = await resolvePartnerAccess({
      userId: session.userId,
      view,
      connectionId,
      feature: "MEAL",
    });
    if (!resolved) return NextResponse.json({ success: false, error: "Invalid connection" }, { status: 403 });
    if (resolved.kind === "locked") {
      return NextResponse.json(resolved.payload, { status: resolved.status });
    }

    const targetUserId = resolved.userIds[0];
    const weekStart = getWeekStartString(req.nextUrl.searchParams.get("weekStart"));

    const week = await prisma.mealPlanWeek.findUnique({
      where: {
        userId_weekStart: {
          userId: targetUserId,
          weekStart,
        },
      },
      include: {
        entries: {
          orderBy: [{ dayIndex: "asc" }, { mealType: "asc" }, { sortOrder: "asc" }],
        },
      },
    });

    const history = await prisma.mealPlanEntry.groupBy({
      by: ['mealType', 'text'],
      where: {
        week: { userId: targetUserId },
        text: { not: "" },
      },
      _count: {
        text: true
      },
      orderBy: {
        _count: {
          text: 'desc'
        }
      }
    });

    const userIdeas: Record<string, string[]> = {
      BREAKFAST: [],
      SNACK: [],
      LUNCH: [],
      DINNER: [],
    };

    history.forEach(entry => {
      if (userIdeas[entry.mealType] && userIdeas[entry.mealType].length < 15) {
        userIdeas[entry.mealType].push(entry.text);
      }
    });

    if (!week) {
      return NextResponse.json({
        success: true,
        data: {
          weekStart,
          entries: [],
        },
        ideas: userIdeas,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: week.id,
        weekStart: week.weekStart,
        entries: week.entries,
      },
      ideas: userIdeas,
    });
  } catch (error) {
    console.error("GET meal plan error:", error);
    return NextResponse.json({ success: false, error: "Failed to load meal plan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionResponse = await auth.api.getSession({ headers: req.headers });
    const session = sessionResponse?.session as Session | null;

    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Resolve partner view
    const view = body.view || null;
    const connectionIdParam = body.connectionId || null;
    const resolved = await resolvePartnerAccess({
      userId: session.userId,
      view,
      connectionId: connectionIdParam,
      feature: "MEAL",
    });
    if (!resolved) return NextResponse.json({ success: false, error: "Invalid connection" }, { status: 403 });
    if (resolved.kind === "locked") {
      return NextResponse.json(resolved.payload, { status: resolved.status });
    }

    const targetUserId = resolved.userIds[0];
    const weekStart = getWeekStartString(body.weekStart);
    const dayIndex = Number(body.dayIndex);
    const mealType = body.mealType as "BREAKFAST" | "SNACK" | "LUNCH" | "DINNER";
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const sortOrder = body.sortOrder === undefined ? 0 : Number(body.sortOrder);

    if (!Number.isFinite(dayIndex) || dayIndex < 0 || dayIndex > 6) {
      return NextResponse.json({ success: false, error: "Invalid dayIndex" }, { status: 400 });
    }

    if (!["BREAKFAST", "SNACK", "LUNCH", "DINNER"].includes(mealType)) {
      return NextResponse.json({ success: false, error: "Invalid mealType" }, { status: 400 });
    }

    if (!Number.isFinite(sortOrder) || sortOrder < 0) {
      return NextResponse.json({ success: false, error: "Invalid sortOrder" }, { status: 400 });
    }

    const week = await prisma.mealPlanWeek.upsert({
      where: {
        userId_weekStart: {
          userId: targetUserId,
          weekStart,
        },
      },
      create: {
        userId: targetUserId,
        weekStart,
      },
      update: {},
      select: { id: true, weekStart: true },
    });

    if (!text) {
      await prisma.mealPlanEntry.deleteMany({
        where: {
          weekId: week.id,
          dayIndex,
          mealType,
          sortOrder,
        },
      });

      return NextResponse.json({ success: true, data: { deleted: true } }, { status: 200 });
    }

    const existing = await prisma.mealPlanEntry.findFirst({
      where: {
        weekId: week.id,
        dayIndex,
        mealType,
        sortOrder,
      },
      select: { id: true },
    });

    const entry = existing
      ? await prisma.mealPlanEntry.update({
          where: { id: existing.id },
          data: { text },
        })
      : await prisma.mealPlanEntry.create({
          data: {
            weekId: week.id,
            dayIndex,
            mealType,
            sortOrder,
            text,
          },
        });

    return NextResponse.json({ success: true, data: entry }, { status: 200 });
  } catch (error) {
    console.error("POST meal plan error:", error);
    return NextResponse.json({ success: false, error: "Failed to save meal plan" }, { status: 500 });
  }
}

