import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Session } from "better-auth";
import { NextRequest, NextResponse } from "next/server";

// 10 warna default
const DEFAULT_COLORS = [
    {
        bgColor: "bg-blue-50",
        taskColor: "bg-blue-100",
        taskColorDone: "bg-blue-200",
        iconColor: "bg-blue-300",
        checkColor: "bg-blue-500",
    },
    {
        bgColor: "bg-red-50",
        taskColor: "bg-red-100",
        taskColorDone: "bg-red-200",
        iconColor: "bg-red-300",
        checkColor: "bg-red-500",
    },
    {
        bgColor: "bg-green-50",
        taskColor: "bg-green-100",
        taskColorDone: "bg-green-200",
        iconColor: "bg-green-300",
        checkColor: "bg-green-500",
    },
    {
        bgColor: "bg-yellow-50",
        taskColor: "bg-yellow-100",
        taskColorDone: "bg-yellow-200",
        iconColor: "bg-yellow-300",
        checkColor: "bg-yellow-500",
    },
    {
        bgColor: "bg-purple-50",
        taskColor: "bg-purple-100",
        taskColorDone: "bg-purple-200",
        iconColor: "bg-purple-300",
        checkColor: "bg-purple-500",
    },
    {
        bgColor: "bg-pink-50",
        taskColor: "bg-pink-100",
        taskColorDone: "bg-pink-200",
        iconColor: "bg-pink-300",
        checkColor: "bg-pink-500",
    },
    {
        bgColor: "bg-indigo-50",
        taskColor: "bg-indigo-100",
        taskColorDone: "bg-indigo-200",
        iconColor: "bg-indigo-300",
        checkColor: "bg-indigo-500",
    },
    {
        bgColor: "bg-teal-50",
        taskColor: "bg-teal-100",
        taskColorDone: "bg-teal-200",
        iconColor: "bg-teal-300",
        checkColor: "bg-teal-500",
    },
    {
        bgColor: "bg-orange-50",
        taskColor: "bg-orange-100",
        taskColorDone: "bg-orange-200",
        iconColor: "bg-orange-300",
        checkColor: "bg-orange-500",
    },
    {
        bgColor: "bg-gray-50",
        taskColor: "bg-gray-100",
        taskColorDone: "bg-gray-200",
        iconColor: "bg-gray-300",
        checkColor: "bg-gray-500",
    },
];


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

        const members = await prisma.member.findMany({
            where: { userId: session.userId },
            include: { tasks: true },
            orderBy: { createdAt: "asc" }
        });

        return NextResponse.json({ success: true, data: members });

    } catch (error) {
        console.error("Get member error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to load member" },
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

        const userId = session.userId;

        const body = await req.json();
        const { name, colorIndex } = body;

        if (!name || typeof name !== "string") {
            return NextResponse.json(
                { success: false, message: "Name is required" },
                { status: 400 }
            );
        }

        if (colorIndex === undefined || colorIndex === null || isNaN(Number(colorIndex))) {
            return NextResponse.json(
                { success: false, message: "Color is required" },
                { status: 400 }
            );
        }

        const selectedColor = DEFAULT_COLORS[colorIndex] || DEFAULT_COLORS[0];

        const newMember = await prisma.member.create({
            data: {
                userId,
                name,
                ...selectedColor,
            },
            include: { tasks: true}
        });

        return NextResponse.json(
            { success: true, data: newMember },
            { status: 201 }
        );

    } catch (error) {
        console.error("Post member error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to create member" },
            { status: 500 }
        );
    }
}

