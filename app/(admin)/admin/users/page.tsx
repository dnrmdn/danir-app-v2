import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import prisma from "@/lib/db";
import { UsersTable } from "./users-table";

async function getInitialUsers() {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        planType: true,
        subscriptionStatus: true,
        trialEndAt: true,
        createdAt: true,
      },
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    pagination: {
      total,
      page: 1,
      limit: 20,
      totalPages: Math.ceil(total / 20),
    },
  };
}

export default async function AdminUsersPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/login");

  const { users, pagination } = await getInitialUsers();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground dark:text-white tracking-tight">
          Users
        </h1>
        <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">
          {pagination.total.toLocaleString()} registered users
        </p>
      </div>
      <UsersTable
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialUsers={users as any}
        initialPagination={pagination}
      />
    </div>
  );
}
