"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, ArrowDownRight, ArrowLeftRight, ArrowUpRight, Download, FileUp, Landmark, Pencil, PiggyBank, Plus, RefreshCcw, Save, Trash2, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useUserSession } from "@/hooks/useUserSession";

type MoneyNavId = "dashboard" | "transactions" | "categories" | "budgets" | "accounts" | "analytics" | "goals";

type FinanceAccount = {
  id: number;
  name: string;
  type: "CASH" | "BANK" | "EWALLET";
  currency: string;
  initialBalance: string;
};

type FinanceCategory = {
  id: number;
  name: string;
  kind: "INCOME" | "EXPENSE";
};

type FinanceTag = {
  id: number;
  name: string;
};

type FinanceTransaction = {
  id: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  transferDirection?: "IN" | "OUT" | null;
  otherAccountId?: number | null;
  amount: string;
  currency: string;
  date: string;
  note?: string | null;
  category?: FinanceCategory | null;
  account: FinanceAccount;
  tags: FinanceTag[];
};

type FinanceGoal = {
  id: number;
  name: string;
  currency: string;
  targetAmount: string;
  currentAmount: string;
  targetDate?: string | null;
};

type FinanceBudgetRow = {
  id: number;
  month: string;
  currency: string;
  limit: string;
  spent: string;
  category: { id: number; name: string };
};

type InsightsResponse = {
  month: string;
  previousMonth: string;
  totalsByCurrency: Array<{
    currency: string;
    income: number;
    expense: number;
    balance: number;
    prevExpense: number;
    monthOverMonthExpenseDiff: number;
    monthOverMonthExpensePct: number | null;
  }>;
  topSpendingByCurrency: Record<string, { category: string; amount: number }>;
  expenseByCategory: Array<{ currency: string; category: string | null; amount: number }>;
  budgetUsage: Array<{
    id: number;
    currency: string;
    category: { id: number; name: string };
    limit: number;
    spent: number;
    progress: number;
    isOver: boolean;
  }>;
};

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function monthString(date = new Date()) {
  return format(date, "yyyy-MM");
}

function monthRange(month: string) {
  const [y, m] = month.split("-").map((v) => Number(v));
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  return { start, end };
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}

function asIncomeExpense(value: string): "INCOME" | "EXPENSE" {
  return value === "INCOME" ? "INCOME" : "EXPENSE";
}

function asAccountType(value: string): "CASH" | "BANK" | "EWALLET" {
  if (value === "BANK") return "BANK";
  if (value === "EWALLET") return "EWALLET";
  return "CASH";
}

