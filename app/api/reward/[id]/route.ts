import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Session } from "better-auth";
import { NextRequest, NextResponse } from "next/server";


// 🔹 UPDATE Reward (PATCH)
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
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

        const rewardId = Number(params.id);
        const body = await req.json();

        const reward = await prisma.reward.findUnique({
            where: { id: rewardId },
        });

        if (!reward) {
            return NextResponse.json(
                { success: false, error: "Reward not found" },
                { status: 404 }
            );
        }

        if (reward.userId !== session.userId) {
            return NextResponse.json(
                { success: false, error: "Forbidden: You do not own this reward" },
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

    } catch (error) {
        console.error("❌ Error updating reward:", error);

        return NextResponse.json(
            { success: false, error: "Failed to update reward" },
            { status: 500 }
        );
    }
}



// 🔹 DELETE Reward
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
        });

        if (!reward) {
            return NextResponse.json(
                { success: false, error: "Reward not found" },
                { status: 404 }
            );
        }

        if (reward.userId !== session.userId) {
            return NextResponse.json(
                { success: false, error: "Forbidden: You do not own this reward" },
                { status: 403 }
            );
        }

        // Delete reward
        await prisma.reward.delete({
            where: { id: rewardId },
        });

        return NextResponse.json(
            { success: true, message: "Reward deleted successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("❌ Error deleting reward:", error);

        return NextResponse.json(
            { success: false, error: "Failed to delete reward" },
            { status: 500 }
        );
    }
}
