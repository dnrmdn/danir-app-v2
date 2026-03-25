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

function rollbackDelta(type: "INCOME" | "EXPENSE", amount: Prisma.Decimal) {
  return type === "INCOME"
    ? { decrement: amount }
    : { increment: amount };
}

function applyDelta(type: "INCOME" | "EXPENSE", amount: Prisma.Decimal) {
  return type === "INCOME"
    ? { increment: amount }
    : { decrement: amount };
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = getUserIdFromSession(session);

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
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

    assertPositiveDecimal(amount);

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.financeTransaction.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw new Error("Transaksi tidak ditemukan");
      }

      if (existing.type === "TRANSFER") {
        throw new Error("Transfer tidak bisa diupdate dari endpoint transaksi biasa");
      }

      const newAccount = await tx.financeAccount.findFirst({
        where: { id: accountId, userId },
      });

      if (!newAccount) {
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

      await tx.financeAccount.update({
        where: { id: existing.accountId },
        data: {
          balance: rollbackDelta(existing.type as "INCOME" | "EXPENSE", new Prisma.Decimal(existing.amount)),
        },
      });

      const refreshed = await tx.financeAccount.findFirst({
        where: { id: accountId, userId },
      });

      if (!refreshed) {
        throw new Error("Akun tidak ditemukan");
      }

      if (type === "EXPENSE") {
        assertSufficientBalance(new Prisma.Decimal(refreshed.balance), amount);
      }

      await tx.financeAccount.update({
        where: { id: accountId },
        data: {
          balance: applyDelta(type, amount),
        },
      });

      await tx.financeTransaction.update({
        where: { id },
        data: {
          accountId,
          type,
          amount,
          currency,
          date,
          note,
          categoryId,
        },
      });

      await tx.financeTransactionTag.deleteMany({
        where: { transactionId: id },
      });

      if (tagIds.length > 0) {
        await tx.financeTransactionTag.createMany({
          data: tagIds.map((tagId) => ({
            transactionId: id,
            tagId,
          })),
          skipDuplicates: true,
        });
      }

      return tx.financeTransaction.findUnique({
        where: { id },
        include: {
          account: true,
          category: true,
          tags: { include: { tag: true } },
        },
      });
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = getUserIdFromSession(session);

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.financeTransaction.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw new Error("Transaksi tidak ditemukan");
      }

      if (existing.type === "TRANSFER") {
        if (!existing.transferGroup) {
          throw new Error("Transfer group tidak valid");
        }

        const pair = await tx.financeTransaction.findMany({
          where: {
            userId,
            transferGroup: existing.transferGroup,
            type: "TRANSFER",
          },
        });

        for (const item of pair) {
          if (item.transferDirection === "OUT") {
            await tx.financeAccount.update({
              where: { id: item.accountId },
              data: { balance: { increment: item.amount } },
            });
          }

          if (item.transferDirection === "IN") {
            await tx.financeAccount.update({
              where: { id: item.accountId },
              data: { balance: { decrement: item.amount } },
            });
          }
        }

        await tx.financeTransaction.deleteMany({
          where: {
            userId,
            transferGroup: existing.transferGroup,
            type: "TRANSFER",
          },
        });

        return;
      }

      await tx.financeAccount.update({
        where: { id: existing.accountId },
        data: {
          balance: existing.type === "INCOME"
            ? { decrement: existing.amount }
            : { increment: existing.amount },
        },
      });

      await tx.financeTransaction.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}