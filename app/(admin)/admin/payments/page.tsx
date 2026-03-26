import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import prisma from "@/lib/db";
import { Clock } from "lucide-react";
import { PaymentsTable } from "./payments-table";

async function getPayments() {
  return prisma.paymentRequest.findMany({
    orderBy: { submittedAt: "desc" },
    take: 50,
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });
}

export default async function AdminPaymentsPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/login");

  const payments = await getPayments();
  const pending = payments.filter((p) => p.status === "PENDING").length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-foreground dark:text-white tracking-tight uppercase">
            Payment Requests
          </h1>
          {pending > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white animate-pulse">
              {pending}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">
          Verify QRIS and Bank Transfer proofs from users upgrading to Pro.
        </p>
      </div>

      {/* Table Container */}
      <div className="rounded-[2rem] border border-border dark:border-white/10 bg-card dark:bg-[#08111f]/40 overflow-hidden shadow-sm">
        {payments.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted dark:bg-white/5 text-muted-foreground opacity-50">
              <Clock className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-foreground dark:text-white uppercase tracking-tight">No payment requests</p>
            <p className="mt-1 text-xs text-muted-foreground dark:text-slate-500">
              User payment confirmations will appear here for review.
            </p>
          </div>
        ) : (
          <PaymentsTable payments={JSON.parse(JSON.stringify(payments))} />
        )}
      </div>
    </div>
  );
}
