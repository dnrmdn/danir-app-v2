import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserIdFromSession } from "@/lib/finance/session";
import { toDecimal } from "@/lib/finance/money";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = getUserIdFromSession(session)
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const goalId = Number(body.goalId)
    const accountId = Number(body.accountId)
    const amount = toDecimal(body.amount)

    if (Number.isNaN(goalId) || Number.isNaN(accountId) || amount.lte(0)) {
      return NextResponse.json({ success: false, error: "Data tidak valid. Periksa input Anda." }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const goal = await tx.financeGoal.findUnique({ where: { id: goalId, userId } })
      if (!goal) throw new Error("Target tabungan tidak ditemukan");

      const account = await tx.financeAccount.findUnique({ where: { id: accountId, userId } })
      if (!account) throw new Error("Akun sumber tidak ditemukan")

      if (account.balance.lt(amount)) {
        throw new Error(`Saldo akun ${account.name} tidak mencukupi`)
      }

      await tx.financeAccount.update({
        where: { id: accountId },
        data: { balance: { decrement: amount } }
      })

      const updatedGoal = await tx.financeGoal.update({
        where: { id: goalId },
        data: { currentAmount: { increment: amount } }
      })

      await tx.financeTransaction.create({
        data: {
          type: "EXPENSE",
          currency: account.currency,
          amount,
          date: new Date(),
          note: `Isi tabungan untuk: ${goal.name}`,
          accountId: account.id,
          userId,
        }
      })

      return updatedGoal
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("finance goals contribute POST error:", error)
    return NextResponse.json({ success: false, error: message }, { status: error instanceof Error ? 400 : 500 })
  }
}
