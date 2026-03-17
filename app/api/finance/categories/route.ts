import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { getUserIdFromSession } from "@/lib/finance/session"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = getUserIdFromSession(session)
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const count = await prisma.financeCategory.count({ where: { userId } })
    if (count === 0) {
      await prisma.financeCategory.createMany({
        data: [
          { userId, name: "Salary", kind: "INCOME" },
          { userId, name: "Bonus", kind: "INCOME" },
          { userId, name: "Other", kind: "INCOME" },
          { userId, name: "Food", kind: "EXPENSE" },
          { userId, name: "Transport", kind: "EXPENSE" },
          { userId, name: "Bills", kind: "EXPENSE" },
          { userId, name: "Entertainment", kind: "EXPENSE" },
          { userId, name: "Health", kind: "EXPENSE" },
          { userId, name: "Education", kind: "EXPENSE" },
        ],
        skipDuplicates: true,
      })
    }

    const categories = await prisma.financeCategory.findMany({
      where: { userId },
      orderBy: [{ kind: "asc" }, { name: "asc" }],
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error("finance categories GET error:", error)
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
    const kind = body.kind as "INCOME" | "EXPENSE"

    if (!name) return NextResponse.json({ success: false, error: "Nama kategori wajib diisi" }, { status: 400 })
    if (!["INCOME", "EXPENSE"].includes(kind)) {
      return NextResponse.json({ success: false, error: "Kind tidak valid" }, { status: 400 })
    }

    const category = await prisma.financeCategory.create({ data: { userId, name, kind } })
    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2002") {
      return NextResponse.json({ success: false, error: "Kategori sudah ada" }, { status: 409 })
    }
    console.error("finance categories POST error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
