/**
 * One-time CLI script to promote a user to ADMIN role.
 *
 * Usage:
 *   npx tsx scripts/set-admin.ts <email>
 *
 * Example:
 *   npx tsx scripts/set-admin.ts your@email.com
 */
import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Usage: npx tsx scripts/set-admin.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    console.error(`❌ User with email "${email}" not found.`);
    process.exit(1);
  }

  if (user.role === "ADMIN") {
    console.log(`✅ User "${user.name}" (${user.email}) is already ADMIN.`);
    process.exit(0);
  }

  await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  console.log(`✅ Promoted "${user.name}" (${user.email}) to ADMIN role.`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