export default function MoneyPage() {
  const { session } = useUserSession();
  const [active, setActive] = useState<MoneyNavId>("dashboard");
  const [month, setMonth] = useState<string>(() => monthString());
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [tags, setTags] = useState<FinanceTag[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [budgets, setBudgets] = useState<FinanceBudgetRow[]>([]);
  const [goals, setGoals] = useState<FinanceGoal[]>([]);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [txEditing, setTxEditing] = useState<FinanceTransaction | null>(null);
  const [txForm, setTxForm] = useState({
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    accountId: "",
    categoryId: "",
    amount: "",
    currency: "",
    date: format(new Date(), "yyyy-MM-dd"),
    note: "",
    tags: "",
  });

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    note: "",
  });

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    kind: "EXPENSE" as "INCOME" | "EXPENSE",
  });

  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: "",
    type: "CASH" as "CASH" | "BANK" | "EWALLET",
    currency: "IDR",
    initialBalance: "0",
  });

  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    categoryId: "",
    currency: "IDR",
    limit: "",
  });

  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({
    name: "",
    currency: "IDR",
    targetAmount: "",
    currentAmount: "0",
    targetDate: "",
  });

  const importInputRef = useRef<HTMLInputElement | null>(null);

  const expenseCategories = useMemo(() => categories.filter((c) => c.kind === "EXPENSE"), [categories]);
  const incomeCategories = useMemo(() => categories.filter((c) => c.kind === "INCOME"), [categories]);

  const monthStartEnd = useMemo(() => monthRange(month), [month]);

  const reloadCore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, c, t, g] = await Promise.all([
        fetch("/api/finance/accounts").then((r) => r.json()),
        fetch("/api/finance/categories").then((r) => r.json()),
        fetch("/api/finance/tags").then((r) => r.json()),
        fetch("/api/finance/goals").then((r) => r.json()),
      ]);

      if (a.success) setAccounts(a.data);
      if (c.success) setCategories(c.data);
      if (t.success) setTags(t.data);
      if (g.success) setGoals(g.data);
    } catch {
      setError("Gagal memuat data money tracker");
    } finally {
      setLoading(false);
    }
  }, []);

  const reloadMonthData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const start = monthStartEnd.start.toISOString();
      const end = monthStartEnd.end.toISOString();

      const [tx, b, ins] = await Promise.all([
        fetch(`/api/finance/transactions?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`).then((r) => r.json()),
        fetch(`/api/finance/budgets?month=${encodeURIComponent(month)}`).then((r) => r.json()),
        fetch(`/api/finance/insights?month=${encodeURIComponent(month)}`).then((r) => r.json()),
      ]);

      if (tx.success) setTransactions(tx.data);
      if (b.success) setBudgets(b.data);
      if (ins.success) setInsights(ins.data);
    } catch {
      setError("Gagal memuat data bulanan");
    } finally {
      setLoading(false);
    }
  }, [month, monthStartEnd]);

  useEffect(() => {
    if (!session) return;
    reloadCore();
  }, [session, reloadCore]);

  useEffect(() => {
    if (!session) return;
    reloadMonthData();
  }, [session, reloadMonthData]);

  const resetTxForm = () => {
    setTxEditing(null);
    setTxForm({
      type: "EXPENSE",
      accountId: accounts[0]?.id ? String(accounts[0].id) : "",
      categoryId: "",
      amount: "",
      currency: "",
      date: format(new Date(), "yyyy-MM-dd"),
      note: "",
      tags: "",
    });
  };

  const openNewTransaction = () => {
    resetTxForm();
    setTxDialogOpen(true);
  };

  const openEditTransaction = (tx: FinanceTransaction) => {
    setTxEditing(tx);
    setTxForm({
      type: tx.type === "INCOME" ? "INCOME" : "EXPENSE",
      accountId: String(tx.account.id),
      categoryId: tx.category?.id ? String(tx.category.id) : "",
      amount: String(tx.amount),
      currency: tx.currency,
      date: format(new Date(tx.date), "yyyy-MM-dd"),
      note: tx.note || "",
      tags: tx.tags.map((x) => x.name).join(", "),
    });
    setTxDialogOpen(true);
  };

  const saveTransaction = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        type: txForm.type,
        accountId: Number(txForm.accountId),
        categoryId: txForm.categoryId ? Number(txForm.categoryId) : null,
        amount: Number(txForm.amount),
        currency: txForm.currency || undefined,
        date: new Date(txForm.date).toISOString(),
        note: txForm.note || undefined,
        tags: txForm.tags,
      };

      const res = await fetch(txEditing ? `/api/finance/transactions/${txEditing.id}` : "/api/finance/transactions", {
        method: txEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Gagal menyimpan transaksi");
        return;
      }
      setTxDialogOpen(false);
      await reloadMonthData();
    } catch {
      setError("Gagal menyimpan transaksi");
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/finance/transactions/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Gagal menghapus transaksi");
        return;
      }
      await reloadMonthData();
    } catch {
      setError("Gagal menghapus transaksi");
    } finally {
      setLoading(false);
    }
  };

  const saveTransfer = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        fromAccountId: Number(transferForm.fromAccountId),
        toAccountId: Number(transferForm.toAccountId),
        amount: Number(transferForm.amount),
        date: new Date(transferForm.date).toISOString(),
        note: transferForm.note || undefined,
      };
      const res = await fetch("/api/finance/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Gagal transfer");
        return;
      }
      setTransferDialogOpen(false);
      setTransferForm({
        fromAccountId: "",
        toAccountId: "",
        amount: "",
        date: format(new Date(), "yyyy-MM-dd"),
        note: "",
      });
      await reloadMonthData();
    } catch {
      setError("Gagal transfer");
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/finance/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryForm.name, kind: categoryForm.kind }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Gagal membuat kategori");
        return;
      }
      setCategoryDialogOpen(false);
      setCategoryForm({ name: "", kind: "EXPENSE" });
      await reloadCore();
    } catch {
      setError("Gagal membuat kategori");
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/finance/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountForm),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Gagal membuat akun");
        return;
      }
      setAccountDialogOpen(false);
      setAccountForm({
        name: "",
        type: "CASH",
        currency: "IDR",
        initialBalance: "0",
      });
      await reloadCore();
    } catch {
      setError("Gagal membuat akun");
    } finally {
      setLoading(false);
    }
  };

  const saveBudget = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/finance/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          categoryId: Number(budgetForm.categoryId),
          currency: budgetForm.currency,
          limit: Number(budgetForm.limit),
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Gagal menyimpan budget");
        return;
      }
      setBudgetDialogOpen(false);
      setBudgetForm({ categoryId: "", currency: "IDR", limit: "" });
      await reloadMonthData();
    } catch {
      setError("Gagal menyimpan budget");
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: goalForm.name,
        currency: goalForm.currency,
        targetAmount: Number(goalForm.targetAmount),
        currentAmount: Number(goalForm.currentAmount || 0),
        targetDate: goalForm.targetDate ? new Date(goalForm.targetDate).toISOString() : undefined,
      };
      const res = await fetch("/api/finance/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Gagal membuat goal");
        return;
      }
      setGoalDialogOpen(false);
      setGoalForm({
        name: "",
        currency: "IDR",
        targetAmount: "",
        currentAmount: "0",
        targetDate: "",
      });
      await reloadCore();
    } catch {
      setError("Gagal membuat goal");
    } finally {
      setLoading(false);
    }
  };

  const exportUrl = useMemo(() => {
    const start = monthStartEnd.start.toISOString();
    const end = monthStartEnd.end.toISOString();
    return `/api/finance/export?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
  }, [monthStartEnd]);

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (file: File | null) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/finance/import", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Gagal import");
        return;
      }
      await reloadCore();
      await reloadMonthData();
    } catch {
      setError("Gagal import");
    } finally {
      setLoading(false);
      if (importInputRef.current) importInputRef.current.value = "";
    }
  };

  const chartPieData = useMemo(() => {
    const list = (insights?.expenseByCategory || []).filter((x) => x.amount > 0);
    const merged = new Map<string, number>();
    for (const row of list) {
      const name = row.category || "Unknown";
      merged.set(name, (merged.get(name) || 0) + row.amount);
    }
    return Array.from(merged.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [insights]);

  const chartLineData = useMemo(() => {
    const end = monthStartEnd.end;
    const start = new Date(end);
    start.setMonth(start.getMonth() - 5);
    start.setDate(1);

    const buckets = new Map<string, number>();
    for (let i = 0; i < 6; i++) {
      const d = new Date(start);
      d.setMonth(start.getMonth() + i);
      buckets.set(format(d, "yyyy-MM"), 0);
    }

    for (const tx of transactions) {
      if (tx.type !== "EXPENSE") continue;
      const key = format(new Date(tx.date), "yyyy-MM");
      if (!buckets.has(key)) continue;
      buckets.set(key, (buckets.get(key) || 0) + toNumber(tx.amount));
    }

    return Array.from(buckets.entries()).map(([m, expense]) => ({ month: m, expense }));
  }, [transactions, monthStartEnd]);

  const dashboardTotals = useMemo(() => {
    if (!insights) return [];
    return insights.totalsByCurrency;
  }, [insights]);

  function formatCompactNumber(value: number) {
    if (Math.abs(value) >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
    if (Math.abs(value) >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
    if (Math.abs(value) >= 1_000) return (value / 1_000).toFixed(1) + "K";
    return value.toString();
  }

  const totalIncome = useMemo(() => dashboardTotals.reduce((sum, item) => sum + item.income, 0), [dashboardTotals]);

  const totalExpense = useMemo(() => dashboardTotals.reduce((sum, item) => sum + item.expense, 0), [dashboardTotals]);

  const totalBalance = useMemo(() => dashboardTotals.reduce((sum, item) => sum + item.balance, 0), [dashboardTotals]);

  const budgetAlertCount = useMemo(() => (insights?.budgetUsage || []).filter((item) => item.progress >= 80).length, [insights]);

  const recentTransactions = useMemo(() => transactions.slice(0, 6), [transactions]);

  if (!session) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <Card className="rounded-[1.25rem] border border-primary/10 p-5 sm:rounded-3xl sm:p-8">
          <div className="mb-2 text-2xl font-black sm:text-3xl">Money Tracker</div>
          <div className="text-sm text-muted-foreground sm:text-base">Login dulu untuk pakai fitur money tracker.</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] pb-20 sm:pb-28">
      <div className="mx-auto max-w-7xl px-2 py-4 sm:px-4 sm:py-8 lg:px-6">
        <div className="mb-5 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary sm:text-sm">Money Tracker</div>
            <h1 className="text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl">Finance</h1>
            <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">Transaksi, budget, goals, multi account, export/import, dan insight bulanan.</p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground sm:text-xs sm:tracking-widest">Month</Label>
              <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-9 w-[136px] rounded-xl text-xs sm:h-10 sm:w-[160px] sm:rounded-2xl sm:text-sm" />
            </div>

            <Button
              variant="outline"
              className="h-9 rounded-xl border border-white/10 bg-[#07111f]/80 px-3 text-xs text-slate-100 hover:border-cyan-300/20 hover:bg-white/10 hover:text-white sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm"
              onClick={() => reloadMonthData()}
              disabled={loading}
            >
              <RefreshCcw className="mr-1.5 h-4 w-4 sm:mr-2" />
              Refresh
            </Button>

            <Button
              variant="outline"
              className="h-9 rounded-xl border border-white/10 bg-[#07111f]/80 px-3 text-xs text-slate-100 hover:border-cyan-300/20 hover:bg-white/10 hover:text-white sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm"
              asChild
            >
              <a href={exportUrl}>
                <Download className="mr-1.5 h-4 w-4 sm:mr-2" />
                Export CSV
              </a>
            </Button>

            <Button
              variant="outline"
              className="h-9 rounded-xl border border-white/10 bg-[#07111f]/80 px-3 text-xs text-slate-100 hover:border-cyan-300/20 hover:bg-white/10 hover:text-white sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm"
              onClick={handleImportClick}
              disabled={loading}
            >
              <FileUp className="mr-1.5 h-4 w-4 sm:mr-2" />
              Import CSV
            </Button>

            <input ref={importInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => handleImportFile(e.target.files?.[0] || null)} />
          </div>
        </div>

        {error && <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm font-bold text-destructive sm:mb-6 sm:rounded-2xl sm:p-4">{error}</div>}

        {active === "dashboard" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-4 items-start gap-2 sm:gap-3">
              <SummaryFinanceCard title="Balance" value={formatCompactNumber(totalBalance)} badge="All" icon={<WalletCards className="h-3.5 w-3.5 text-emerald-200 sm:h-5 sm:w-5" />} iconTone="bg-emerald-400/10" />

              <SummaryFinanceCard
                title="Income"
                value={formatCompactNumber(totalIncome)}
                badge="In"
                icon={<ArrowUpRight className="h-3.5 w-3.5 text-cyan-200 sm:h-5 sm:w-5" />}
                iconTone="bg-cyan-400/10"
                badgeTone="border-cyan-300/15 bg-cyan-400/10 text-cyan-100"
              />

              <SummaryFinanceCard
                title="Expense"
                value={formatCompactNumber(totalExpense)}
                badge="Out"
                icon={<ArrowDownRight className="h-3.5 w-3.5 text-rose-200 sm:h-5 sm:w-5" />}
                iconTone="bg-rose-400/10"
                badgeTone="border-rose-300/15 bg-rose-400/10 text-rose-100"
              />

              <SummaryFinanceCard
                title="Alerts"
                value={String(budgetAlertCount)}
                badge="Warn"
                icon={<PiggyBank className="h-3.5 w-3.5 text-amber-200 sm:h-5 sm:w-5" />}
                iconTone="bg-amber-400/10"
                badgeTone="border-amber-300/15 bg-amber-400/10 text-amber-100"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 2xl:grid-cols-[1.5fr_0.9fr]">
              <div className="space-y-4 sm:space-y-6">
                <Card className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3 text-white backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
                  <div className="mb-4 flex flex-col gap-3 sm:mb-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-base font-black sm:text-lg">Cashflow overview</div>
                      <div className="text-xs text-slate-400 sm:text-sm">Track the momentum of your expenses over the last 6 months.</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button className="h-9 rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 text-xs font-semibold text-cyan-100 hover:bg-cyan-400/15 sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={openNewTransaction}>
                        <Plus className="mr-1.5 h-4 w-4 sm:mr-2" />
                        Add transaction
                      </Button>

                      <Button
                        variant="outline"
                        className="h-9 rounded-xl border border-white/10 bg-[#07111f]/80 px-3 text-xs text-slate-100 hover:border-cyan-300/20 hover:bg-white/10 sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm"
                        onClick={() => setTransferDialogOpen(true)}
                      >
                        <ArrowLeftRight className="mr-1.5 h-4 w-4 sm:mr-2" />
                        Transfer
                      </Button>

                      <Button
                        variant="outline"
                        className="h-9 rounded-xl border border-white/10 bg-[#07111f]/80 px-3 text-xs text-slate-100 hover:border-cyan-300/20 hover:bg-white/10 sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm"
                        onClick={() => setGoalDialogOpen(true)}
                      >
                        <Plus className="mr-1.5 h-4 w-4 sm:mr-2" />
                        New goal
                      </Button>
                    </div>
                  </div>

                  <ChartContainer className="w-full" config={{ expense: { label: "Expense", color: "hsl(var(--primary))" } }}>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={chartLineData}>
                        <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="rgba(148,163,184,.45)" tick={{ fontSize: 11 }} />
                        <YAxis tickLine={false} axisLine={false} stroke="rgba(148,163,184,.45)" tick={{ fontSize: 11 }} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="expense" stroke="var(--color-expense)" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </Card>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
                  <Card className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3 text-white backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
                    <div className="mb-3 flex items-center justify-between sm:mb-4">
                      <div>
                        <div className="text-base font-black sm:text-lg">Account overview</div>
                        <div className="text-xs text-slate-400 sm:text-sm">Your available account setup for spending and transfers.</div>
                      </div>
                      <Landmark className="h-4 w-4 text-cyan-200 sm:h-5 sm:w-5" />
                    </div>

                    <div className="space-y-2.5 sm:space-y-3">
                      {accounts.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-white/10 bg-[#07111f]/50 p-3 text-xs text-slate-400 sm:rounded-2xl sm:p-4 sm:text-sm">No accounts yet. Add your first account to start tracking balance.</div>
                      ) : (
                        accounts.map((account) => (
                          <div key={account.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#07111f]/70 px-3 py-2.5 sm:rounded-2xl sm:px-4 sm:py-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-white">{account.name}</div>
                              <div className="text-[10px] text-slate-500 sm:text-xs">
                                {account.type} • {account.currency}
                              </div>
                            </div>
                            <div className="shrink-0 text-xs font-bold text-slate-200 sm:text-sm">{account.initialBalance}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>

                  <Card className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3 text-white backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
                    <div className="mb-3 flex items-center justify-between sm:mb-4">
                      <div>
                        <div className="text-base font-black sm:text-lg">Budget health</div>
                        <div className="text-xs text-slate-400 sm:text-sm">See which categories are safe, close, or over budget.</div>
                      </div>
                      <AlertTriangle className="h-4 w-4 text-amber-200 sm:h-5 sm:w-5" />
                    </div>

                    <div className="space-y-2.5 sm:space-y-3">
                      {(insights?.budgetUsage || []).length === 0 ? (
                        <div className="rounded-xl border border-dashed border-white/10 bg-[#07111f]/50 p-3 text-xs text-slate-400 sm:rounded-2xl sm:p-4 sm:text-sm">No budgets set for this month.</div>
                      ) : (
                        (insights?.budgetUsage || []).slice(0, 5).map((b) => (
                          <div
                            key={b.id}
                            className={`rounded-xl border p-3 sm:rounded-2xl sm:p-4 ${b.isOver ? "border-red-400/20 bg-red-500/10" : b.progress >= 80 ? "border-amber-400/20 bg-amber-500/10" : "border-white/10 bg-[#07111f]/70"}`}
                          >
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <div className="truncate text-sm font-semibold text-white">{b.category.name}</div>
                              <Badge className="rounded-full border border-white/10 bg-white/10 text-[10px] text-slate-200 sm:text-xs">{Math.round(b.progress)}%</Badge>
                            </div>
                            <div className="mb-2.5 text-[10px] text-slate-400 sm:mb-3 sm:text-xs">
                              {formatMoney(b.spent, b.currency)} / {formatMoney(b.limit, b.currency)}
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                              <div className={`h-2 ${b.isOver ? "bg-red-400" : b.progress >= 80 ? "bg-amber-300" : "bg-cyan-300"}`} style={{ width: `${Math.min(b.progress, 100)}%` }} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>

                <Card className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3 text-white backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
                  <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
                    <div>
                      <div className="text-base font-black sm:text-lg">Recent transactions</div>
                      <div className="text-xs text-slate-400 sm:text-sm">A quick scan of the latest money movement this month.</div>
                    </div>
                    <Button
                      variant="outline"
                      className="h-9 rounded-xl border border-white/10 bg-[#07111f]/80 px-3 text-xs text-slate-100 hover:border-cyan-300/20 hover:bg-white/10 sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm"
                      onClick={() => setActive("transactions")}
                    >
                      View all
                    </Button>
                  </div>

                  <div className="space-y-2.5 sm:space-y-3">
                    {recentTransactions.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/10 bg-[#07111f]/50 p-3 text-xs text-slate-400 sm:rounded-2xl sm:p-4 sm:text-sm">No transactions yet for this month.</div>
                    ) : (
                      recentTransactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#07111f]/70 px-3 py-2.5 sm:rounded-2xl sm:px-4 sm:py-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-white">{tx.category?.name || tx.note || tx.type}</div>
                            <div className="text-[10px] text-slate-500 sm:text-xs">
                              {tx.account.name} • {format(new Date(tx.date), "dd MMM yyyy")}
                            </div>
                          </div>
                          <div className={`shrink-0 text-xs font-bold sm:text-sm ${tx.type === "EXPENSE" ? "text-rose-300" : "text-emerald-300"}`}>
                            {tx.type === "EXPENSE" ? "-" : "+"}
                            {formatMoney(toNumber(tx.amount), tx.currency)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <Card className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3 text-white backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
                  <div className="mb-3 flex items-center justify-between sm:mb-4">
                    <div>
                      <div className="text-base font-black sm:text-lg">Monthly insight</div>
                      <div className="text-xs text-slate-400 sm:text-sm">Simple read on where your money is going.</div>
                    </div>
                    <Badge className="rounded-full border border-white/10 bg-white/10 text-[10px] text-slate-200 sm:text-xs">{month}</Badge>
                  </div>

                  {insights ? (
                    <div className="space-y-2.5 sm:space-y-3">
                      {Object.entries(insights.topSpendingByCurrency).map(([currency, top]) => (
                        <div key={currency} className="rounded-xl border border-white/10 bg-[#07111f]/70 p-3 sm:rounded-2xl sm:p-4">
                          <div className="mb-1 text-[9px] uppercase tracking-[0.18em] text-slate-500 sm:text-xs">{currency}</div>
                          <div className="text-sm font-black text-white sm:text-base">{top.category}</div>
                          <div className="mt-1 text-sm font-semibold text-cyan-200">{formatMoney(top.amount, currency)}</div>
                          <div className="mt-2 text-[10px] text-slate-500 sm:text-xs">Highest spending category for this month.</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 sm:text-sm">Loading insight...</div>
                  )}
                </Card>

                <Card className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3 text-white backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
                  <div className="mb-3 flex items-center justify-between sm:mb-4">
                    <div>
                      <div className="text-base font-black sm:text-lg">Category distribution</div>
                      <div className="text-xs text-slate-400 sm:text-sm">See what dominates your expenses.</div>
                    </div>
                  </div>

                  <ChartContainer className="w-full" config={{ value: { label: "Expense", color: "hsl(var(--primary))" } }}>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Pie data={chartPieData} dataKey="value" nameKey="name" fill="var(--color-value)" />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </Card>

                <Card className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3 text-white backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
                  <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
                    <div>
                      <div className="text-base font-black sm:text-lg">Goals snapshot</div>
                      <div className="text-xs text-slate-400 sm:text-sm">Keep savings targets visible while managing cashflow.</div>
                    </div>
                    <Button
                      variant="outline"
                      className="h-9 rounded-xl border border-white/10 bg-[#07111f]/80 px-3 text-xs text-slate-100 hover:border-cyan-300/20 hover:bg-white/10 sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm"
                      onClick={() => setActive("goals")}
                    >
                      Open goals
                    </Button>
                  </div>

                  <div className="space-y-2.5 sm:space-y-3">
                    {goals.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/10 bg-[#07111f]/50 p-3 text-xs text-slate-400 sm:rounded-2xl sm:p-4 sm:text-sm">No goals yet. Create one to track saving progress.</div>
                    ) : (
                      goals.slice(0, 3).map((g) => {
                        const current = toNumber(g.currentAmount);
                        const target = toNumber(g.targetAmount);
                        const progress = target === 0 ? 0 : (current / target) * 100;
                        return (
                          <div key={g.id} className="rounded-xl border border-white/10 bg-[#07111f]/70 p-3 sm:rounded-2xl sm:p-4">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <div className="truncate text-sm font-semibold text-white">{g.name}</div>
                              <Badge className="rounded-full border border-white/10 bg-white/10 text-[10px] text-slate-200 sm:text-xs">{Math.round(progress)}%</Badge>
                            </div>
                            <div className="mb-2.5 text-[10px] text-slate-500 sm:mb-3 sm:text-xs">
                              {formatMoney(current, g.currency)} / {formatMoney(target, g.currency)}
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                              <div className="h-2 bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${Math.min(progress, 100)}%` }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {active === "transactions" && (
          <Card className="rounded-[1.25rem] border-2 border-primary/10 p-3 sm:rounded-3xl sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:mb-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-base font-black sm:text-lg">Transactions</div>
                <div className="text-xs text-muted-foreground sm:text-sm">Tambah pemasukan, pengeluaran, atau transfer antar akun.</div>
              </div>
              <div className="flex items-center gap-2">
                <Button className="h-9 rounded-xl px-3 text-xs font-bold sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={openNewTransaction}>
                  <Plus className="mr-1.5 h-4 w-4 sm:mr-2" />
                  Add Transaction
                </Button>
                <Button variant="outline" className="h-9 rounded-xl px-3 text-xs sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={() => setTransferDialogOpen(true)}>
                  <ArrowLeftRight className="mr-1.5 h-4 w-4 sm:mr-2" />
                  Transfer
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-xs text-muted-foreground sm:text-sm">
                        Belum ada transaksi di bulan ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-xs sm:text-sm">{format(new Date(tx.date), "yyyy-MM-dd")}</TableCell>
                        <TableCell>
                          <Badge variant={tx.type === "EXPENSE" ? "secondary" : "outline"} className="rounded-xl text-[10px] sm:text-xs">
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">{tx.account.name}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{tx.category?.name || "-"}</TableCell>
                        <TableCell className="max-w-[220px] truncate text-xs sm:text-sm">{tx.tags.length ? tx.tags.map((t) => t.name).join(", ") : "-"}</TableCell>
                        <TableCell className="font-mono text-xs font-bold sm:text-sm">{formatMoney(toNumber(tx.amount), tx.currency)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {tx.type !== "TRANSFER" && (
                              <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl sm:h-9 sm:w-9" onClick={() => openEditTransaction(tx)}>
                                <Pencil size={14} />
                              </Button>
                            )}
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl sm:h-9 sm:w-9" onClick={() => deleteTransaction(tx.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {active === "categories" && (
          <Card className="rounded-[1.25rem] border-2 border-primary/10 p-3 sm:rounded-3xl sm:p-6">
            <div className="mb-4 flex items-center justify-between sm:mb-6">
              <div>
                <div className="text-base font-black sm:text-lg">Categories</div>
                <div className="text-xs text-muted-foreground sm:text-sm">Kategori default + bisa tambah sendiri.</div>
              </div>
              <Button className="h-9 rounded-xl px-3 text-xs font-bold sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={() => setCategoryDialogOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4 sm:mr-2" />
                New Category
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-primary/5 bg-muted/20 p-3 sm:rounded-2xl sm:p-4">
                <div className="mb-3 text-sm font-black sm:text-base">Expense</div>
                <div className="flex flex-wrap gap-2">
                  {expenseCategories.map((c) => (
                    <Badge key={c.id} variant="secondary" className="rounded-xl text-[10px] sm:text-xs">
                      {c.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-primary/5 bg-muted/20 p-3 sm:rounded-2xl sm:p-4">
                <div className="mb-3 text-sm font-black sm:text-base">Income</div>
                <div className="flex flex-wrap gap-2">
                  {incomeCategories.map((c) => (
                    <Badge key={c.id} variant="outline" className="rounded-xl text-[10px] sm:text-xs">
                      {c.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {active === "budgets" && (
          <Card className="rounded-[1.25rem] border-2 border-primary/10 p-3 sm:rounded-3xl sm:p-6">
            <div className="mb-4 flex items-center justify-between sm:mb-6">
              <div>
                <div className="text-base font-black sm:text-lg">Budgets</div>
                <div className="text-xs text-muted-foreground sm:text-sm">Set limit budget bulanan per kategori.</div>
              </div>
              <Button className="h-9 rounded-xl px-3 text-xs font-bold sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={() => setBudgetDialogOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4 sm:mr-2" />
                Set Budget
              </Button>
            </div>

            <div className="space-y-3">
              {budgets.length === 0 ? (
                <div className="text-xs text-muted-foreground sm:text-sm">Belum ada budget untuk bulan ini.</div>
              ) : (
                budgets.map((b) => {
                  const spent = toNumber(b.spent);
                  const limit = toNumber(b.limit);
                  const progress = limit === 0 ? 0 : (spent / limit) * 100;
                  const isOver = spent > limit;
                  return (
                    <div key={b.id} className={`rounded-xl border p-3 sm:rounded-2xl sm:p-4 ${isOver ? "border-destructive/20 bg-destructive/10" : "border-primary/5 bg-muted/20"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-black sm:text-base">{b.category.name}</div>
                        <Badge variant="secondary" className="rounded-xl text-[10px] sm:text-xs">
                          {b.currency}
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground sm:text-sm">
                        {formatMoney(spent, b.currency)} / {formatMoney(limit, b.currency)} • {progress.toFixed(0)}%
                      </div>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className={`${isOver ? "bg-destructive" : "bg-primary"} h-2`} style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                      {isOver && <div className="mt-2 text-[10px] font-bold text-destructive sm:text-xs">Budget exceeded</div>}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        )}

        {active === "accounts" && (
          <Card className="rounded-[1.25rem] border-2 border-primary/10 p-3 sm:rounded-3xl sm:p-6">
            <div className="mb-4 flex items-center justify-between sm:mb-6">
              <div>
                <div className="text-base font-black sm:text-lg">Accounts</div>
                <div className="text-xs text-muted-foreground sm:text-sm">Cash, Bank, E-wallet. Transfer antar akun tersedia.</div>
              </div>
              <Button className="h-9 rounded-xl px-3 text-xs font-bold sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={() => setAccountDialogOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4 sm:mr-2" />
                New Account
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Initial</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-xs font-bold sm:text-sm">{a.name}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{a.type}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{a.currency}</TableCell>
                      <TableCell className="font-mono text-xs sm:text-sm">{a.initialBalance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {active === "analytics" && (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
            <Card className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3 text-white backdrop-blur-xl lg:col-span-6 sm:rounded-[2rem] sm:p-6">
              <div className="mb-4 text-base font-black sm:text-lg">Pie (Top Categories)</div>
              <ChartContainer
                className="w-full"
                config={{
                  value: { label: "Expense", color: "hsl(var(--primary))" },
                }}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Tooltip content={<ChartTooltipContent />} />
                    <Pie data={chartPieData} dataKey="value" nameKey="name" fill="var(--color-value)" />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Card>

            <Card className="rounded-[1.25rem] border-2 border-primary/10 p-3 lg:col-span-6 sm:rounded-3xl sm:p-6">
              <div className="mb-4 text-base font-black sm:text-lg">Line (Monthly Expense)</div>
              <ChartContainer
                className="w-full"
                config={{
                  expense: { label: "Expense", color: "hsl(var(--primary))" },
                }}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartLineData}>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="expense" stroke="var(--color-expense)" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Card>
          </div>
        )}

        {active === "goals" && (
          <div className="space-y-4 sm:space-y-6">
            <Card className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3 text-white backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100 sm:px-3 sm:text-[11px] sm:tracking-[0.2em]">
                    <PiggyBank className="h-3.5 w-3.5" />
                    Savings goals
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-white sm:text-3xl">Goals</h2>
                  <p className="mt-1 text-xs text-slate-400 sm:mt-2 sm:text-sm">Target tabungan, progress, dan deadline sekarang tampil lebih clean dan premium.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] text-slate-200 sm:px-3 sm:text-xs">
                    {goals.length} active goals
                  </Badge>
                  <Button
                    className="h-9 rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 text-xs font-semibold text-cyan-100 hover:bg-cyan-400/15 sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm"
                    onClick={() => setGoalDialogOpen(true)}
                  >
                    <Plus className="mr-1.5 h-4 w-4 sm:mr-2" />
                    New Goal
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
              <SummaryFinanceCard title="Goals" value={String(goals.length)} badge="All" icon={<PiggyBank className="h-3.5 w-3.5 text-emerald-200 sm:h-5 sm:w-5" />} iconTone="bg-emerald-400/10" />
              <SummaryFinanceCard
                title="Target"
                value={formatCompactNumber(goals.reduce((sum, goal) => sum + toNumber(goal.targetAmount), 0))}
                badge="Aim"
                icon={<Landmark className="h-3.5 w-3.5 text-cyan-200 sm:h-5 sm:w-5" />}
                iconTone="bg-cyan-400/10"
                badgeTone="border-cyan-300/15 bg-cyan-400/10 text-cyan-100"
              />
              <SummaryFinanceCard
                title="Saved"
                value={formatCompactNumber(goals.reduce((sum, goal) => sum + toNumber(goal.currentAmount), 0))}
                badge="Now"
                icon={<WalletCards className="h-3.5 w-3.5 text-violet-200 sm:h-5 sm:w-5" />}
                iconTone="bg-violet-400/10"
                badgeTone="border-violet-300/15 bg-violet-400/10 text-violet-100"
              />
              <SummaryFinanceCard
                title="Avg progress"
                value={`${goals.length ? Math.round(goals.reduce((sum, goal) => sum + (toNumber(goal.targetAmount) > 0 ? (toNumber(goal.currentAmount) / toNumber(goal.targetAmount)) * 100 : 0), 0) / goals.length) : 0}%`}
                badge="Rate"
                icon={<Save className="h-3.5 w-3.5 text-amber-200 sm:h-5 sm:w-5" />}
                iconTone="bg-amber-400/10"
                badgeTone="border-amber-300/15 bg-amber-400/10 text-amber-100"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3 text-white backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
                  <div>
                    <div className="text-base font-black sm:text-lg">Goal progress board</div>
                    <div className="text-xs text-slate-400 sm:text-sm">Lihat target, progres, dan deadline dalam satu tempat yang lebih enak dipantau.</div>
                  </div>
                  <PiggyBank className="h-4 w-4 text-cyan-200 sm:h-5 sm:w-5" />
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {goals.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 bg-[#07111f]/50 p-4 text-xs text-slate-400 sm:rounded-2xl sm:p-5 sm:text-sm">
                      Belum ada goals. Bikin target tabungan pertama biar section ini hidup 😆
                    </div>
                  ) : (
                    goals.map((g) => {
                      const current = toNumber(g.currentAmount);
                      const target = toNumber(g.targetAmount);
                      const progress = target === 0 ? 0 : (current / target) * 100;
                      const remaining = Math.max(target - current, 0);
                      return (
                        <div key={g.id} className="rounded-[1rem] border border-white/10 bg-[#07111f]/70 p-4 sm:rounded-[1.5rem] sm:p-5">
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-black text-white sm:text-lg">{g.name}</div>
                              <div className="mt-1 text-[10px] text-slate-500 sm:text-xs">{g.targetDate ? `Target date: ${format(new Date(g.targetDate), "dd MMM yyyy")}` : "No deadline set"}</div>
                            </div>
                            <Badge className="rounded-full border border-white/10 bg-white/10 text-[10px] text-slate-200 sm:text-xs">{g.currency}</Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            <div className="rounded-xl border border-emerald-300/10 bg-emerald-400/10 p-2.5 sm:rounded-2xl sm:p-3">
                              <div className="text-[9px] uppercase tracking-[0.12em] text-emerald-100/80 sm:text-[10px]">Saved</div>
                              <div className="mt-1 text-xs font-black text-emerald-100 sm:text-sm">{formatMoney(current, g.currency)}</div>
                            </div>
                            <div className="rounded-xl border border-cyan-300/10 bg-cyan-400/10 p-2.5 sm:rounded-2xl sm:p-3">
                              <div className="text-[9px] uppercase tracking-[0.12em] text-cyan-100/80 sm:text-[10px]">Target</div>
                              <div className="mt-1 text-xs font-black text-cyan-100 sm:text-sm">{formatMoney(target, g.currency)}</div>
                            </div>
                            <div className="rounded-xl border border-amber-300/10 bg-amber-400/10 p-2.5 sm:rounded-2xl sm:p-3">
                              <div className="text-[9px] uppercase tracking-[0.12em] text-amber-100/80 sm:text-[10px]">Left</div>
                              <div className="mt-1 text-xs font-black text-amber-100 sm:text-sm">{formatMoney(remaining, g.currency)}</div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 sm:text-xs">
                            <span>Progress</span>
                            <span>{Math.min(progress, 100).toFixed(0)}%</span>
                          </div>
                          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div className="h-2.5 rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-300" style={{ width: `${Math.min(progress, 100)}%` }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>

              <div className="space-y-4 sm:space-y-6">
                <Card className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3 text-white backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
                  <div className="mb-3 flex items-center justify-between sm:mb-4">
                    <div>
                      <div className="text-base font-black sm:text-lg">Goal insights</div>
                      <div className="text-xs text-slate-400 sm:text-sm">Snapshot cepat buat baca kesehatan target tabunganmu.</div>
                    </div>
                    <Save className="h-4 w-4 text-amber-200 sm:h-5 sm:w-5" />
                  </div>

                  <div className="space-y-3">
                    {goals.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/10 bg-[#07111f]/50 p-3 text-xs text-slate-400 sm:rounded-2xl sm:p-4 sm:text-sm">No goal insights yet.</div>
                    ) : (
                      <>
                        <div className="rounded-xl border border-white/10 bg-[#07111f]/70 p-3 sm:rounded-2xl sm:p-4">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 sm:text-xs">Closest to finish</div>
                          <div className="mt-2 text-sm font-black text-white sm:text-base">
                            {goals
                              .slice()
                              .sort((a, b) => {
                                const pa = toNumber(a.targetAmount) > 0 ? toNumber(a.currentAmount) / toNumber(a.targetAmount) : 0;
                                const pb = toNumber(b.targetAmount) > 0 ? toNumber(b.currentAmount) / toNumber(b.targetAmount) : 0;
                                return pb - pa;
                              })[0]?.name || "—"}
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-[#07111f]/70 p-3 sm:rounded-2xl sm:p-4">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 sm:text-xs">Most remaining</div>
                          <div className="mt-2 text-sm font-black text-white sm:text-base">
                            {goals
                              .slice()
                              .sort((a, b) => (toNumber(b.targetAmount) - toNumber(b.currentAmount)) - (toNumber(a.targetAmount) - toNumber(a.currentAmount)))[0]?.name || "—"}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card>

                <Card className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3 text-white backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
                  <div className="mb-3 flex items-center justify-between sm:mb-4">
                    <div>
                      <div className="text-base font-black sm:text-lg">Quick actions</div>
                      <div className="text-xs text-slate-400 sm:text-sm">Tambah target baru atau lanjut atur strategi nabung.</div>
                    </div>
                    <Plus className="h-4 w-4 text-cyan-200 sm:h-5 sm:w-5" />
                  </div>

                  <div className="grid gap-2.5 sm:gap-3">
                    <Button className="h-10 justify-start rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 text-xs font-semibold text-cyan-100 hover:bg-cyan-400/15 sm:h-11 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={() => setGoalDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create new goal
                    </Button>
                    <Button variant="outline" className="h-10 justify-start rounded-xl border border-white/10 bg-[#07111f]/80 px-3 text-xs text-slate-100 hover:border-cyan-300/20 hover:bg-white/10 sm:h-11 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={() => setActive("dashboard")}>
                      <WalletCards className="mr-2 h-4 w-4" />
                      Back to dashboard
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={txDialogOpen} onOpenChange={setTxDialogOpen}>
        <DialogContent className="max-w-lg rounded-[1.25rem] p-4 sm:rounded-3xl sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-black text-base sm:text-lg">{txEditing ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Income atau expense dengan kategori dan tags.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">Type</Label>
              <Select value={txForm.type} onValueChange={(v) => setTxForm((p) => ({ ...p, type: asIncomeExpense(v), categoryId: "" }))}>
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">EXPENSE</SelectItem>
                  <SelectItem value="INCOME">INCOME</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">Account</Label>
              <Select value={txForm.accountId} onValueChange={(v) => setTxForm((p) => ({ ...p, accountId: v }))}>
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name} ({a.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">Category</Label>
              <Select value={txForm.categoryId} onValueChange={(v) => setTxForm((p) => ({ ...p, categoryId: v }))}>
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  {(txForm.type === "EXPENSE" ? expenseCategories : incomeCategories).map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">Date</Label>
              <Input type="date" value={txForm.date} onChange={(e) => setTxForm((p) => ({ ...p, date: e.target.value }))} className="text-xs sm:text-sm" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">Amount</Label>
              <Input inputMode="decimal" value={txForm.amount} onChange={(e) => setTxForm((p) => ({ ...p, amount: e.target.value }))} placeholder="100000" className="text-xs sm:text-sm" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">Currency</Label>
              <Input value={txForm.currency} onChange={(e) => setTxForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))} placeholder="IDR" className="text-xs sm:text-sm" />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-bold sm:text-sm">Tags</Label>
              <Input value={txForm.tags} onChange={(e) => setTxForm((p) => ({ ...p, tags: e.target.value }))} placeholder="contoh: groceries, family" className="text-xs sm:text-sm" />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 10).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="rounded-xl border border-primary/10 px-2 py-1 text-[10px] hover:bg-primary/5 sm:text-xs"
                      onClick={() => {
                        const current = txForm.tags
                          .split(",")
                          .map((x) => x.trim())
                          .filter(Boolean);
                        if (current.includes(t.name)) return;
                        setTxForm((p) => ({ ...p, tags: [...current, t.name].join(", ") }));
                      }}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-bold sm:text-sm">Note</Label>
              <Input value={txForm.note} onChange={(e) => setTxForm((p) => ({ ...p, note: e.target.value }))} placeholder="Optional" className="text-xs sm:text-sm" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="h-9 rounded-xl px-3 text-xs sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={() => setTxDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button className="h-9 rounded-xl px-3 text-xs font-bold sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={saveTransaction} disabled={loading}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="max-w-lg rounded-[1.25rem] p-4 sm:rounded-3xl sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-black text-base sm:text-lg">Transfer</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Pindahkan saldo antar akun (currency harus sama).</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">From</Label>
              <Select value={transferForm.fromAccountId} onValueChange={(v) => setTransferForm((p) => ({ ...p, fromAccountId: v }))}>
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name} ({a.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">To</Label>
              <Select value={transferForm.toAccountId} onValueChange={(v) => setTransferForm((p) => ({ ...p, toAccountId: v }))}>
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name} ({a.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">Amount</Label>
              <Input inputMode="decimal" value={transferForm.amount} onChange={(e) => setTransferForm((p) => ({ ...p, amount: e.target.value }))} placeholder="50000" className="text-xs sm:text-sm" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">Date</Label>
              <Input type="date" value={transferForm.date} onChange={(e) => setTransferForm((p) => ({ ...p, date: e.target.value }))} className="text-xs sm:text-sm" />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-bold sm:text-sm">Note</Label>
              <Input value={transferForm.note} onChange={(e) => setTransferForm((p) => ({ ...p, note: e.target.value }))} placeholder="Optional" className="text-xs sm:text-sm" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="h-9 rounded-xl px-3 text-xs sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={() => setTransferDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button className="h-9 rounded-xl px-3 text-xs font-bold sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={saveTransfer} disabled={loading}>
              Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-md rounded-[1.25rem] p-4 sm:rounded-3xl sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-black text-base sm:text-lg">New Category</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Buat kategori untuk income atau expense.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">Kind</Label>
              <Select value={categoryForm.kind} onValueChange={(v) => setCategoryForm((p) => ({ ...p, kind: asIncomeExpense(v) }))}>
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="Select kind" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">EXPENSE</SelectItem>
                  <SelectItem value="INCOME">INCOME</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">Name</Label>
              <Input value={categoryForm.name} onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))} className="text-xs sm:text-sm" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="h-9 rounded-xl px-3 text-xs sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={() => setCategoryDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button className="h-9 rounded-xl px-3 text-xs font-bold sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={createCategory} disabled={loading}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="max-w-md rounded-[1.25rem] p-4 sm:rounded-3xl sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-black text-base sm:text-lg">New Account</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Buat akun baru untuk tracking cash/bank/e-wallet.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">Name</Label>
              <Input value={accountForm.name} onChange={(e) => setAccountForm((p) => ({ ...p, name: e.target.value }))} className="text-xs sm:text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">Type</Label>
              <Select value={accountForm.type} onValueChange={(v) => setAccountForm((p) => ({ ...p, type: asAccountType(v) }))}>
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">CASH</SelectItem>
                  <SelectItem value="BANK">BANK</SelectItem>
                  <SelectItem value="EWALLET">EWALLET</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold sm:text-sm">Currency</Label>
                <Input value={accountForm.currency} onChange={(e) => setAccountForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))} className="text-xs sm:text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold sm:text-sm">Initial</Label>
                <Input value={accountForm.initialBalance} onChange={(e) => setAccountForm((p) => ({ ...p, initialBalance: e.target.value }))} className="text-xs sm:text-sm" />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="h-9 rounded-xl px-3 text-xs sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={() => setAccountDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button className="h-9 rounded-xl px-3 text-xs font-bold sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={createAccount} disabled={loading}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent className="max-w-md rounded-[1.25rem] p-4 sm:rounded-3xl sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-black text-base sm:text-lg">Set Budget</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Budget per kategori expense untuk bulan {month}.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold sm:text-sm">Category</Label>
              <Select value={budgetForm.categoryId} onValueChange={(v) => setBudgetForm((p) => ({ ...p, categoryId: v }))}>
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold sm:text-sm">Currency</Label>
                <Input value={budgetForm.currency} onChange={(e) => setBudgetForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))} className="text-xs sm:text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold sm:text-sm">Limit</Label>
                <Input value={budgetForm.limit} onChange={(e) => setBudgetForm((p) => ({ ...p, limit: e.target.value }))} placeholder="300000" className="text-xs sm:text-sm" />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="h-9 rounded-xl px-3 text-xs sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={() => setBudgetDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button className="h-9 rounded-xl px-3 text-xs font-bold sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={saveBudget} disabled={loading}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent className="max-w-2xl border border-white/10 bg-[#08111f]/95 p-0 text-white shadow-2xl shadow-cyan-950/30 backdrop-blur-xl sm:rounded-[2rem]">
          <div className="overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
            <div className="border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100 sm:px-3 sm:text-[11px] sm:tracking-[0.2em]">
                <PiggyBank className="h-3.5 w-3.5" />
                Create savings goal
              </div>
              <DialogHeader>
                <DialogTitle className="text-left font-black text-lg sm:text-2xl">New Goal</DialogTitle>
                <DialogDescription className="text-left text-xs text-slate-400 sm:text-sm">
                  Bikin target tabungan baru dengan nominal, progress awal, dan deadline yang jelas.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="border-b border-white/10 bg-white/[0.03] p-4 lg:border-b-0 lg:border-r lg:p-6">
                <div className="rounded-[1.25rem] border border-cyan-300/10 bg-cyan-400/5 p-4 sm:rounded-[1.5rem] sm:p-5">
                  <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100 sm:text-[11px]">Live preview</div>
                  <div className="text-lg font-black text-white sm:text-2xl">{goalForm.name || "Dream Goal"}</div>
                  <div className="mt-1 text-xs text-slate-400 sm:text-sm">{goalForm.targetDate ? `Target date ${format(new Date(goalForm.targetDate), "dd MMM yyyy")}` : "No deadline yet"}</div>

                  <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="rounded-xl border border-emerald-300/10 bg-emerald-400/10 p-3 sm:rounded-2xl">
                      <div className="text-[9px] uppercase tracking-[0.14em] text-emerald-100/80 sm:text-[10px]">Saved</div>
                      <div className="mt-1 text-xs font-black text-emerald-100 sm:text-sm">
                        {formatMoney(toNumber(goalForm.currentAmount || 0), goalForm.currency || "IDR")}
                      </div>
                    </div>
                    <div className="rounded-xl border border-cyan-300/10 bg-cyan-400/10 p-3 sm:rounded-2xl">
                      <div className="text-[9px] uppercase tracking-[0.14em] text-cyan-100/80 sm:text-[10px]">Target</div>
                      <div className="mt-1 text-xs font-black text-cyan-100 sm:text-sm">
                        {formatMoney(toNumber(goalForm.targetAmount || 0), goalForm.currency || "IDR")}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 sm:text-xs">
                    <span>Progress</span>
                    <span>
                      {Math.min(
                        toNumber(goalForm.targetAmount || 0) > 0
                          ? (toNumber(goalForm.currentAmount || 0) / toNumber(goalForm.targetAmount || 0)) * 100
                          : 0,
                        100
                      ).toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-300"
                      style={{
                        width: `${Math.min(
                          toNumber(goalForm.targetAmount || 0) > 0
                            ? (toNumber(goalForm.currentAmount || 0) / toNumber(goalForm.targetAmount || 0)) * 100
                            : 0,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-300 sm:text-sm">Goal name</Label>
                    <Input
                      value={goalForm.name}
                      onChange={(e) => setGoalForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="MacBook fund, emergency fund, trip to Japan..."
                      className="h-11 rounded-xl border-white/10 bg-[#07111f]/80 text-sm text-white placeholder:text-slate-500 sm:h-12 sm:rounded-2xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-300 sm:text-sm">Currency</Label>
                      <Input
                        value={goalForm.currency}
                        onChange={(e) => setGoalForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))}
                        className="h-11 rounded-xl border-white/10 bg-[#07111f]/80 text-sm text-white sm:h-12 sm:rounded-2xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-300 sm:text-sm">Target amount</Label>
                      <Input
                        value={goalForm.targetAmount}
                        onChange={(e) => setGoalForm((p) => ({ ...p, targetAmount: e.target.value }))}
                        placeholder="10000000"
                        className="h-11 rounded-xl border-white/10 bg-[#07111f]/80 text-sm text-white sm:h-12 sm:rounded-2xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-300 sm:text-sm">Current saved</Label>
                      <Input
                        value={goalForm.currentAmount}
                        onChange={(e) => setGoalForm((p) => ({ ...p, currentAmount: e.target.value }))}
                        placeholder="0"
                        className="h-11 rounded-xl border-white/10 bg-[#07111f]/80 text-sm text-white sm:h-12 sm:rounded-2xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-300 sm:text-sm">Target date</Label>
                      <Input
                        type="date"
                        value={goalForm.targetDate}
                        onChange={(e) => setGoalForm((p) => ({ ...p, targetDate: e.target.value }))}
                        className="h-11 rounded-xl border-white/10 bg-[#07111f]/80 text-sm text-white sm:h-12 sm:rounded-2xl"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-5 gap-2 sm:mt-6">
                  <Button
                    variant="outline"
                    className="h-10 rounded-xl border border-white/10 bg-[#07111f]/80 px-4 text-xs text-slate-100 hover:border-cyan-300/20 hover:bg-white/10 sm:h-11 sm:rounded-2xl sm:px-5 sm:text-sm"
                    onClick={() => setGoalDialogOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-10 rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-4 text-xs font-semibold text-cyan-100 hover:bg-cyan-400/15 sm:h-11 sm:rounded-2xl sm:px-5 sm:text-sm"
                    onClick={createGoal}
                    disabled={loading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Create goal
                  </Button>
                </DialogFooter>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryFinanceCard({
  title,
  value,
  icon,
  badge,
  badgeTone = "border border-white/10 bg-white/10 text-slate-200",
  iconTone,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  badge?: string;
  badgeTone?: string;
  iconTone: string;
}) {
  return (
    <Card className="min-w-0 self-start rounded-[0.95rem] border border-white/10 bg-white/5 px-2 py-2 text-white backdrop-blur-xl sm:rounded-[1.25rem] sm:px-4 sm:py-4">
      <div className="mb-2 flex items-center justify-between gap-1">
        <div className={`rounded-lg border border-white/10 p-1.5 sm:rounded-xl sm:p-2.5 ${iconTone}`}>{icon}</div>

        {badge ? <Badge className={`hidden rounded-full px-2 py-0.5 text-[9px] sm:inline-flex ${badgeTone}`}>{badge}</Badge> : null}
      </div>

      <div className="truncate text-[10px] font-black leading-none tracking-tight text-white sm:text-lg">{value}</div>

      <div className="mt-2 text-[9px] font-semibold leading-tight text-slate-300 sm:text-sm">{title}</div>
    </Card>
  );
}
