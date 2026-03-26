async function main() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  const categories = await prisma.financeCategory.findMany();
  console.log("Categories:", JSON.stringify(categories, null, 2));

  const tags = await prisma.financeTag.findMany();
  console.log("Tags:", JSON.stringify(tags, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
