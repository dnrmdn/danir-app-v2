import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import prisma from "@/lib/db";
import { Users, CreditCard, UserCheck, UserX, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const [
    totalUsers,
    freeUsers,
    proTrialUsers,
    proUsers,
    pendingPayments,
    approvedPayments,
    rejectedPayments,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { planType: "FREE" } }),
    prisma.user.count({ where: { planType: "PRO_TRIAL" } }),
    prisma.user.count({ where: { planType: "PRO" } }),
    prisma.paymentRequest.count({ where: { status: "PENDING" } }),
    prisma.paymentRequest.count({ where: { status: "APPROVED" } }),
    prisma.paymentRequest.count({ where: { status: "REJECTED" } }),
    prisma.user.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        planType: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    users: { total: totalUsers, free: freeUsers, proTrial: proTrialUsers, pro: proUsers },
    payments: { pending: pendingPayments, approved: approvedPayments, rejected: rejectedPayments },
    recentUsers,
  };
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/[0.03] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground dark:text-slate-400">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground dark:text-white tracking-tight">
        {value.toLocaleString()}
      </p>
      {sub && (
        <p className="mt-1 text-xs text-muted-foreground dark:text-slate-500">{sub}</p>
      )}
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    FREE: "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300",
    PRO_TRIAL: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    PRO: "bg-cyan-100 text-cyan-700 dark:bg-cyan-400/20 dark:text-cyan-300",
  };
  const labels: Record<string, string> = {
    FREE: "Free",
    PRO_TRIAL: "Pro Trial",
    PRO: "Pro",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[plan] ?? styles.FREE}`}>
      {labels[plan] ?? plan}
    </span>
  );
}

export default async function AdminDashboardPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/login");

  const stats = await getStats();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground dark:text-white tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">
          Overview of all users and payment activity.
        </p>
      </div>

      {/* User Stats */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground dark:text-slate-500 mb-3">
          Users
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total Users"
            value={stats.users.total}
            icon={Users}
            color="bg-cyan-100 text-cyan-700 dark:bg-cyan-400/20 dark:text-cyan-300"
          />
          <StatCard
            label="Free Plan"
            value={stats.users.free}
            icon={UserX}
            color="bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300"
            sub="No active subscription"
          />
          <StatCard
            label="Pro Trial"
            value={stats.users.proTrial}
            icon={TrendingUp}
            color="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
            sub="Trial period active"
          />
          <StatCard
            label="Pro Users"
            value={stats.users.pro}
            icon={UserCheck}
            color="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
            sub="Paid subscribers"
          />
        </div>
      </div>

      {/* Payment Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground dark:text-slate-500">
            Payments
          </h2>
          <Link
            href="/admin/payments"
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Pending"
            value={stats.payments.pending}
            icon={Clock}
            color="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
            sub="Awaiting review"
          />
          <StatCard
            label="Approved"
            value={stats.payments.approved}
            icon={CheckCircle}
            color="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
          />
          <StatCard
            label="Rejected"
            value={stats.payments.rejected}
            icon={XCircle}
            color="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300"
          />
        </div>
      </div>

      {/* Recent Users */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground dark:text-slate-500">
            Recent Users
          </h2>
          <Link
            href="/admin/users"
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/[0.03] overflow-hidden">
          {stats.recentUsers.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground dark:text-slate-500">
              No users yet.
            </div>
          ) : (
            <div className="divide-y divide-border dark:divide-white/5">
              {stats.recentUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/admin/users`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/50 dark:hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-400/20 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-slate-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <PlanBadge plan={user.planType} />
                  <p className="text-xs text-muted-foreground dark:text-slate-500 flex-shrink-0 hidden sm:block">
                    {formatDate(user.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
