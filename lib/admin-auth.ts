import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export type AdminSession = {
  userId: string;
  role: "ADMIN" | "USER";
};

/**
 * Server-side admin guard for Server Components and Server Actions.
 * Returns the admin session if the user is authenticated and has ADMIN role,
 * otherwise returns null.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user?.id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return null;
    }

    return { userId: user.id, role: user.role };
  } catch {
    return null;
  }
}

/**
 * API route admin guard.
 * Returns { userId, role } if authenticated + ADMIN, otherwise returns a NextResponse 401/403.
 */
export async function requireAdminSession(
  req: NextRequest
): Promise<{ userId: string; role: "ADMIN" } | NextResponse> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    return { userId: user.id, role: user.role as "ADMIN" };
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
