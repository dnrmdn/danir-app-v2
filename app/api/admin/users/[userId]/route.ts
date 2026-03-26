import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import prisma from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const authResult = await requireAdminSession(req);
    if (authResult instanceof NextResponse) return authResult;

    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        username: true,
        bio: true,
        phone: true,
        location: true,
        role: true,
        planType: true,
        subscriptionStatus: true,
        trialStartAt: true,
        trialEndAt: true,
        proStartedAt: true,
        subscriptionEndsAt: true,
        createdAt: true,
        updatedAt: true,
        paymentRequests: {
          orderBy: { submittedAt: "desc" },
          take: 10,
          select: {
            id: true,
            invoiceCode: true,
            planTarget: true,
            amount: true,
            currency: true,
            paymentMethod: true,
            status: true,
            submittedAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("admin user detail GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
