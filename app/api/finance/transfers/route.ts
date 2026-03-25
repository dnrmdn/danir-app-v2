import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
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

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = getUserIdFromSession(session);

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const fromAccountId = Number(body.fromAccountId);
    const toAccountId = Number(body.toAccountId);
    const amount = toDecimal(body.amount);
    const date = parseDate(body.date);
    const note = typeof body.note === "string" ? body.note.trim() : null;

    if (!Number.isFinite(fromAccountId) || !Number.isFinite(toAccountId) || fromAccountId === toAccountId) {
      return NextResponse.json({ success: false, error: "Akun asal/tujuan tidak valid" }, { status: 400 });
    }

    assertPositiveDecimal(amount);

    const result = await prisma.$transaction(async (tx) => {
      const [from, to] = await Promise.all([
        tx.financeAccount.findFirst({ where: { id: fromAccountId, userId } }),
        tx.financeAccount.findFirst({ where: { id: toAccountId, userId } }),
      ]);

      if (!from || !to) {
        throw new Error("Akun tidak ditemukan");
      }

      if (from.currency !== to.currency) {
        throw new Error("Transfer beda currency belum didukung");
      }

      assertSufficientBalance(new Prisma.Decimal(from.balance), amount);

      const group = randomUUID();

      await tx.financeAccount.update({
        where: { id: from.id },
        data: { balance: { decrement: amount } },
      });

      await tx.financeAccount.update({
        where: { id: to.id },
        data: { balance: { increment: amount } },
      });

      const [outTx, inTx] = await Promise.all([
        tx.financeTransaction.create({
          data: {
            userId,
            accountId: from.id,
            otherAccountId: to.id,
            type: "TRANSFER",
            transferDirection: "OUT",
            transferGroup: group,
            amount,
            currency: from.currency,
            date,
            note,
          },
        }),
        tx.financeTransaction.create({
          data: {
            userId,
            accountId: to.id,
            otherAccountId: from.id,
            type: "TRANSFER",
            transferDirection: "IN",
            transferGroup: group,
            amount,
            currency: to.currency,
            date,
            note,
          },
        }),
      ]);

      return { transferGroup: group, outTx, inTx };
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}