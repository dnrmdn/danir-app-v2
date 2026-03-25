import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { getUserIdFromSession } from "@/lib/finance/session";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma";

type FinanceCategoryKind = "INCOME" | "EXPENSE";
type FinanceCategoryClassification =
  | "NEED"
  | "WANT"
  | "INVESTMENT"
  | "SAVING"
  | "DEBT"
  | "TAX"
  | "OTHER";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = getUserIdFromSession(session);

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.financeCategory.findMany({
      where: { userId },
      orderBy: [
        { kind: "asc" },
        { parentId: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("finance categories GET error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = getUserIdFromSession(session);

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const kind = body.kind as FinanceCategoryKind;
    const parentId =
      body.parentId === null || body.parentId === undefined || body.parentId === ""
        ? null
        : Number(body.parentId);

    const classification =
      typeof body.classification === "string"
        ? (body.classification as FinanceCategoryClassification)
        : null;

    const icon = typeof body.icon === "string" ? body.icon.trim() : null;
    const color = typeof body.color === "string" ? body.color.trim() : null;
    const isSystem = typeof body.isSystem === "boolean" ? body.isSystem : false;

    if (!name) {
      return NextResponse.json({ success: false, error: "Nama kategori wajib diisi" }, { status: 400 });
    }

    if (!["INCOME", "EXPENSE"].includes(kind)) {
      return NextResponse.json({ success: false, error: "Kind tidak valid" }, { status: 400 });
    }

    if (
      classification &&
      !["NEED", "WANT", "INVESTMENT", "SAVING", "DEBT", "TAX", "OTHER"].includes(classification)
    ) {
      return NextResponse.json({ success: false, error: "Classification tidak valid" }, { status: 400 });
    }

    if (parentId !== null) {
      const parent = await prisma.financeCategory.findFirst({
        where: {
          id: parentId,
          userId,
        },
      });

      if (!parent) {
        return NextResponse.json({ success: false, error: "Parent category tidak ditemukan" }, { status: 404 });
      }

      if (parent.kind !== kind) {
        return NextResponse.json(
          { success: false, error: "Kind parent dan child harus sama" },
          { status: 400 }
        );
      }
    }

    const category = await prisma.financeCategory.create({
      data: {
        userId,
        name,
        kind,
        parentId,
        classification,
        icon,
        color,
        isSystem,
      },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ success: false, error: "Kategori sudah ada" }, { status: 409 });
    }

    console.error("finance categories POST error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}