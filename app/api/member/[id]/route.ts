import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Session } from "better-auth";
import { NextRequest, NextResponse } from "next/server";


// 🔹 UPDATE Member (PATCH)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const sessionResponse = await auth.api.getSession({
            headers: req.headers,
        });
        const session = sessionResponse?.session as Session | null;

        if (!session?.userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const memberId = Number(params.id);
        const body = await req.json();

        const member = await prisma.member.findUnique({
            where: { id: memberId },
        });

        if (!member) {
            return NextResponse.json(
                { success: false, error: "Member not found" },
                { status: 404 }
            );
        }

        if (member.userId !== session.userId) {
            return NextResponse.json(
                { success: false, error: "Forbidden: You do not own this member" },
                { status: 403 }
            );
        }

        const updatedMember = await prisma.member.update({
            where: { id: memberId },
            data: {
                name: body.name,
                iconColor: body.iconColor,
                taskColorDone: body.taskColorDone,
            },
        });

        return NextResponse.json({ success: true, data: updatedMember }, { status: 200 });
    } catch (error) {
        console.error("❌ Error updating member:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update member" },
            { status: 500 }
        );
    }
}


// 🔹 DELETE Member
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }>}) {
    try {
        const sessionResponse = await auth.api.getSession({
            headers: req.headers,
        });
        const session = sessionResponse?.session as Session | null;

        if (!session?.userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        const memberId = Number(id);

        const member = await prisma.member.findUnique({
            where: { id: memberId },
        });

        if (!member) {
            return NextResponse.json(
                { success: false, error: "Member not found" },
                { status: 404 }
            );
        }

        if (member.userId !== session.userId) {
            return NextResponse.json(
                { success: false, error: "Forbidden: You do not own this member" },
                { status: 403 }
            );
        }

        // Optional: Delete tasks belonging to this member
        await prisma.task.deleteMany({
            where: { memberId: memberId },
        });

        // Delete the member
        await prisma.member.delete({
            where: { id: memberId },
        });

        return NextResponse.json(
            { success: true, message: "Member deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("❌ Error deleting member:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete member" },
            { status: 500 }
        );
    }
}
