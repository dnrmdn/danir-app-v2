const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.financeCategory.findMany();
  console.log("Categories:", JSON.stringify(categories, null, 2));

  const tags = await prisma.financeTag.findMany();
  console.log("Tags:", JSON.stringify(tags, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
