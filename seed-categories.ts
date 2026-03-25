import { PrismaClient } from "./lib/generated/prisma";

const prisma = new PrismaClient();

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
  const tx = prisma;
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
  }

async function main() {
  const users = await prisma.user.findMany();
  
  if (users.length === 0) {
    console.log("❌ Tidak ada user di database. Harap login / buat user terlebih dahulu.");
    return;
  }
  
  console.log(`Sedang memproses database untuk ${users.length} user...`);
  
  for (const user of users) {
    console.log(`⏳ Seeding kategori untuk user: ${user.name || user.email || user.username || user.id}`);
    await seedCategories(user.id);
    console.log(`✅ Sukses seeding untuk user: ${user.id}`);
  }
  
  console.log("🎉 Seeding selesai!");
}

main()
  .catch(e => {
    console.error("Terjadi error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
