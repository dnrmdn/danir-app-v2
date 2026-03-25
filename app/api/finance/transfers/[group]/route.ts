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

export async function PUT(req: NextRequest, context: { params: Promise<{ group: string }> }) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        const userId = getUserIdFromSession(session);

        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { group } = await context.params;
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
            const existing = await tx.financeTransaction.findMany({
                where: { userId, transferGroup: group, type: "TRANSFER" },
            });

            if (existing.length !== 2) {
                throw new Error("Transfer tidak ditemukan");
            }

            for (const item of existing) {
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

            const [from, to] = await Promise.all([
                tx.financeAccount.findFirst({ where: { id: fromAccountId, userId } }),
                tx.financeAccount.findFirst({ where: { id: toAccountId, userId } }),
            ]);

            if (!from || !to) {
                throw new Error("Akun tidak ditemukan");
            }

            if (from.id === to.id) {
                throw new Error("Akun asal/tujuan tidak valid");
            }

            if (from.currency !== to.currency) {
                throw new Error("Transfer beda currency belum didukung");
            }

            assertSufficientBalance(new Prisma.Decimal(from.balance), amount);

            await tx.financeAccount.update({
                where: { id: from.id },
                data: { balance: { decrement: amount } },
            });

            await tx.financeAccount.update({
                where: { id: to.id },
                data: { balance: { increment: amount } },
            });

            const outExisting = existing.find((x) => x.transferDirection === "OUT");
            const inExisting = existing.find((x) => x.transferDirection === "IN");

            if (!outExisting || !inExisting) {
                throw new Error("Transfer tidak valid");
            }

            const nextGroup = randomUUID();

            const [outTx, inTx] = await Promise.all([
                tx.financeTransaction.update({
                    where: { id: outExisting.id },
                    data: {
                        accountId: from.id,
                        otherAccountId: to.id,
                        amount,
                        currency: from.currency,
                        date,
                        note,
                        transferGroup: nextGroup,
                        transferDirection: "OUT",
                        type: "TRANSFER",
                    },
                }),
                tx.financeTransaction.update({
                    where: { id: inExisting.id },
                    data: {
                        accountId: to.id,
                        otherAccountId: from.id,
                        amount,
                        currency: to.currency,
                        date,
                        note,
                        transferGroup: nextGroup,
                        transferDirection: "IN",
                        type: "TRANSFER",
                    },
                }),
            ]);

            return { transferGroup: nextGroup, outTx, inTx };
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ group: string }> }) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        const userId = getUserIdFromSession(session);

        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { group } = await context.params;

        await prisma.$transaction(async (tx) => {
            const existing = await tx.financeTransaction.findMany({
                where: { userId, transferGroup: group, type: "TRANSFER" },
            });

            if (existing.length !== 2) {
                throw new Error("Transfer tidak ditemukan");
            }

            for (const item of existing) {
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
                where: { userId, transferGroup: group, type: "TRANSFER" },
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}