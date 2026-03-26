import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { url, title, labels, previewImage, connectionId } = body;

        const urlValue = typeof url === "string" ? url.trim() : "";
        const titleValue = typeof title === "string" ? title.trim() : "";
        const labelsValue = typeof labels === "string" ? labels.trim() : "";
        const previewImageValue = typeof previewImage === "string" ? previewImage.trim() : null;

        if (!urlValue || !titleValue || !labelsValue) {
            return NextResponse.json({ error: "URL, Title, and Labels are required" }, { status: 400 });
        }

        // Validate connectionId if provided
        let validConnectionId: string | null = null;
        if (connectionId) {
            const conn = await prisma.partnerConnection.findFirst({
                where: {
                    id: connectionId,
                    status: "ACCEPTED",
                    OR: [
                        { userAId: session.user.id },
                        { userBId: session.user.id }
                    ]
                }
            });
            if (!conn) {
                return NextResponse.json({ error: "Invalid partner connection" }, { status: 403 });
            }
            validConnectionId = conn.id;
        }

        const savedLink = await prisma.savedLink.create({
            data: {
                url: urlValue,
                title: titleValue,
                label: labelsValue,
                previewImage: previewImageValue,
                userId: session.user.id,
                connectionId: validConnectionId,
            },
            select: {
                id: true,
                url: true,
                title: true,
                label: true,
                previewImage: true,
                createdAt: true,
                connectionId: true,
            },
        });

        return NextResponse.json({ success: true, data: savedLink });
    } catch (error) {
        if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2002") {
            return NextResponse.json({ error: "Link ini sudah pernah kamu simpan sebelumnya" }, { status: 409 });
        }
        console.error("Error saving link:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const view = url.searchParams.get("view") || "personal";
        const connectionId = url.searchParams.get("connectionId");

        let whereClause;

        if (view === "shared" && connectionId) {
            // Verify the user belongs to this connection
            const conn = await prisma.partnerConnection.findFirst({
                where: {
                    id: connectionId,
                    status: "ACCEPTED",
                    OR: [
                        { userAId: session.user.id },
                        { userBId: session.user.id }
                    ]
                }
            });

            if (!conn) {
                return NextResponse.json({ error: "Invalid connection" }, { status: 403 });
            }

            // Shared view: show the PARTNER's links (not current user's)
            const partnerId = conn.userAId === session.user.id ? conn.userBId : conn.userAId;
            whereClause = { userId: partnerId };
        } else {
            // Personal view: only show links belonging to this user
            whereClause = { userId: session.user.id };
        }

        const savedLinks = await prisma.savedLink.findMany({
            where: whereClause,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                url: true,
                title: true,
                label: true,
                previewImage: true,
                createdAt: true,
                connectionId: true,
            },
        });

        return NextResponse.json({ success: true, data: savedLinks });
    } catch (error) {
        console.error("Error fetching links:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
