import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Session } from "better-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        // 🔹 Ambil session
        const sessionResponse = await auth.api.getSession({ headers: req.headers });
        const session = sessionResponse?.session as Session | null;

        if (!session?.userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 🔹 Ambil reward milik user
        const rewards = await prisma.reward.findMany({
            where: { userId: session.userId },
            orderBy: { createdAt: "asc" }
        });

        return NextResponse.json({ success: true, data: rewards });

    } catch (error) {
        console.error("GET reward error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to load rewards" },
            { status: 500 }
        );
    }
}




export async function POST(req: NextRequest) {
    try {
        const sessionResponse = await auth.api.getSession({ headers: req.headers });
        const session = sessionResponse?.session as Session | null;

        if (!session?.userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name, minStars, image } = body;

        // 🔹 Validasi
        if (!name || typeof name !== "string") {
            return NextResponse.json(
                { success: false, message: "Reward name is required" },
                { status: 400 }
            );
        }

        if (minStars === undefined || isNaN(Number(minStars))) {
            return NextResponse.json(
                { success: false, message: "Minimal star is required" },
                { status: 400 }
            );
        }

        if (!image || typeof image !== "string") {
            return NextResponse.json(
                { success: false, message: "Image is required" },
                { status: 400 }
            );
        }


        // 🔹 Create reward
        const newReward = await prisma.reward.create({
            data: {
                userId: session.userId,
                name,
                minStars: Number(minStars),
                image: image ?? undefined
            }
        });

        return NextResponse.json(
            { success: true, data: newReward },
            { status: 201 }
        );


    } catch (error) {
        console.error("POST reward error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to create reward" },
            { status: 500 }
        );
    }
}
