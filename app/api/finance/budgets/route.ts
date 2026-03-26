import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { getUserIdFromSession } from "@/lib/finance/session"
import { resolveFinanceUserIds, buildUserWhereClause } from "@/lib/finance/partner-helper"
import { NextRequest, NextResponse } from "next/server"

function monthRange(month: string) {
  const [y, m] = month.split("-").map((v) => Number(v))
  const start = new Date(y, m - 1, 1)
  const end = new Date(y, m, 0, 23, 59, 59, 999)
  return { start, end }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = getUserIdFromSession(session)
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const month = (req.nextUrl.searchParams.get("month") || "").trim()
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ success: false, error: "month harus format YYYY-MM" }, { status: 400 })
    }

    const view = req.nextUrl.searchParams.get("view")
    const connectionId = req.nextUrl.searchParams.get("connectionId")
    const resolved = await resolveFinanceUserIds(userId, view, connectionId)
    if (!resolved) return NextResponse.json({ success: false, error: "Invalid connection" }, { status: 403 })

    const whereClause = buildUserWhereClause(resolved.userIds, resolved.connectionId)

    const budgets = await prisma.financeBudget.findMany({
      where: { ...whereClause as any, month },
      include: { category: true },
      orderBy: [{ currency: "asc" }, { category: { name: "asc" } }],
    })

    const { start, end } = monthRange(month)

    const spent = await prisma.financeTransaction.groupBy({
      by: ["categoryId", "currency"],
      where: {
        ...whereClause as any,
        type: "EXPENSE",
        date: { gte: start, lte: end },
        categoryId: { not: null },
      },
      _sum: { amount: true },
    })

    const spentMap = new Map<string, string>()
    for (const s of spent) {
      if (!s.categoryId) continue
      const key = `${s.categoryId}-${s.currency}`
      spentMap.set(key, String(s._sum.amount || "0"))
    }

    const data = budgets.map((b) => ({
      id: b.id,
      month: b.month,
      currency: b.currency,
      limit: b.limit,
      category: b.category,
      spent: spentMap.get(`${b.categoryId}-${b.currency}`) || "0",
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("finance budgets GET error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = getUserIdFromSession(session)
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const month = typeof body.month === "string" ? body.month.trim() : ""
    const categoryId = Number(body.categoryId)
    const currency = typeof body.currency === "string" ? body.currency.trim().toUpperCase() : ""
    const limitRaw = body.limit
    const limit =
      typeof limitRaw === "number" ? String(limitRaw) : typeof limitRaw === "string" ? limitRaw.trim() : ""

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ success: false, error: "month harus format YYYY-MM" }, { status: 400 })
    }
    if (!Number.isFinite(categoryId)) {
      return NextResponse.json({ success: false, error: "Category wajib dipilih" }, { status: 400 })
    }
    if (!currency || currency.length !== 3) {
      return NextResponse.json({ success: false, error: "Currency tidak valid" }, { status: 400 })
    }
    if (!limit || Number.isNaN(Number(limit)) || Number(limit) <= 0) {
      return NextResponse.json({ success: false, error: "Limit harus > 0" }, { status: 400 })
    }

    const category = await prisma.financeCategory.findFirst({ where: { id: categoryId, userId, kind: "EXPENSE" } })
    if (!category) return NextResponse.json({ success: false, error: "Category tidak ditemukan" }, { status: 404 })

    const budget = await prisma.financeBudget.upsert({
      where: { userId_categoryId_month_currency: { userId, categoryId, month, currency } },
      create: { userId, categoryId, month, currency, limit },
      update: { limit },
      include: { category: true },
    })

    return NextResponse.json({ success: true, data: budget })
  } catch (error) {
    console.error("finance budgets POST error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
