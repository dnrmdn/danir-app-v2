import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { randomUUID } from "crypto"
import { getUserIdFromSession } from "@/lib/finance/session"
import { NextRequest, NextResponse } from "next/server"

function parseDate(value: string | null) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = getUserIdFromSession(session)
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const fromAccountId = Number(body.fromAccountId)
    const toAccountId = Number(body.toAccountId)
    const amountRaw = body.amount
    const amount =
      typeof amountRaw === "number" ? String(amountRaw) : typeof amountRaw === "string" ? amountRaw.trim() : ""
    const date = parseDate(typeof body.date === "string" ? body.date : null) || new Date()
    const note = typeof body.note === "string" ? body.note.trim() : null

    if (!Number.isFinite(fromAccountId) || !Number.isFinite(toAccountId) || fromAccountId === toAccountId) {
      return NextResponse.json({ success: false, error: "Akun asal/tujuan tidak valid" }, { status: 400 })
    }
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ success: false, error: "Nominal harus > 0" }, { status: 400 })
    }

    const [from, to] = await Promise.all([
      prisma.financeAccount.findFirst({ where: { id: fromAccountId, userId } }),
      prisma.financeAccount.findFirst({ where: { id: toAccountId, userId } }),
    ])
    if (!from || !to) return NextResponse.json({ success: false, error: "Akun tidak ditemukan" }, { status: 404 })
    if (from.currency !== to.currency) {
      return NextResponse.json({ success: false, error: "Transfer beda currency belum didukung" }, { status: 400 })
    }

    const group = randomUUID()

    const [outTx, inTx] = await prisma.$transaction([
      prisma.financeTransaction.create({
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
      prisma.financeTransaction.create({
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
    ])

    return NextResponse.json({ success: true, data: { transferGroup: group, outTx, inTx } }, { status: 201 })
  } catch (error) {
    console.error("finance transfers POST error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
