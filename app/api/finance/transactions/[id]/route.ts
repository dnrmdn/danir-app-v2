import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
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

  await prisma.financeTag.createMany({
    data: names.map((name) => ({ userId, name })),
    skipDuplicates: true,
  })

  return prisma.financeTag.findMany({
    where: { userId, name: { in: names } },
    select: { id: true, name: true },
  })
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = getUserIdFromSession(session)
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const { id: idParam } = await context.params
    const id = Number(idParam)
    if (!Number.isFinite(id)) return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 })

    const existing = await prisma.financeTransaction.findFirst({
      where: { id, userId },
      select: { id: true, accountId: true },
    })
    if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

    const body = await req.json()
    const type = body.type as "INCOME" | "EXPENSE" | "TRANSFER" | undefined
    const accountId = body.accountId === undefined ? undefined : Number(body.accountId)
    const amountRaw = body.amount
    const amount =
      amountRaw === undefined
        ? undefined
        : typeof amountRaw === "number"
          ? String(amountRaw)
          : typeof amountRaw === "string"
            ? amountRaw.trim()
            : undefined
    const currency = body.currency === undefined ? undefined : String(body.currency).trim().toUpperCase()
    const date = body.date === undefined ? undefined : parseDate(String(body.date)) || undefined
    const note = body.note === undefined ? undefined : typeof body.note === "string" ? body.note.trim() : null
    const categoryId = body.categoryId === undefined ? undefined : body.categoryId === null ? null : Number(body.categoryId)

    if (type !== undefined && !["INCOME", "EXPENSE", "TRANSFER"].includes(type)) {
      return NextResponse.json({ success: false, error: "Type tidak valid" }, { status: 400 })
    }
    if (accountId !== undefined && !Number.isFinite(accountId)) {
      return NextResponse.json({ success: false, error: "Account tidak valid" }, { status: 400 })
    }
    if (amount !== undefined && (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0)) {
      return NextResponse.json({ success: false, error: "Nominal harus > 0" }, { status: 400 })
    }
    if (currency !== undefined && currency.length !== 3) {
      return NextResponse.json({ success: false, error: "Currency tidak valid" }, { status: 400 })
    }
    if (categoryId !== undefined && categoryId !== null && !Number.isFinite(categoryId)) {
      return NextResponse.json({ success: false, error: "Category tidak valid" }, { status: 400 })
    }

    if (accountId !== undefined) {
      const account = await prisma.financeAccount.findFirst({ where: { id: accountId, userId }, select: { id: true } })
      if (!account) return NextResponse.json({ success: false, error: "Account tidak ditemukan" }, { status: 404 })
    }

    if (categoryId !== undefined && categoryId !== null) {
      const category = await prisma.financeCategory.findFirst({ where: { id: categoryId, userId }, select: { id: true } })
      if (!category) return NextResponse.json({ success: false, error: "Category tidak ditemukan" }, { status: 404 })
    }

    const tags = body.tags === undefined ? undefined : await upsertTags(userId, body.tags)

    const updated = await prisma.financeTransaction.update({
      where: { id },
      data: {
        ...(type !== undefined ? { type } : {}),
        ...(accountId !== undefined ? { accountId } : {}),
        ...(amount !== undefined ? { amount } : {}),
        ...(currency !== undefined ? { currency } : {}),
        ...(date !== undefined ? { date } : {}),
        ...(note !== undefined ? { note } : {}),
        ...(categoryId !== undefined ? { categoryId } : {}),
      },
      include: {
        account: true,
        category: true,
        tags: { include: { tag: true } },
      },
    })

    if (tags !== undefined) {
      await prisma.financeTransactionTag.deleteMany({ where: { transactionId: id } })
      if (tags.length > 0) {
        await prisma.financeTransactionTag.createMany({
          data: tags.map((t) => ({ transactionId: id, tagId: t.id })),
          skipDuplicates: true,
        })
      }
    }

    const refreshed = await prisma.financeTransaction.findFirst({
      where: { id, userId },
      include: { account: true, category: true, tags: { include: { tag: true } } },
    })

    return NextResponse.json({
      success: true,
      data: refreshed
        ? {
            id: refreshed.id,
            type: refreshed.type,
            transferDirection: refreshed.transferDirection,
            otherAccountId: refreshed.otherAccountId,
            amount: refreshed.amount,
            currency: refreshed.currency,
            date: refreshed.date,
            note: refreshed.note,
            category: refreshed.category,
            account: refreshed.account,
            tags: refreshed.tags.map((x) => x.tag),
          }
        : {
            id: updated.id,
          },
    })
  } catch (error) {
    console.error("finance transactions PUT error:", error)
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

    const existing = await prisma.financeTransaction.findFirst({ where: { id, userId }, select: { id: true } })
    if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

    await prisma.financeTransaction.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("finance transactions DELETE error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
