import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdminSession(req);
    if (authResult instanceof NextResponse) return authResult;

    const [
      totalUsers,
      freeUsers,
      proTrialUsers,
      proUsers,
      pendingPayments,
      approvedPayments,
      rejectedPayments,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { planType: "FREE" } }),
      prisma.user.count({ where: { planType: "PRO_TRIAL" } }),
      prisma.user.count({ where: { planType: "PRO" } }),
      prisma.paymentRequest.count({ where: { status: "PENDING" } }),
      prisma.paymentRequest.count({ where: { status: "APPROVED" } }),
      prisma.paymentRequest.count({ where: { status: "REJECTED" } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          planType: true,
          subscriptionStatus: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          free: freeUsers,
          proTrial: proTrialUsers,
          pro: proUsers,
        },
        payments: {
          pending: pendingPayments,
          approved: approvedPayments,
          rejected: rejectedPayments,
        },
        recentUsers,
      },
    });
  } catch (error) {
    console.error("admin stats GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
