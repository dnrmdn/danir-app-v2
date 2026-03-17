import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { getUserIdFromSession } from "@/lib/finance/session"
import { NextRequest, NextResponse } from "next/server"

function parseDate(value: string | null) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = getUserIdFromSession(session)
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const { id: idParam } = await context.params
    const id = Number(idParam)
    if (!Number.isFinite(id)) return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 })

    const existing = await prisma.financeGoal.findFirst({ where: { id, userId }, select: { id: true } })
    if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

    const body = await req.json()
    const name = body.name === undefined ? undefined : typeof body.name === "string" ? body.name.trim() : ""
    const currency =
      body.currency === undefined ? undefined : typeof body.currency === "string" ? body.currency.trim().toUpperCase() : ""
    const targetAmountRaw = body.targetAmount
    const targetAmount =
      targetAmountRaw === undefined
        ? undefined
        : typeof targetAmountRaw === "number"
          ? String(targetAmountRaw)
          : typeof targetAmountRaw === "string"
            ? targetAmountRaw.trim()
            : undefined
    const currentAmountRaw = body.currentAmount
    const currentAmount =
      currentAmountRaw === undefined
        ? undefined
        : typeof currentAmountRaw === "number"
          ? String(currentAmountRaw)
          : typeof currentAmountRaw === "string"
            ? currentAmountRaw.trim()
            : undefined
    const targetDate = body.targetDate === undefined ? undefined : parseDate(String(body.targetDate))

    if (currency !== undefined && currency.length !== 3) {
      return NextResponse.json({ success: false, error: "Currency tidak valid" }, { status: 400 })
    }
    if (targetAmount !== undefined && (!targetAmount || Number.isNaN(Number(targetAmount)) || Number(targetAmount) <= 0)) {
      return NextResponse.json({ success: false, error: "Target harus > 0" }, { status: 400 })
    }
    if (currentAmount !== undefined && (Number.isNaN(Number(currentAmount)) || Number(currentAmount) < 0)) {
      return NextResponse.json({ success: false, error: "Current amount tidak valid" }, { status: 400 })
    }

    const goal = await prisma.financeGoal.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(currency !== undefined ? { currency } : {}),
        ...(targetAmount !== undefined ? { targetAmount } : {}),
        ...(currentAmount !== undefined ? { currentAmount } : {}),
        ...(targetDate !== undefined ? { targetDate } : {}),
      },
    })

    return NextResponse.json({ success: true, data: goal })
  } catch (error) {
    console.error("finance goals PUT error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = getUserIdFromSession(session)
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const { id: idParam } = await context.params
    const id = Number(idParam)
    if (!Number.isFinite(id)) return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 })

    const existing = await prisma.financeGoal.findFirst({ where: { id, userId }, select: { id: true } })
    if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

    await prisma.financeGoal.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("finance goals DELETE error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
