import prisma from "@/lib/db";
import type { PrismaClient } from "@/lib/generated/prisma";

type TxClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

const INCOME_CATEGORIES = [
  { name: "Gaji & Pendapatan Tetap", children: ["Gaji pokok", "Komisi", "Bonus"] },
  { name: "Usaha & Freelance", children: ["Pendapatan freelance", "Jasa", "Usaha sendiri", "Afiliasi"] },
  { name: "Investasi", children: ["Dividen saham", "Bunga deposito"] },
  { name: "Pasif & Royalti", children: ["Royalti (buku, musik, dll)"] },
];

const EXPENSE_CATEGORIES = [
  {
    name: "🏠 Kebutuhan Rumah Tangga",
    children: ["Belanja bulanan", "Listrik", "Gas (LPG)", "Internet", "Paket data", "Laundry", "Iuran kebersihan", "TV kabel / streaming", "Perawatan rumah", "Sewa / Cicilan rumah"],
  },
  { name: "🚗 Transportasi", children: ["Bensin / BBM", "Parkir", "Tol", "Servis kendaraan", "Angkutan umum", "Pajak kendaraan"] },
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

async function createCategoryTree(
  tx: TxClient,
  userId: string,
  kind: "INCOME" | "EXPENSE",
  categories: { name: string; children: string[] }[]
) {
  for (const cat of categories) {
    const parent = await tx.financeCategory.create({
      data: { userId, name: cat.name, kind, parentId: null, isSystem: true },
    });
    for (const childName of cat.children) {
      await tx.financeCategory.create({
        data: { userId, name: childName, kind, parentId: parent.id, isSystem: true },
      });
    }
  }
}

/**
 * Seeds default categories for a user if they have none.
 * Safe to call multiple times — only seeds when count === 0 (unless force=true).
 * When force=true, deletes existing system categories and re-creates them.
 */
export async function seedDefaultCategories(userId: string, force = false) {
  if (!force) {
    const count = await prisma.financeCategory.count({ where: { userId } });
    if (count > 0) return;
  }

  await prisma.$transaction(async (tx) => {
    if (force) {
      // Delete children first, then parents
      await tx.financeCategory.deleteMany({ where: { userId, isSystem: true, parentId: { not: null } } });
      await tx.financeCategory.deleteMany({ where: { userId, isSystem: true, parentId: null } });
    }

    await createCategoryTree(tx, userId, "INCOME", INCOME_CATEGORIES);
    await createCategoryTree(tx, userId, "EXPENSE", EXPENSE_CATEGORIES);
  });
}
