import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Session } from "better-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
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
        const taskId = Number(id);

        const task = await prisma.task.findUnique(
            {
                where: { id: taskId },
                include: { member: true }
            })
        if (!task) {
            return NextResponse.json(
                { success: false, error: "Task not found" },
                { status: 400 }
            )
        }
        if (task.member.userId !== session.userId) {
            return NextResponse.json(
                { success: false, error: "Forbidden: You do not own this task" },
                { status: 403 }
            )
        }

        const updateTask = await prisma.task.update(
            {
                where: { id: taskId },
                data: { completed: !task.completed }
            }
        )
        return NextResponse.json(
            { success: true, data: updateTask },
            { status: 200 }
        )

    } catch (error) {
        console.error("❌ Error updating task:", error)
        return NextResponse.json(
            { success: false, error: "Failed to update task" },
            { status: 500 }
        )
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
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
        // 🔹 Ambil params (HARUS di-await)
        const { id } = await context.params;
        const taskId = Number(id);

        const task = await prisma.task.findUnique(
            {
                where: { id: taskId },
                include: { member: true }
            }
        )

        if (!task) {
            return NextResponse.json(
                { success: false, error: "Task not found" },
                { status: 403 }
            )
        }

        await prisma.task.delete({
            where: { id: taskId }
        })
        return NextResponse.json(
            { success: true, message: "Task deleted!" },
            { status: 200 }
        )

    } catch (error) {
        console.error("❌ Error deleting task:", error)
        return NextResponse.json(
            { success: false, error: "Failed to delete task" },
            { status: 500 }
        )
    }
}