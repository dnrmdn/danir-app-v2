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
        const { url, title, labels, previewImage } = body;

        const urlValue = typeof url === "string" ? url.trim() : "";
        const titleValue = typeof title === "string" ? title.trim() : "";
        const labelsValue = typeof labels === "string" ? labels.trim() : "";
        const previewImageValue = typeof previewImage === "string" ? previewImage.trim() : null;

        if (!urlValue || !titleValue || !labelsValue) {
            return NextResponse.json({ error: "URL, Title, and Labels are required" }, { status: 400 });
        }

        const savedLink = await prisma.savedLink.create({
            data: {
                url: urlValue,
                title: titleValue,
                label: labelsValue,
                previewImage: previewImageValue,
                userId: session.user.id,
            },
            select: {
                id: true,
                url: true,
                title: true,
                label: true,
                previewImage: true,
                createdAt: true,
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

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const savedLinks = await prisma.savedLink.findMany({
            where: {
                userId: session.user.id,
            },
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
            },
        });

        return NextResponse.json({ success: true, data: savedLinks });
    } catch (error) {
        console.error("Error fetching links:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
