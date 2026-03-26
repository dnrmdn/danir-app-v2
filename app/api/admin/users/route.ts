import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdminSession(req);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          planType: true,
          subscriptionStatus: true,
          trialEndAt: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("admin users GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await requireAdminSession(req);
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const { userId, role, planType, subscriptionStatus } = body as {
      userId?: string;
      role?: "USER" | "ADMIN";
      planType?: "FREE" | "PRO_TRIAL" | "PRO";
      subscriptionStatus?: "NONE" | "TRIALING" | "ACTIVE" | "EXPIRED" | "CANCELED";
    };

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (role !== undefined) {
      updateData.role = role;
    }

    if (planType !== undefined) {
      updateData.planType = planType;
      // Automatically set the correct subscription state for admin plan changes
      if (planType === "PRO") {
        updateData.proStartedAt = new Date();
        updateData.subscriptionStatus = subscriptionStatus ?? "ACTIVE";
      } else if (planType === "FREE") {
        updateData.proStartedAt = null;
        updateData.subscriptionStatus = subscriptionStatus ?? "NONE";
      } else if (planType === "PRO_TRIAL") {
        updateData.subscriptionStatus = subscriptionStatus ?? "TRIALING";
      }
    } else if (subscriptionStatus !== undefined) {
      updateData.subscriptionStatus = subscriptionStatus;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        planType: true,
        subscriptionStatus: true,
        proStartedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("admin users PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
