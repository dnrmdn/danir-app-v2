import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Session } from "better-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        // 🔹 Ambil session yang sedang aktif dari header
        const sessionResponse = await auth.api.getSession({ headers: req.headers });

        // 🔹 Gunakan type assertion supaya aman
        const session = sessionResponse?.session as Session | null;

        if (!session?.userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 🔹 Ambil member milik user yang login
        const members = await prisma.member.findMany({
            where: { userId: session.userId },
            select: { id: true }
        })

        // Jika user belum punya member, otomatis tidak punya task
        if (members.length === 0) {
            return NextResponse.json({
                success: true, data: []
            }, {
                status: 200
            }
            )
        }

        // Petakan member
        const memberIds = members.map((m) => m.id)

        // Ambil semua task berdasarkan memberId milik user
        const tasks = await prisma.task.findMany({
            where: { memberId: { in: memberIds } },
            orderBy: { createdAt: "desc" }
        })
        return NextResponse.json(
            { success: true, data: tasks },
            { status: 200 }
        )

    } catch (error) {
        console.error("❌ Error fetching tasks:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch data" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
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

        const body = await req.json()
        const { memberId, label, date, time, reward } = body

        if (!memberId || !label) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Validasi member milik user 
        const member = await prisma.member.findFirst(
            { where: { id: memberId, userId: session.userId } }
        )
        if (!member) {
            return NextResponse.json(
                { success: false, error: "Forbidden: Member not owned by user" },
                { status: 403 }
            )
        }

        // Membuat task baru
        const newTask = await prisma.task.create({
            data: {
                memberId,
                label,
                date,
                time,
                reward
            }
        })

        return NextResponse.json(
            { success: true, data: newTask },
            { status: 201 }
        )

    } catch (error) {
        console.error("❌ Error creating task:", error)
        return NextResponse.json(
            { success: false, error: "Failed to create task" },
            { status: 500 }
        )
    }
}