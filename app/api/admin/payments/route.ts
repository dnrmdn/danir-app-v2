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

    // Use a transaction to ensure both PaymentRequest and User are updated atomically
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current payment request and verify it's still PENDING
      const current = await tx.paymentRequest.findUnique({
        where: { id: paymentId },
        select: { id: true, status: true, userId: true },
      });

      if (!current) {
        throw new Error("Payment request not found");
      }

      if (current.status !== "PENDING") {
        throw new Error(`Cannot process payment with status ${current.status}`);
      }

      // 2. Update PaymentRequest status and reviewer info
      const updatedPayment = await tx.paymentRequest.update({
        where: { id: paymentId },
        data: {
          status,
          notes: notes?.trim() || null,
          reviewedAt: new Date(),
          reviewedBy: authResult.userId,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // 3. If approved, upgrade the related user to PRO
      if (status === "APPROVED") {
        const now = new Date();
        const thirtyDaysLater = new Date(now);
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

        await tx.user.update({
          where: { id: current.userId },
          data: {
            planType: "PRO",
            subscriptionStatus: "ACTIVE",
            proStartedAt: now,
            subscriptionEndsAt: thirtyDaysLater,
          },
        });
      }

      return updatedPayment;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("admin payments PATCH error:", error);
    const errorMessage = error.message || "Internal Server Error";
    const status = error.message && error.message.includes("not found") ? 404 : 
                   error.message && error.message.includes("Cannot process") ? 400 : 500;
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status }
    );
  }
}
