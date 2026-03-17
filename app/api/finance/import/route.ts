import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { getUserIdFromSession } from "@/lib/finance/session"
import { NextRequest, NextResponse } from "next/server"

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return { header: [], rows: [] as string[][] }

  const parseLine = (line: string) => {
    const out: string[] = []
    let i = 0
    let current = ""
    let inQuotes = false

    while (i < line.length) {
      const ch = line[i]
      if (inQuotes) {
        if (ch === "\"") {
          const next = line[i + 1]
          if (next === "\"") {
            current += "\""
            i += 2
            continue
          }
          inQuotes = false
          i += 1
          continue
        }
        current += ch
        i += 1
        continue
      }

      if (ch === "\"") {
        inQuotes = true
        i += 1
        continue
      }
      if (ch === ",") {
        out.push(current)
        current = ""
        i += 1
        continue
      }
      current += ch
      i += 1
    }
    out.push(current)
    return out.map((s) => s.trim())
  }

  const header = parseLine(lines[0]).map((h) => h.toLowerCase())
  const rows = lines.slice(1).map(parseLine)
  return { header, rows }
}

function getCell(row: string[], header: string[], key: string) {
  const idx = header.indexOf(key)
  return idx === -1 ? "" : (row[idx] || "").trim()
}

function parseDate(value: string) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = getUserIdFromSession(session)
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get("file")
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: "File tidak ditemukan" }, { status: 400 })
    }

    const text = await file.text()
    const { header, rows } = parseCsv(text)

    const required = ["date", "type", "account", "amount"]
    for (const r of required) {
      if (!header.includes(r)) {
        return NextResponse.json({ success: false, error: `Header CSV wajib punya kolom: ${required.join(", ")}` }, { status: 400 })
      }
    }

    const createdIds: number[] = []
    const errors: Array<{ row: number; error: string }> = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const dateValue = getCell(row, header, "date")
      const typeValue = getCell(row, header, "type").toUpperCase()
      const accountName = getCell(row, header, "account")
      const currencyValue = getCell(row, header, "currency").toUpperCase()
      const amountValue = getCell(row, header, "amount")
      const categoryName = getCell(row, header, "category")
      const tagsValue = getCell(row, header, "tags")
      const note = getCell(row, header, "note") || null

      if (!["INCOME", "EXPENSE"].includes(typeValue)) {
        errors.push({ row: i + 2, error: "type harus INCOME atau EXPENSE" })
        continue
      }
      const date = parseDate(dateValue) || new Date()
      if (!accountName) {
        errors.push({ row: i + 2, error: "account wajib diisi" })
        continue
      }
      if (!amountValue || Number.isNaN(Number(amountValue)) || Number(amountValue) <= 0) {
        errors.push({ row: i + 2, error: "amount tidak valid" })
        continue
      }

      const account =
        (await prisma.financeAccount.findFirst({ where: { userId, name: accountName } })) ||
        (await prisma.financeAccount.create({
          data: { userId, name: accountName, type: "CASH", currency: currencyValue && currencyValue.length === 3 ? currencyValue : "IDR", initialBalance: "0" },
        }))

      const currencyFinal = currencyValue && currencyValue.length === 3 ? currencyValue : account.currency

      const kind = typeValue === "INCOME" ? "INCOME" : "EXPENSE"
      let categoryId: number | null = null
      if (categoryName) {
        const category =
          (await prisma.financeCategory.findFirst({ where: { userId, name: categoryName, kind } })) ||
          (await prisma.financeCategory.create({ data: { userId, name: categoryName, kind } }))
        categoryId = category.id
      }

      const tagNames = tagsValue
        ? tagsValue.split(/[|,]/).map((t) => t.trim()).filter(Boolean)
        : []

      const tags = tagNames.length
        ? await (async () => {
            await prisma.financeTag.createMany({ data: tagNames.map((name) => ({ userId, name })), skipDuplicates: true })
            return prisma.financeTag.findMany({ where: { userId, name: { in: tagNames } }, select: { id: true } })
          })()
        : []

      const created = await prisma.financeTransaction.create({
        data: {
          userId,
          accountId: account.id,
          type: typeValue as "INCOME" | "EXPENSE",
          amount: amountValue,
          currency: currencyFinal,
          date,
          note,
          ...(categoryId ? { categoryId } : {}),
          tags: { createMany: { data: tags.map((t) => ({ tagId: t.id })), skipDuplicates: true } },
        },
        select: { id: true },
      })
      createdIds.push(created.id)
    }

    return NextResponse.json({ success: true, data: { created: createdIds.length, createdIds, errors } })
  } catch (error) {
    console.error("finance import POST error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
