import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

type AuthApiError = {
    message?: string;
    status?: number;
    body?: {
        message?: string;
    };
};

function getErrorMessage(error: unknown) {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === "object" && error !== null) {
        const err = error as AuthApiError;
        return (
            err.body?.message ||
            err.message ||
            "Terjadi kesalahan saat mengubah password"
        );
    }

    return "Terjadi kesalahan saat mengubah password";
}

function getErrorStatus(error: unknown) {
    if (typeof error === "object" && error !== null) {
        const err = error as AuthApiError;
        return typeof err.status === "number" ? err.status : 500;
    }

    return 500;
}

export async function POST(req: Request) {
    try {
        const { currentPassword, newPassword, confirmPassword } = await req.json();

        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json(
                { message: "Semua field wajib diisi" },
                { status: 400 }
            );
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json(
                { message: "Konfirmasi password tidak cocok" },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { message: "Password baru minimal 8 karakter" },
                { status: 400 }
            );
        }

        await auth.api.changePassword({
            body: {
                currentPassword,
                newPassword,
                revokeOtherSessions: false,
            },
            headers: req.headers,
        });

        return NextResponse.json({
            message: "Password berhasil diubah",
        });
    } catch (error: unknown) {
        console.error("CHANGE_PASSWORD_ERROR", error);

        return NextResponse.json(
            {
                message: getErrorMessage(error),
            },
            { status: getErrorStatus(error) }
        );
    }
}