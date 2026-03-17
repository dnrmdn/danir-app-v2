import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { getUserIdFromSession } from "@/lib/finance/session"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = getUserIdFromSession(session)
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const { id: idParam } = await context.params
    const id = Number(idParam)
    if (!Number.isFinite(id)) return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 })

    const body = await req.json()
    const name = typeof body.name === "string" ? body.name.trim() : undefined
    const currency = typeof body.currency === "string" ? body.currency.trim().toUpperCase() : undefined
    const initialBalanceRaw = body.initialBalance
    const initialBalance =
      initialBalanceRaw === undefined
        ? undefined
        : typeof initialBalanceRaw === "number"
          ? String(initialBalanceRaw)
          : typeof initialBalanceRaw === "string"
            ? initialBalanceRaw.trim()
            : undefined

    const account = await prisma.financeAccount.findFirst({ where: { id, userId }, select: { id: true } })
    if (!account) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

    const updated = await prisma.financeAccount.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(currency ? { currency } : {}),
        ...(initialBalance !== undefined ? { initialBalance } : {}),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error("finance accounts PUT error:", error)
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

    const account = await prisma.financeAccount.findFirst({ where: { id, userId }, select: { id: true } })
    if (!account) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

    await prisma.financeAccount.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("finance accounts DELETE error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
