import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma"
import { getUserIdFromSession } from "@/lib/finance/session"
import { resolveFinanceUserIds, buildUserWhereClause } from "@/lib/finance/partner-helper"
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

    const view = req.nextUrl.searchParams.get("view")
    const connectionId = req.nextUrl.searchParams.get("connectionId")
    const resolved = await resolveFinanceUserIds(userId, view, connectionId)
    if (!resolved) return NextResponse.json({ success: false, error: "Invalid connection" }, { status: 403 })

    const whereClause: Prisma.FinanceGoalWhereInput = buildUserWhereClause(resolved.userIds, resolved.connectionId)

    const goals = await prisma.financeGoal.findMany({ where: whereClause, orderBy: { createdAt: "desc" } })
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

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = getUserIdFromSession(session)
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = Number(searchParams.get("id"))
    if (Number.isNaN(id)) return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 })

    await prisma.$transaction(async (tx) => {
      const goal = await tx.financeGoal.findUnique({
        where: { id, userId }
      })
      if (!goal) throw new Error("Goal tidak ditemukan")

      // 1. Cari atau buat parent category "Investasi & tabungan"
      let parentCat = await tx.financeCategory.findFirst({
        where: { userId, name: "Investasi & tabungan", kind: "EXPENSE", parentId: null }
      })
      if (!parentCat) {
        parentCat = await tx.financeCategory.create({
          data: {
            userId,
            name: "Investasi & tabungan",
            kind: "EXPENSE",
            classification: "SAVING",
            isSystem: true,
            color: "#10b981",
            icon: "PiggyBank"
          }
        })
      }

      // 2. Cari atau buat sub category "Tabungan rutin"
      let subCat = await tx.financeCategory.findFirst({
        where: { userId, name: "Tabungan rutin", kind: "EXPENSE", parentId: parentCat.id }
      })
      if (!subCat) {
        subCat = await tx.financeCategory.create({
          data: {
            userId,
            name: "Tabungan rutin",
            kind: "EXPENSE",
            parentId: parentCat.id,
            classification: "SAVING",
            isSystem: true,
            color: "#10b981",
            icon: "Save"
          }
        })
      }

      // 3. Update semua transaksi pendaftaran (isi) tabungan
      await tx.financeTransaction.updateMany({
        where: { userId, note: `Isi tabungan untuk: ${goal.name}` },
        data: {
          categoryId: subCat.id,
          note: `Pindahan dari goal ${goal.name}`
        }
      })

      // 4. Hapus goal
      await tx.financeGoal.delete({
        where: { id: goal.id }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error"
    console.error("finance goals DELETE error:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
