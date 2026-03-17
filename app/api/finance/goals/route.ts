import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { getUserIdFromSession } from "@/lib/finance/session"
import { NextRequest, NextResponse } from "next/server"

function parseDate(value: string | null) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = getUserIdFromSession(session)
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const goals = await prisma.financeGoal.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
    return NextResponse.json({ success: true, data: goals })
  } catch (error) {
    console.error("finance goals GET error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = getUserIdFromSession(session)
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const currency = typeof body.currency === "string" ? body.currency.trim().toUpperCase() : ""
    const targetAmountRaw = body.targetAmount
    const targetAmount =
      typeof targetAmountRaw === "number"
        ? String(targetAmountRaw)
        : typeof targetAmountRaw === "string"
          ? targetAmountRaw.trim()
          : ""
    const currentAmountRaw = body.currentAmount
    const currentAmount =
      currentAmountRaw === undefined
        ? "0"
        : typeof currentAmountRaw === "number"
          ? String(currentAmountRaw)
          : typeof currentAmountRaw === "string"
            ? currentAmountRaw.trim()
            : "0"
    const targetDate = parseDate(typeof body.targetDate === "string" ? body.targetDate : null)

    if (!name) return NextResponse.json({ success: false, error: "Nama goal wajib diisi" }, { status: 400 })
    if (!currency || currency.length !== 3) {
      return NextResponse.json({ success: false, error: "Currency tidak valid" }, { status: 400 })
    }
    if (!targetAmount || Number.isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
      return NextResponse.json({ success: false, error: "Target harus > 0" }, { status: 400 })
    }
    if (Number.isNaN(Number(currentAmount)) || Number(currentAmount) < 0) {
      return NextResponse.json({ success: false, error: "Current amount tidak valid" }, { status: 400 })
    }

    const goal = await prisma.financeGoal.create({
      data: { userId, name, currency, targetAmount, currentAmount, ...(targetDate ? { targetDate } : {}) },
    })

    return NextResponse.json({ success: true, data: goal }, { status: 201 })
  } catch (error) {
    console.error("finance goals POST error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
