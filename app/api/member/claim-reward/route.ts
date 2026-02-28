// /app/api/member/claim-reward/route.ts

import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { memberId, rewardId } = await req.json();

        if (!memberId || !rewardId)
            return NextResponse.json({ success: false, error: "Invalid request" });

        // ambil reward
        const reward = await prisma.reward.findUnique({
            where: { id: rewardId },
            select: { minStars: true },
        });

        if (!reward)
            return NextResponse.json({ success: false, error: "Reward not found" });

        // hitung total stars member
        const tasks = await prisma.task.findMany({
            where: { memberId, completed: true },
            select: { reward: true },
        });

        const totalStars = tasks.reduce((sum, t) => sum + (t.reward || 0), 0);

        if (totalStars < reward.minStars) {
            return NextResponse.json({
                success: false,
                error: "Not enough stars",
            });
        }

        // Kurangi stars dengan membuat "pengurangan" dalam form task
        await prisma.task.create({
            data: {
                memberId,
                label: `Claim Reward`,
                date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
                time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),

                reward: -reward.minStars, // ⭐ PENGURANGAN STAR
                completed: true,
            },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: "Server error" });
    }
}
