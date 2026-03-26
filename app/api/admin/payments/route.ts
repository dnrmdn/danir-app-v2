import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdminSession(req);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as "PENDING" | "APPROVED" | "REJECTED" | null;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [payments, total] = await Promise.all([
      prisma.paymentRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      }),
      prisma.paymentRequest.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        payments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("admin payments GET error:", error);
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
    const { paymentId, status, notes } = body as {
      paymentId?: string;
      status?: "APPROVED" | "REJECTED";
      notes?: string;
    };

    if (!paymentId || !status) {
      return NextResponse.json(
        { success: false, error: "paymentId and status are required" },
        { status: 400 }
      );
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "status must be APPROVED or REJECTED" },
        { status: 400 }
      );
    }

    const payment = await prisma.paymentRequest.update({
      where: { id: paymentId },
      data: {
        status,
        notes: notes ?? null,
        reviewedAt: new Date(),
        reviewedBy: authResult.userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // If approved, upgrade the user to PRO plan
    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          planType: "PRO",
          subscriptionStatus: "ACTIVE",
          proStartedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, data: payment });
  } catch (error) {
    console.error("admin payments PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
