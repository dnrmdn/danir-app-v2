import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma"
import { getUserIdFromSession } from "@/lib/finance/session"
import { buildUserWhereClause } from "@/lib/finance/partner-helper"
import { NextRequest, NextResponse } from "next/server"
import { createPlanLimitResponse, isMonthBeforeDate } from "@/lib/plan"
import { resolvePartnerAccess } from "@/lib/partner-access"

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

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const month = (req.nextUrl.searchParams.get("month") || "").trim()

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { success: false, error: "month harus format YYYY-MM" },
        { status: 400 }
      )
    }

    const view = req.nextUrl.searchParams.get("view")
    const connectionIdParam = req.nextUrl.searchParams.get("connectionId")
    const resolved = await resolvePartnerAccess({
      userId,
      view,
      connectionId: connectionIdParam,
      feature: "MONEY",
    })
    if (!resolved) return NextResponse.json({ success: false, error: "Invalid connection" }, { status: 403 })
    if (resolved.kind === "locked") {
      return NextResponse.json(resolved.payload, { status: resolved.status })
    }

    if (resolved.access.moneyHistoryStartAt && isMonthBeforeDate(month, resolved.access.moneyHistoryStartAt)) {
      return NextResponse.json(
        createPlanLimitResponse(
          `Free plan can only view money history from the last ${resolved.access.moneyHistoryMonths} months. Upgrade to Pro to open older months.`,
          resolved.access
        ),
        { status: 403 }
      )
    }

    const baseWhere = buildUserWhereClause(resolved.userIds, resolved.connectionId)
    const current = monthRange(month)
    const previousMonth = prevMonth(month)
    const previous = monthRange(previousMonth)
    const currentTotalsWhere: Prisma.FinanceTransactionWhereInput = {
      ...baseWhere,
      date: { gte: current.start, lte: current.end },
      type: { in: ["INCOME", "EXPENSE"] },
    }
    const previousTotalsWhere: Prisma.FinanceTransactionWhereInput = {
      ...baseWhere,
      date: { gte: previous.start, lte: previous.end },
      type: { in: ["INCOME", "EXPENSE"] },
    }
    const currentExpenseWhere: Prisma.FinanceTransactionWhereInput = {
      ...baseWhere,
      type: "EXPENSE",
      date: { gte: current.start, lte: current.end },
      categoryId: { not: null },
    }
    const previousExpenseWhere: Prisma.FinanceTransactionWhereInput = {
      ...baseWhere,
      type: "EXPENSE",
      date: { gte: previous.start, lte: previous.end },
      categoryId: { not: null },
    }
    const currentIncomeWhere: Prisma.FinanceTransactionWhereInput = {
      ...baseWhere,
      type: "INCOME",
      date: { gte: current.start, lte: current.end },
      categoryId: { not: null },
    }
    const previousIncomeWhere: Prisma.FinanceTransactionWhereInput = {
      ...baseWhere,
      type: "INCOME",
      date: { gte: previous.start, lte: previous.end },
      categoryId: { not: null },
    }
    const budgetWhere: Prisma.FinanceBudgetWhereInput = { ...baseWhere, month }
    const accountWhere: Prisma.FinanceAccountWhereInput = baseWhere
    const categoryWhere: Prisma.FinanceCategoryWhereInput = baseWhere

    const [totals, totalsPrev, expenseByCategory, expenseByCategoryPrevMonth, incomeByCategory, incomeByCategoryPrevMonth, budgets, accounts] =
      await Promise.all([
        prisma.financeTransaction.groupBy({
          by: ["currency", "type"],
          where: currentTotalsWhere,
          _sum: { amount: true },
          _count: { id: true },
        }),

        prisma.financeTransaction.groupBy({
          by: ["currency", "type"],
          where: previousTotalsWhere,
          _sum: { amount: true },
          _count: { id: true },
        }),

        prisma.financeTransaction.groupBy({
          by: ["currency", "categoryId"],
          where: currentExpenseWhere,
          _sum: { amount: true },
          orderBy: { _sum: { amount: "desc" } },
        }),

        prisma.financeTransaction.groupBy({
          by: ["currency", "categoryId"],
          where: previousExpenseWhere,
          _sum: { amount: true },
        }),

        prisma.financeTransaction.groupBy({
          by: ["currency", "categoryId"],
          where: currentIncomeWhere,
          _sum: { amount: true },
          orderBy: { _sum: { amount: "desc" } },
        }),

        prisma.financeTransaction.groupBy({
          by: ["currency", "categoryId"],
          where: previousIncomeWhere,
          _sum: { amount: true },
        }),

        prisma.financeBudget.findMany({
          where: budgetWhere,
          include: { category: { select: { id: true, name: true } } },
        }),

        prisma.financeAccount.findMany({
          where: accountWhere,
          select: {
            id: true,
            currency: true,
            balance: true,
          },
        }),
      ])

    const categories = await prisma.financeCategory.findMany({
      where: categoryWhere,
      select: { id: true, name: true, parentId: true },
    })

    const categoryMap = new Map(categories.map((c) => [c.id, c]))

    const getSum = (
      arr: typeof totals,
      currency: string,
      type: "INCOME" | "EXPENSE"
    ) => {
      const row = arr.find((x) => x.currency === currency && x.type === type)
      return Number(row?._sum.amount || 0)
    }

    const getCount = (
      arr: typeof totals,
      currency: string,
      type: "INCOME" | "EXPENSE"
    ) => {
      const row = arr.find((x) => x.currency === currency && x.type === type)
      return Number(row?._count.id || 0)
    }

    const accountBalanceMap = new Map<string, number>()
    for (const account of accounts) {
      const prev = accountBalanceMap.get(account.currency) || 0
      accountBalanceMap.set(
        account.currency,
        prev + Number(account.balance || 0)
      )
    }

    const currencySet = new Set<string>()
    for (const t of totals) currencySet.add(t.currency)
    for (const t of totalsPrev) currencySet.add(t.currency)
    for (const acc of accounts) currencySet.add(acc.currency)

    const totalsByCurrency = Array.from(currencySet)
      .sort()
      .map((currency) => {
        const income = getSum(totals, currency, "INCOME")
        const expense = getSum(totals, currency, "EXPENSE")
        const prevExpense = getSum(totalsPrev, currency, "EXPENSE")
        const prevIncome = getSum(totalsPrev, currency, "INCOME")
        
        const countIncome = getCount(totals, currency, "INCOME")
        const countExpense = getCount(totals, currency, "EXPENSE")
        const prevCountIncome = getCount(totalsPrev, currency, "INCOME")
        const prevCountExpense = getCount(totalsPrev, currency, "EXPENSE")

        const expenseDiff = expense - prevExpense
        const expensePct = prevExpense === 0 ? null : (expenseDiff / prevExpense) * 100

        const incomeDiff = income - prevIncome
        const incomePct = prevIncome === 0 ? null : (incomeDiff / prevIncome) * 100

        return {
          currency,
          income,
          expense,
          balance: accountBalanceMap.get(currency) || 0, // realtime dari account
          prevExpense,
          monthOverMonthExpenseDiff: expenseDiff,
          monthOverMonthExpensePct: expensePct,
          prevIncome,
          monthOverMonthIncomeDiff: incomeDiff,
          monthOverMonthIncomePct: incomePct,
          count: countIncome + countExpense,
          prevCount: prevCountIncome + prevCountExpense,
        }
      })

    const topSpendingByCurrency = new Map<
      string,
      { category: string; amount: number }
    >()

    for (const row of expenseByCategory) {
      const currency = row.currency
      if (topSpendingByCurrency.has(currency)) continue

      const cat = row.categoryId ? categoryMap.get(row.categoryId) : null

      topSpendingByCurrency.set(currency, {
        category: cat ? cat.name : "Unknown",
        amount: Number(row._sum.amount || 0),
      })
    }

    const budgetUsage = budgets.map((b) => {
      const spentRow = expenseByCategory.find(
        (x) => x.currency === b.currency && x.categoryId === b.categoryId
      )

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
        expenseByCategory: expenseByCategory.map((x) => {
          const cat = x.categoryId ? categoryMap.get(x.categoryId) : null;
          return {
            currency: x.currency,
            categoryId: x.categoryId,
            category: cat ? cat.name : null,
            parentId: cat ? cat.parentId : null,
            amount: Number(x._sum.amount || 0),
          };
        }),
        expenseByCategoryPrev: expenseByCategoryPrevMonth.map((x) => {
          const cat = x.categoryId ? categoryMap.get(x.categoryId) : null;
          return {
            currency: x.currency,
            categoryId: x.categoryId,
            category: cat ? cat.name : null,
            parentId: cat ? cat.parentId : null,
            amount: Number(x._sum.amount || 0),
          };
        }),
        incomeByCategory: incomeByCategory.map((x) => {
          const cat = x.categoryId ? categoryMap.get(x.categoryId) : null;
          return {
            currency: x.currency,
            categoryId: x.categoryId,
            category: cat ? cat.name : null,
            parentId: cat ? cat.parentId : null,
            amount: Number(x._sum.amount || 0),
          };
        }),
        incomeByCategoryPrev: incomeByCategoryPrevMonth.map((x) => {
          const cat = x.categoryId ? categoryMap.get(x.categoryId) : null;
          return {
            currency: x.currency,
            categoryId: x.categoryId,
            category: cat ? cat.name : null,
            parentId: cat ? cat.parentId : null,
            amount: Number(x._sum.amount || 0),
          };
        }),
        categoryMap: Array.from(categoryMap.values()).map((value) => ({ id: value.id, name: value.name, parentId: value.parentId })),
        budgetUsage,
      },
    })
  } catch (error) {
    console.error("finance insights GET error:", error)

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
