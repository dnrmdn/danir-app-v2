import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
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

    const whereClause = buildUserWhereClause(resolved.userIds, resolved.connectionId)

    const tags = await prisma.financeTag.findMany({ where: whereClause as any, orderBy: { name: "asc" } })
    return NextResponse.json({ success: true, data: tags })
  } catch (error) {
    console.error("finance tags GET error:", error)
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
    if (!name) return NextResponse.json({ success: false, error: "Nama tag wajib diisi" }, { status: 400 })

    const tag = await prisma.financeTag.create({ data: { userId, name } })
    return NextResponse.json({ success: true, data: tag }, { status: 201 })
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2002") {
      return NextResponse.json({ success: false, error: "Tag sudah ada" }, { status: 409 })
    }
    console.error("finance tags POST error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
