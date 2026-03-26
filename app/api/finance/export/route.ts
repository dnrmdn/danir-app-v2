import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma"
import { getUserIdFromSession } from "@/lib/finance/session"
import { NextRequest, NextResponse } from "next/server"
import { createPlanLimitResponse, getPlanAccessForUserId, isMoneyDateRangeRestricted } from "@/lib/plan"

function parseDate(value: string | null) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function csvEscape(value: unknown) {
  const s = value === null || value === undefined ? "" : String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replaceAll('"', '""')}"`
  return s
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = getUserIdFromSession(session)
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const start = parseDate(req.nextUrl.searchParams.get("start"))
    const end = parseDate(req.nextUrl.searchParams.get("end"))
    const access = await getPlanAccessForUserId(userId)

    if (!access) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (isMoneyDateRangeRestricted(access, start, end)) {
      return NextResponse.json(
        createPlanLimitResponse(
          `Free plan can only export money history from the last ${access.moneyHistoryMonths} months. Upgrade to Pro to export older history.`,
          access
        ),
        { status: 403 }
      )
    }

    const where: Prisma.FinanceTransactionWhereInput = { userId }
    if (start || end) {
      where.date = {
        ...(access.moneyHistoryStartAt ? { gte: access.moneyHistoryStartAt } : {}),
        ...(start ? { gte: start } : {}),
        ...(end ? { lte: end } : {}),
      }
    } else if (access.moneyHistoryStartAt) {
      where.date = { gte: access.moneyHistoryStartAt }
    }

    const txs = await prisma.financeTransaction.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        account: true,
        category: true,
        tags: { include: { tag: true } },
      },
      take: 5000,
    })

    const header = [
      "id",
      "date",
      "type",
      "transferDirection",
      "account",
      "otherAccount",
      "currency",
      "amount",
      "category",
      "tags",
      "note",
    ].join(",")

    const rows = txs.map((t) => {
      const tags = t.tags.map((x) => x.tag.name).join("|")
      return [
        csvEscape(t.id),
        csvEscape(t.date.toISOString()),
        csvEscape(t.type),
        csvEscape(t.transferDirection || ""),
        csvEscape(t.account.name),
        csvEscape(t.otherAccountId ? String(t.otherAccountId) : ""),
        csvEscape(t.currency),
        csvEscape(String(t.amount)),
        csvEscape(t.category?.name || ""),
        csvEscape(tags),
        csvEscape(t.note || ""),
      ].join(",")
    })

    const csv = [header, ...rows].join("\n")

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (error) {
    console.error("finance export GET error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
