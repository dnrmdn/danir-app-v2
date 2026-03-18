import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    const sessionUserId = session?.user?.id ?? null;
    const sessionEmail = session?.user?.email ?? null;

    const links = sessionUserId
      ? await prisma.savedLink.findMany({
          where: { userId: sessionUserId },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            userId: true,
            url: true,
            title: true,
            label: true,
            createdAt: true,
          },
        })
      : [];

    const allRecentLinks = await prisma.savedLink.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        userId: true,
        url: true,
        title: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      sessionUserId,
      sessionEmail,
      linksCount: links.length,
      links,
      allRecentLinks,
    });
  } catch (error) {
    console.error("Error in links debug route:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
