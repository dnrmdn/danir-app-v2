import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { getUserIdFromSession } from "@/lib/finance/session";
import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        const userId = getUserIdFromSession(session);

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("avatar");

        if (!(file instanceof File)) {
            return NextResponse.json(
                { success: false, error: "File avatar tidak ditemukan" },
                { status: 400 }
            );
        }

        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { success: false, error: "File harus berupa gambar" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        if (buffer.length > 2 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: "Ukuran file maksimal 2MB" },
                { status: 400 }
            );
        }

        const ext = file.name.split(".").pop() || "png";
        const fileName = `${userId}-${randomUUID()}.${ext}`;

        const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        const imageUrl = `/uploads/avatars/${fileName}`;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { image: imageUrl },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                username: true,
                bio: true,
                phone: true,
                location: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: updatedUser,
        });
    } catch (error) {
        console.error("avatar POST error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}