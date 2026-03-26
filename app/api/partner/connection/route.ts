import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET: Fetch current active or pending partner connection
export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // A user can only have one active connection in this model
        const connection = await prisma.partnerConnection.findFirst({
            where: {
                OR: [
                    { userAId: userId },
                    { userBId: userId }
                ]
            },
            include: {
                userA: { select: { id: true, name: true, email: true, image: true } },
                userB: { select: { id: true, name: true, email: true, image: true } },
            }
        });

        return NextResponse.json({ success: true, data: connection });
    } catch (error) {
        console.error("Error fetching partner connection:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Send a partner invite
export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { email } = body;

        const emailValue = typeof email === "string" ? email.trim() : "";

        if (!emailValue) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const targetUser = await prisma.user.findUnique({
            where: { email: emailValue }
        });

        if (!targetUser) {
            return NextResponse.json({ error: "User with this email not found" }, { status: 404 });
        }

        if (targetUser.id === session.user.id) {
            return NextResponse.json({ error: "You cannot invite yourself" }, { status: 400 });
        }

        // Verify if any connection already exists for either user
        const existingConnection = await prisma.partnerConnection.findFirst({
            where: {
                OR: [
                    { userAId: session.user.id },
                    { userBId: session.user.id },
                    { userAId: targetUser.id },
                    { userBId: targetUser.id }
                ]
            }
        });

        if (existingConnection) {
            return NextResponse.json({ error: "A connection already exists or is pending for you or the target user" }, { status: 400 });
        }

        const newConnection = await prisma.partnerConnection.create({
            data: {
                userAId: session.user.id,
                userBId: targetUser.id,
                status: "PENDING"
            },
            include: {
                userA: { select: { id: true, name: true, email: true, image: true } },
                userB: { select: { id: true, name: true, email: true, image: true } },
            }
        });

        return NextResponse.json({ success: true, data: newConnection });
    } catch (error) {
        console.error("Error sending partner invite:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT: Accept a partner invite
export async function PUT(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { connectionId, action } = body;

        if (action !== "ACCEPT") {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const connection = await prisma.partnerConnection.findUnique({
            where: { id: connectionId }
        });

        if (!connection) {
            return NextResponse.json({ error: "Connection not found" }, { status: 404 });
        }

        // Only userB can accept
        if (connection.userBId !== session.user.id) {
            return NextResponse.json({ error: "Not authorized to accept this invite" }, { status: 403 });
        }

        const updatedConnection = await prisma.partnerConnection.update({
            where: { id: connectionId },
            data: { status: "ACCEPTED" },
            include: {
                userA: { select: { id: true, name: true, email: true, image: true } },
                userB: { select: { id: true, name: true, email: true, image: true } },
            }
        });

        return NextResponse.json({ success: true, data: updatedConnection });
    } catch (error) {
        console.error("Error accepting partner invite:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Cancel, reject, or disconnect
export async function DELETE(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const url = new URL(req.url);
        const connectionId = url.searchParams.get("connectionId");

        if (!connectionId) {
            return NextResponse.json({ error: "Connection ID is required" }, { status: 400 });
        }

        const connection = await prisma.partnerConnection.findUnique({
            where: { id: connectionId }
        });

        if (!connection) {
            return NextResponse.json({ error: "Connection not found" }, { status: 404 });
        }

        if (connection.userAId !== session.user.id && connection.userBId !== session.user.id) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        await prisma.partnerConnection.delete({
            where: { id: connectionId }
        });

        return NextResponse.json({ success: true, message: "Connection removed" });
    } catch (error) {
        console.error("Error removing connection:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
