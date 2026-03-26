const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pendingPayment = await prisma.paymentRequest.findFirst({
    where: { status: "PENDING" }
  });
  
  if (!pendingPayment) {
    console.log("No pending payment found");
    return;
  }

  console.log("Found pending payment with ID:", pendingPayment.id);
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.paymentRequest.findUnique({
        where: { id: pendingPayment.id },
        select: { id: true, status: true, userId: true },
      });

      const updatedPayment = await tx.paymentRequest.update({
        where: { id: pendingPayment.id },
        data: {
          status: "APPROVED",
          notes: "testing",
          reviewedAt: new Date(),
          reviewedBy: "dummy-admin",
        }
      });

      const now = new Date();
      const thirtyDaysLater = new Date(now);
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

      await tx.user.update({
        where: { id: current.userId },
        data: {
          planType: "PRO",
          subscriptionStatus: "ACTIVE",
          proStartedAt: now,
          subscriptionEndsAt: thirtyDaysLater,
        }
      });
      
      return updatedPayment;
    });
    
    console.log("Transaction succeeded:", result.id);
  } catch (err) {
    console.error("Transaction failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
