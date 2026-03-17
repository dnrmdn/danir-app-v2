import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { FinanceTransferDirection, FinanceTransactionType, Prisma } from "@/lib/generated/prisma"
import { getUserIdFromSession } from "@/lib/finance/session"
import { NextRequest, NextResponse } from "next/server"

function parseDate(value: string | null) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

async function upsertTags(userId: string, rawTags: unknown) {
  const tags =
    Array.isArray(rawTags) ? rawTags : typeof rawTags === "string" ? rawTags.split(",") : []
  const names = Array.from(
    new Set(
      tags
        .map((t) => (typeof t === "string" ? t.trim() : ""))
        .filter((t) => t.length > 0)
    )
  )

  if (names.length === 0) return []

  const existing = await prisma.financeTag.findMany({
    where: { userId, name: { in: names } },
    select: { id: true, name: true },
  })

  const existingByName = new Map(existing.map((t) => [t.name, t.id]))
  const toCreate = names.filter((n) => !existingByName.has(n))

  if (toCreate.length > 0) {
    await prisma.financeTag.createMany({
      data: toCreate.map((name) => ({ userId, name })),
      skipDuplicates: true,
    })
  }

  const all = await prisma.financeTag.findMany({
    where: { userId, name: { in: names } },
    select: { id: true, name: true },
  })

  return all
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = getUserIdFromSession(session)
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const start = parseDate(req.nextUrl.searchParams.get("start"))
    const end = parseDate(req.nextUrl.searchParams.get("end"))
    const accountIdParam = req.nextUrl.searchParams.get("accountId")
    const typeParam = req.nextUrl.searchParams.get("type")

    const where: Prisma.FinanceTransactionWhereInput = { userId }
    if (start || end) {
      where.date = {
        ...(start ? { gte: start } : {}),
        ...(end ? { lte: end } : {}),
      }
    }
    if (accountIdParam) {
      const accountId = Number(accountIdParam)
      if (Number.isFinite(accountId)) where.accountId = accountId
    }
    if (typeParam && ["INCOME", "EXPENSE", "TRANSFER"].includes(typeParam)) {
      where.type = typeParam as FinanceTransactionType
    }

    const transactions = await prisma.financeTransaction.findMany({
      where,
      orderBy: { date: "desc" },
      take: 200,
      include: {
        account: true,
        category: true,
        tags: { include: { tag: true } },
      },
    })

    const data = transactions.map((t) => ({
      id: t.id,
      type: t.type,
      transferDirection: t.transferDirection,
      otherAccountId: t.otherAccountId,
      amount: t.amount,
      currency: t.currency,
      date: t.date,
      note: t.note,
      category: t.category,
      account: t.account,
      tags: t.tags.map((x) => x.tag),
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("finance transactions GET error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = getUserIdFromSession(session)
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const type = body.type as "INCOME" | "EXPENSE" | "TRANSFER"
    const accountId = Number(body.accountId)
    const amountRaw = body.amount
    const amount =
      typeof amountRaw === "number"
        ? String(amountRaw)
        : typeof amountRaw === "string"
          ? amountRaw.trim()
          : ""
    const currency = typeof body.currency === "string" ? body.currency.trim().toUpperCase() : ""
    const date = parseDate(typeof body.date === "string" ? body.date : null) || new Date()
    const note = typeof body.note === "string" ? body.note.trim() : null
    const categoryId = body.categoryId === undefined || body.categoryId === null ? null : Number(body.categoryId)

    if (!["INCOME", "EXPENSE", "TRANSFER"].includes(type)) {
      return NextResponse.json({ success: false, error: "Type tidak valid" }, { status: 400 })
    }
    if (!Number.isFinite(accountId)) {
      return NextResponse.json({ success: false, error: "Account wajib dipilih" }, { status: 400 })
    }
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ success: false, error: "Nominal harus > 0" }, { status: 400 })
    }

    const account = await prisma.financeAccount.findFirst({ where: { id: accountId, userId } })
    if (!account) return NextResponse.json({ success: false, error: "Account tidak ditemukan" }, { status: 404 })

    const currencyFinal = currency && currency.length === 3 ? currency : account.currency

    let categoryFinalId: number | null = null
    if (categoryId !== null) {
      if (!Number.isFinite(categoryId)) {
        return NextResponse.json({ success: false, error: "Category tidak valid" }, { status: 400 })
      }
      const category = await prisma.financeCategory.findFirst({ where: { id: categoryId, userId } })
      if (!category) return NextResponse.json({ success: false, error: "Category tidak ditemukan" }, { status: 404 })
      categoryFinalId = category.id
    }

    const tags = await upsertTags(userId, body.tags)

    const transferDirectionRaw = body.transferDirection
    const transferDirection =
      transferDirectionRaw === "IN" || transferDirectionRaw === "OUT"
        ? (transferDirectionRaw as FinanceTransferDirection)
        : null

    if (type === "TRANSFER" && !transferDirection) {
      return NextResponse.json({ success: false, error: "transferDirection wajib untuk transfer" }, { status: 400 })
    }

    const created = await prisma.financeTransaction.create({
      data: {
        userId,
        accountId,
        type,
        amount,
        currency: currencyFinal,
        date,
        note,
        ...(categoryFinalId ? { categoryId: categoryFinalId } : {}),
        ...(type === "TRANSFER"
          ? {
              transferDirection,
              otherAccountId: body.otherAccountId ? Number(body.otherAccountId) : null,
              transferGroup: typeof body.transferGroup === "string" ? body.transferGroup : null,
            }
          : {}),
        tags: {
          createMany: {
            data: tags.map((t) => ({ tagId: t.id })),
            skipDuplicates: true,
          },
        },
      },
      include: {
        account: true,
        category: true,
        tags: { include: { tag: true } },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: created.id,
          type: created.type,
          transferDirection: created.transferDirection,
          otherAccountId: created.otherAccountId,
          amount: created.amount,
          currency: created.currency,
          date: created.date,
          note: created.note,
          category: created.category,
          account: created.account,
          tags: created.tags.map((x) => x.tag),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("finance transactions POST error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
