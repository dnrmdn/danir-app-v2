import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma"
import { getUserIdFromSession } from "@/lib/finance/session"
import { resolveFinanceUserIds, buildUserWhereClause } from "@/lib/finance/partner-helper"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = getUserIdFromSession(session)
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const view = req.nextUrl.searchParams.get("view")
    const connectionId = req.nextUrl.searchParams.get("connectionId")
    const resolved = await resolveFinanceUserIds(userId, view, connectionId)
    if (!resolved) return NextResponse.json({ success: false, error: "Invalid connection" }, { status: 403 })

    const whereClause: Prisma.FinanceAccountWhereInput = buildUserWhereClause(resolved.userIds, resolved.connectionId)

    const count = await prisma.financeAccount.count({ where: whereClause })
    if (count === 0 && !view) {
      await prisma.financeAccount.createMany({
        data: [
          { userId, name: "Cash", type: "CASH", currency: "IDR", initialBalance: "0" },
          { userId, name: "Bank", type: "BANK", currency: "IDR", initialBalance: "0" },
          { userId, name: "E-wallet", type: "EWALLET", currency: "IDR", initialBalance: "0" },
        ],
        skipDuplicates: true,
      })
    }

    const accounts = await prisma.financeAccount.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ success: true, data: accounts })
  } catch (error) {
    console.error("finance accounts GET error:", error)
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
    const type = body.type as "CASH" | "BANK" | "EWALLET"
    const currency = typeof body.currency === "string" ? body.currency.trim().toUpperCase() : ""
    const initialBalanceRaw = body.initialBalance
    const initialBalance =
      typeof initialBalanceRaw === "number"
        ? String(initialBalanceRaw)
        : typeof initialBalanceRaw === "string"
          ? initialBalanceRaw.trim()
          : "0"

    if (!name) return NextResponse.json({ success: false, error: "Nama akun wajib diisi" }, { status: 400 })
    if (!["CASH", "BANK", "EWALLET"].includes(type)) {
      return NextResponse.json({ success: false, error: "Tipe akun tidak valid" }, { status: 400 })
    }
    if (!currency || currency.length !== 3) {
      return NextResponse.json({ success: false, error: "Currency harus 3 huruf (contoh: IDR)" }, { status: 400 })
    }

    const account = await prisma.financeAccount.create({
      data: {
        userId,
        name,
        type,
        currency,
        initialBalance,
        balance: initialBalance,
      },
    });

    return NextResponse.json({ success: true, data: account }, { status: 201 })
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2002") {
      return NextResponse.json({ success: false, error: "Nama akun sudah ada" }, { status: 409 })
    }
    console.error("finance accounts POST error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
