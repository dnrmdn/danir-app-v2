import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { getUserIdFromSession } from "@/lib/finance/session";
import { NextRequest, NextResponse } from "next/server";

const incomeCategories = [
  { name: "Gaji & Pendapatan Tetap", children: ["Gaji pokok", "Komisi", "Bonus"] },
  { name: "Usaha & Freelance", children: ["Pendapatan freelance", "Jasa", "Usaha sendiri", "Afiliasi"] },
  { name: "Investasi", children: ["Dividen saham", "Bunga deposito"] },
  { name: "Pasif & Royalti", children: ["Royalti (buku, musik, dll)"] },
];

const expenseCategories = [
  {
    name: "🏠 Kebutuhan Rumah Tangga",
    children: [
      "Belanja bulanan",
      "Listrik",
      "Gas (LPG)",
      "Internet",
      "Paket data",
      "Laundry",
      "Iuran kebersihan",
      "TV kabel / streaming",
      "Perawatan rumah",
      "Sewa / Cicilan rumah",
    ],
  },
  {
    name: "🚗 Transportasi",
    children: [
      "Bensin / BBM",
      "Parkir",
      "Tol",
      "Servis kendaraan",
      "Angkutan umum",
      "Pajak kendaraan",
    ],
  },
  { name: "🎬 Hiburan & Lifestyle", children: ["Nonton bioskop", "Nonton konser", "Jajan / makan di luar"] },
  { name: "❤️ Kesehatan", children: ["Obat-obatan", "Vitamin", "Asuransi kesehatan", "Alat kesehatan"] },
  { name: "👶 Anak & Bayi", children: ["Popok", "Mainan anak"] },
  { name: "💄 Kebutuhan Pribadi", children: ["Skincare / salon", "Pakaian", "Alas kaki", "Gadget", "Aksesoris"] },
  { name: "🎓 Pendidikan", children: ["SPP", "Buku & alat tulis", "Perlengkapan belajar"] },
  { name: "🤝 Sosial", children: ["Sedekah", "Zakat", "Amplop pernikahan", "Hadiah ulang tahun"] },
  { name: "💳 Hutang & Cicilan", children: ["Cicilan kredit (HP, kendaraan, dll)", "Kartu kredit", "Pinjaman"] },
  { name: "🏦 Biaya Keuangan", children: ["Biaya admin bank", "Fee transfer", "Pajak investasi"] },
  { name: "🧾 Pajak", children: ["Pajak penghasilan"] },
  { name: "📈 Investasi & Tabungan", children: ["Tabungan rutin", "Dana darurat", "Reksadana", "Emas"] },
  { name: "🎯 Goal / Financial Goals", children: ["Tabungan rumah", "Tabungan nikah", "Tabungan liburan"] },
  { name: "🏢 Bisnis", children: ["Modal usaha", "Operasional usaha"] },
  { name: "❓ Lain-lain", children: ["Pengeluaran tak terduga", "Denda"] },
];

async function seedCategories(userId: string) {
  await prisma.$transaction(async (tx) => {
    // hapus child dulu
    await tx.financeCategory.deleteMany({
      where: {
        userId,
        isSystem: true,
        parentId: { not: null },
      },
    });

    // lalu parent
    await tx.financeCategory.deleteMany({
      where: {
        userId,
        isSystem: true,
        parentId: null,
      },
    });

    for (const cat of incomeCategories) {
      const parent = await tx.financeCategory.create({
        data: {
          userId,
          name: cat.name,
          kind: "INCOME",
          parentId: null,
          isSystem: true,
        },
      });

      for (const childName of cat.children) {
        await tx.financeCategory.create({
          data: {
            userId,
            name: childName,
            kind: "INCOME",
            parentId: parent.id,
            isSystem: true,
          },
        });
      }
    }

    for (const cat of expenseCategories) {
      const parent = await tx.financeCategory.create({
        data: {
          userId,
          name: cat.name,
          kind: "EXPENSE",
          parentId: null,
          isSystem: true,
        },
      });

      for (const childName of cat.children) {
        await tx.financeCategory.create({
          data: {
            userId,
            name: childName,
            kind: "EXPENSE",
            parentId: parent.id,
            isSystem: true,
          },
        });
      }
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = getUserIdFromSession(session);

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await seedCategories(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("finance categories seed POST error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}