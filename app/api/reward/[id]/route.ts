import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Session } from "better-auth";
import { NextRequest, NextResponse } from "next/server";

// ===============================
// 🔹 Helper: Update Logic
// ===============================
async function updateRewardHandler(req: NextRequest, rewardId: number) {
    const sessionResponse = await auth.api.getSession({
        headers: req.headers,
    });

    const session = sessionResponse?.session as Session | null;

    if (!session?.userId) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    const body = await req.json();

    const reward = await prisma.reward.findUnique({
        where: { id: rewardId },
        include: { member: true },
    });

    if (!reward) {
        return NextResponse.json(
            { success: false, error: "Reward not found" },
            { status: 404 }
        );
    }

    if (reward.member.userId !== session.userId) {
        return NextResponse.json(
            { success: false, error: "Forbidden" },
            { status: 403 }
        );
    }

    const updatedReward = await prisma.reward.update({
        where: { id: rewardId },
        data: {
            name: body.name,
            minStars: body.minStars,
            image: body.image,
        },
    });

    return NextResponse.json(
        { success: true, data: updatedReward },
        { status: 200 }
    );
}

// ===============================
// 🔹 PATCH
// ===============================
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        return await updateRewardHandler(req, Number(id));
    } catch (error) {
        console.error("❌ PATCH Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update reward" },
            { status: 500 }
        );
    }
}

// ===============================
// 🔹 PUT
// ===============================
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        return await updateRewardHandler(req, Number(id));
    } catch (error) {
        console.error("❌ PUT Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update reward" },
            { status: 500 }
        );
    }
}

// ===============================
// 🔹 DELETE
// ===============================
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const sessionResponse = await auth.api.getSession({
            headers: req.headers,
        });

        const session = sessionResponse?.session as Session | null;

        if (!session?.userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        const rewardId = Number(id);

        const reward = await prisma.reward.findUnique({
            where: { id: rewardId },
            include: { member: true },
        });

        if (!reward) {
            return NextResponse.json(
                { success: false, error: "Reward not found" },
                { status: 404 }
            );
        }

        if (reward.member.userId !== session.userId) {
            return NextResponse.json(
                { success: false, error: "Forbidden" },
                { status: 403 }
            );
        }

        await prisma.reward.delete({
            where: { id: rewardId },
        });

        return NextResponse.json(
            { success: true },
            { status: 200 }
        );
    } catch (error) {
        console.error("❌ DELETE Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete reward" },
            { status: 500 }
        );
    }
}