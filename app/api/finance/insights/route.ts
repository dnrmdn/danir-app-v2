import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { getUserIdFromSession } from "@/lib/finance/session"
import { NextRequest, NextResponse } from "next/server"

function monthRange(month: string) {
  const [y, m] = month.split("-").map((v) => Number(v))
  const start = new Date(y, m - 1, 1)
  const end = new Date(y, m, 0, 23, 59, 59, 999)
  return { start, end }
}

function prevMonth(month: string) {
  const [y, m] = month.split("-").map((v) => Number(v))
  const d = new Date(y, m - 1, 1)
  d.setMonth(d.getMonth() - 1)
  const yy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  return `${yy}-${mm}`
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

    const current = monthRange(month)
    const previousMonth = prevMonth(month)
    const previous = monthRange(previousMonth)

    const totals = await prisma.financeTransaction.groupBy({
      by: ["currency", "type"],
      where: {
        userId,
        date: { gte: current.start, lte: current.end },
        type: { in: ["INCOME", "EXPENSE"] },
      },
      _sum: { amount: true },
    })

    const totalsPrev = await prisma.financeTransaction.groupBy({
      by: ["currency", "type"],
      where: {
        userId,
        date: { gte: previous.start, lte: previous.end },
        type: { in: ["INCOME", "EXPENSE"] },
      },
      _sum: { amount: true },
    })

    const currencySet = new Set<string>()
    for (const t of totals) currencySet.add(t.currency)
    for (const t of totalsPrev) currencySet.add(t.currency)

    const getSum = (arr: typeof totals, currency: string, type: "INCOME" | "EXPENSE") => {
      const row = arr.find((x) => x.currency === currency && x.type === type)
      return Number(row?._sum.amount || 0)
    }

    const totalsByCurrency = Array.from(currencySet).sort().map((currency) => {
      const income = getSum(totals, currency, "INCOME")
      const expense = getSum(totals, currency, "EXPENSE")
      const prevExpense = getSum(totalsPrev, currency, "EXPENSE")
      const diff = expense - prevExpense
      const pct = prevExpense === 0 ? null : (diff / prevExpense) * 100
      return {
        currency,
        income,
        expense,
        balance: income - expense,
        prevExpense,
        monthOverMonthExpenseDiff: diff,
        monthOverMonthExpensePct: pct,
      }
    })

    const expenseByCategory = await prisma.financeTransaction.groupBy({
      by: ["currency", "categoryId"],
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: current.start, lte: current.end },
        categoryId: { not: null },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    })

    const categoryIds = Array.from(new Set(expenseByCategory.map((x) => x.categoryId).filter(Boolean) as number[]))
    const categories = await prisma.financeCategory.findMany({
      where: { userId, id: { in: categoryIds } },
      select: { id: true, name: true },
    })
    const categoryName = new Map(categories.map((c) => [c.id, c.name]))

    const topSpendingByCurrency = new Map<string, { category: string; amount: number }>()
    for (const row of expenseByCategory) {
      const currency = row.currency
      if (topSpendingByCurrency.has(currency)) continue
      const name = row.categoryId ? categoryName.get(row.categoryId) : null
      topSpendingByCurrency.set(currency, {
        category: name || "Unknown",
        amount: Number(row._sum.amount || 0),
      })
    }

    const budgets = await prisma.financeBudget.findMany({
      where: { userId, month },
      include: { category: { select: { id: true, name: true } } },
    })
    const budgetUsage = budgets.map((b) => {
      const spentRow = expenseByCategory.find((x) => x.currency === b.currency && x.categoryId === b.categoryId)
      const spent = Number(spentRow?._sum.amount || 0)
      const limit = Number(b.limit)
      const progress = limit === 0 ? 0 : (spent / limit) * 100
      return {
        id: b.id,
        month: b.month,
        currency: b.currency,
        category: b.category,
        limit,
        spent,
        progress,
        isOver: spent > limit,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        month,
        previousMonth,
        totalsByCurrency,
        topSpendingByCurrency: Object.fromEntries(topSpendingByCurrency),
        expenseByCategory: expenseByCategory.map((x) => ({
          currency: x.currency,
          categoryId: x.categoryId,
          category: x.categoryId ? categoryName.get(x.categoryId) : null,
          amount: Number(x._sum.amount || 0),
        })),
        budgetUsage,
      },
    })
  } catch (error) {
    console.error("finance insights GET error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
