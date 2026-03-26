"use client";

import { useState, useCallback, useRef } from "react";
import { Search, ChevronLeft, ChevronRight, Shield, Sparkles, ArrowDown, Loader2, CheckCircle2, X } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "USER" | "ADMIN";
  planType: "FREE" | "PRO_TRIAL" | "PRO";
  subscriptionStatus: string;
  trialEndAt: string | null;
  createdAt: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type Props = {
  initialUsers: User[];
  initialPagination: Pagination;
};

// ─── Confirmation Dialog ───────────────────────────────────────────────────────

type ConfirmDialogProps = {
  user: User;
  action: "PRO" | "FREE";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
};

function ConfirmDialog({ user, action, onConfirm, onCancel, isLoading }: ConfirmDialogProps) {
  const isPro = action === "PRO";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border dark:border-white/10 bg-popover dark:bg-[#0b1525] shadow-2xl p-6">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted dark:hover:bg-white/10 transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${isPro ? "bg-cyan-100 dark:bg-cyan-400/20" : "bg-slate-100 dark:bg-slate-700/50"}`}>
          {isPro
            ? <Sparkles className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            : <ArrowDown className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          }
        </div>

        <h3 className="text-base font-semibold text-foreground dark:text-white">
          {isPro ? "Upgrade to Pro?" : "Downgrade to Free?"}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground dark:text-slate-400">
          {isPro
            ? <>Set <span className="font-medium text-foreground dark:text-white">{user.name}</span> to <span className="font-medium text-cyan-600 dark:text-cyan-400">Pro plan</span>. This grants full access immediately.</>
            : <>Downgrade <span className="font-medium text-foreground dark:text-white">{user.name}</span> to <span className="font-medium text-foreground dark:text-white">Free plan</span>. They will lose Pro access.</>
          }
        </p>

        <div className="mt-5 flex gap-2.5">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-border dark:border-white/10 px-4 py-2 text-sm font-medium text-foreground dark:text-white hover:bg-muted dark:hover:bg-white/5 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-70 ${
              isPro
                ? "bg-cyan-500 hover:bg-cyan-600 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400"
                : "bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
            }`}
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isPro ? "Set Pro" : "Set Free"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Badges ────────────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    FREE: "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300",
    PRO_TRIAL: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    PRO: "bg-cyan-100 text-cyan-700 dark:bg-cyan-400/20 dark:text-cyan-200",
  };
  const labels: Record<string, string> = {
    FREE: "Free",
    PRO_TRIAL: "Pro Trial",
    PRO: "Pro",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${styles[plan] ?? styles.FREE}`}>
      {plan === "PRO" && <Sparkles className="h-3 w-3" />}
      {labels[plan] ?? plan}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    TRIALING: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    EXPIRED: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300",
    CANCELED: "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300",
    NONE: "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.NONE}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

// ─── Plan Action Button ────────────────────────────────────────────────────────

type PlanActionButtonProps = {
  user: User;
  onAction: (userId: string, planType: "PRO" | "FREE") => void;
};

function PlanActionButton({ user, onAction }: PlanActionButtonProps) {
  if (user.planType === "PRO") {
    return (
      <button
        onClick={() => onAction(user.id, "FREE")}
        className="inline-flex items-center gap-1 rounded-lg border border-border dark:border-white/10 px-2.5 py-1 text-xs font-medium text-muted-foreground dark:text-slate-400 hover:bg-muted dark:hover:bg-white/5 hover:text-foreground dark:hover:text-white transition"
        title="Downgrade to Free"
      >
        <ArrowDown className="h-3 w-3" />
        Set Free
      </button>
    );
  }

  return (
    <button
      onClick={() => onAction(user.id, "PRO")}
      className="inline-flex items-center gap-1 rounded-lg bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-500/90 dark:hover:bg-cyan-400 px-2.5 py-1 text-xs font-semibold text-white transition shadow-sm shadow-cyan-500/20"
      title="Upgrade to Pro"
    >
      <Sparkles className="h-3 w-3" />
      Set Pro
    </button>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────

type Toast = {
  id: number;
  message: string;
  type: "success" | "error";
};

// ─── Main Table ────────────────────────────────────────────────────────────────

export function UsersTable({ initialUsers, initialPagination }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  // Pending action state (what's being confirmed)
  const [pendingAction, setPendingAction] = useState<{
    user: User;
    action: "PRO" | "FREE";
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Fetch users ─────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (q: string, p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: q, page: String(p), limit: "20" });
      const res = await fetch(`/api/admin/users?${params}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data.users);
        setPagination(json.data.pagination);
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    void fetchUsers(value, 1);
  };

  const handlePage = (p: number) => {
    setPage(p);
    void fetchUsers(search, p);
  };

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = (message: string, type: "success" | "error") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  // ── Plan action ──────────────────────────────────────────────────────────────
  const handleActionRequest = (userId: string, action: "PRO" | "FREE") => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setPendingAction({ user, action });
  };

  const handleActionConfirm = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    try {
      const newPlan = pendingAction.action; // "PRO" or "FREE"
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: pendingAction.user.id,
          planType: newPlan,
          // Also update subscriptionStatus to match
          subscriptionStatus: newPlan === "PRO" ? "ACTIVE" : "NONE",
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Something went wrong");
      }

      // Update row in state immediately
      setUsers((prev) =>
        prev.map((u) =>
          u.id === pendingAction.user.id
            ? {
                ...u,
                planType: newPlan,
                subscriptionStatus: newPlan === "PRO" ? "ACTIVE" : "NONE",
              }
            : u
        )
      );

      showToast(
        newPlan === "PRO"
          ? `${pendingAction.user.name} upgraded to Pro ✓`
          : `${pendingAction.user.name} downgraded to Free`,
        "success"
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Action failed", "error");
    } finally {
      setActionLoading(false);
      setPendingAction(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Confirmation Dialog */}
      {pendingAction && (
        <ConfirmDialog
          user={pendingAction.user}
          action={pendingAction.action}
          onConfirm={handleActionConfirm}
          onCancel={() => !actionLoading && setPendingAction(null)}
          isLoading={actionLoading}
        />
      )}

      {/* Toast stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg transition-all ${
              t.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-900/30 dark:text-emerald-200"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {t.type === "success"
              ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
              : <X className="h-4 w-4 flex-shrink-0 text-red-500" />
            }
            {t.message}
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-slate-500" />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-xl border border-border dark:border-white/10 bg-background dark:bg-white/[0.03] pl-9 pr-4 py-2.5 text-sm text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-primary/30 transition"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/[0.02] overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-sm text-muted-foreground dark:text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading users…
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground dark:text-slate-500">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border dark:border-white/10 bg-muted/30 dark:bg-white/[0.02]">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-500">User</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-500">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-500">Plan</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-500 hidden md:table-cell">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-500 hidden lg:table-cell">Trial End</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-500 hidden lg:table-cell">Joined</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-400/20 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground dark:text-white truncate max-w-[150px]">{user.name}</p>
                          <p className="text-xs text-muted-foreground dark:text-slate-500 truncate max-w-[150px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {user.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <PlanBadge plan={user.planType} />
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <StatusBadge status={user.subscriptionStatus} />
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground dark:text-slate-500 hidden lg:table-cell text-xs">
                      {formatDate(user.trialEndAt)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground dark:text-slate-500 hidden lg:table-cell text-xs">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {user.role !== "ADMIN" && (
                        <PlanActionButton
                          user={user}
                          onAction={handleActionRequest}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground dark:text-slate-500">
            Showing {((page - 1) * pagination.limit) + 1}–{Math.min(page * pagination.limit, pagination.total)} of {pagination.total} users
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePage(page - 1)}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border dark:border-white/10 text-muted-foreground hover:bg-muted dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-sm text-foreground dark:text-white">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePage(page + 1)}
              disabled={page >= pagination.totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border dark:border-white/10 text-muted-foreground hover:bg-muted dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
