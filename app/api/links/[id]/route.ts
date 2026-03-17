import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: idParam } = await context.params;
        const id = parseInt(idParam);

        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const link = await prisma.savedLink.findUnique({
            where: { id },
            select: { userId: true },
        });

        if (!link) {
            return NextResponse.json({ error: "Link not found" }, { status: 404 });
        }

        if (link.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.savedLink.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting link:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
