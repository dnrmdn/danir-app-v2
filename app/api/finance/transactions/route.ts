import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { getUserIdFromSession } from "@/lib/finance/session";
import {
  assertPositiveDecimal,
  assertSufficientBalance,
  parseDate,
  toDecimal,
} from "@/lib/finance/money";

function parseDateParam(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = getUserIdFromSession(session);

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const start = parseDateParam(searchParams.get("start"));
    const end = parseDateParam(searchParams.get("end"));

    const transactions = await prisma.financeTransaction.findMany({
      where: {
        userId,
        ...(start || end
          ? {
            date: {
              ...(start ? { gte: start } : {}),
              ...(end ? { lte: end } : {}),
            },
          }
          : {}),
      },
      include: {
        account: true,
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: [
        { date: "desc" },
        { id: "desc" },
      ],
    });

    const normalized = transactions.map((tx) => ({
      ...tx,
      tags: tx.tags.map((item) => item.tag),
    }));

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    console.error("finance transactions GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
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

    const type = body.type as "INCOME" | "EXPENSE";
    const accountId = Number(body.accountId);
    const categoryId = body.categoryId ? Number(body.categoryId) : null;
    const currency = "IDR";
    const amount = toDecimal(body.amount);
    const date = parseDate(body.date);
    const note = typeof body.note === "string" ? body.note.trim() : null;
    const tags: string[] =
      typeof body.tags === "string"
        ? body.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [];

    if (!["INCOME", "EXPENSE"].includes(type)) {
      return NextResponse.json({ success: false, error: "Tipe transaksi tidak valid" }, { status: 400 });
    }

    if (!Number.isFinite(accountId)) {
      return NextResponse.json({ success: false, error: "Akun tidak valid" }, { status: 400 });
    }

    assertPositiveDecimal(amount);

    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.financeAccount.findFirst({
        where: { id: accountId, userId },
      });

      if (!account) {
        throw new Error("Akun tidak ditemukan");
      }

      if (categoryId) {
        const category = await tx.financeCategory.findFirst({
          where: { id: categoryId, userId, kind: type },
        });

        if (!category) {
          throw new Error("Kategori tidak valid");
        }
      }

      const tagIds: number[] = [];
      if (tags.length > 0) {
        for (const tagName of tags) {
          const existingTag = await tx.financeTag.findFirst({
            where: { name: tagName, userId },
          });

          if (existingTag) {
            tagIds.push(existingTag.id);
          } else {
            const newTag = await tx.financeTag.create({
              data: { userId, name: tagName },
            });
            tagIds.push(newTag.id);
          }
        }
      }

      const currentBalance = new Prisma.Decimal(account.balance);

      if (type === "EXPENSE") {
        assertSufficientBalance(currentBalance, amount);
      }

      const created = await tx.financeTransaction.create({
        data: {
          userId,
          accountId,
          type,
          amount,
          currency,
          date,
          note,
          categoryId,
          tags: tagIds.length
            ? {
              create: tagIds.map((tagId: number) => ({ tagId })),
            }
            : undefined,
        },
        include: {
          account: true,
          category: true,
          tags: { include: { tag: true } },
        },
      });

      await tx.financeAccount.update({
        where: { id: accountId },
        data: {
          balance: type === "INCOME"
            ? { increment: amount }
            : { decrement: amount },
        },
      });

      return {
        ...created,
        tags: created.tags.map((item) => item.tag),
      };
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}