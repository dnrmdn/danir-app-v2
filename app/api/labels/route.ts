import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

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
            select: {
                label: true,
            },
        });

        const allLabels = savedLinks
            .flatMap(link => link.label ? link.label.split(',').map(l => l.trim()) : [])
            .filter(label => label.length > 0);
            
        const uniqueLabels = Array.from(new Set(allLabels)).sort();

        return NextResponse.json({ success: true, data: uniqueLabels });
    } catch (error) {
        console.error("Error fetching labels:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
