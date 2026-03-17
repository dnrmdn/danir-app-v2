"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import {
  ArrowLeftRight,
  Download,
  FileUp,
  Plus,
  RefreshCcw,
  Trash2,
  Pencil,
  AlertTriangle,
} from "lucide-react";
import MoneyTrackerNavbar from "@/components/money-tracker/moneyNavbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

export default function MoneyPage() {
function asIncomeExpense(value: string): "INCOME" | "EXPENSE" {
  return value === "INCOME" ? "INCOME" : "EXPENSE"
}

function asAccountType(value: string): "CASH" | "BANK" | "EWALLET" {
  if (value === "BANK") return "BANK"
  if (value === "EWALLET") return "EWALLET"
  return "CASH"
}

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
  const [categoryForm, setCategoryForm] = useState({ name: "", kind: "EXPENSE" as "INCOME" | "EXPENSE" });

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
        fetch(`/api/finance/transactions?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`).then((r) =>
          r.json()
        ),
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
      setTransferForm({ fromAccountId: "", toAccountId: "", amount: "", date: format(new Date(), "yyyy-MM-dd"), note: "" });
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
      setAccountForm({ name: "", type: "CASH", currency: "IDR", initialBalance: "0" });
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
        body: JSON.stringify({ month, categoryId: Number(budgetForm.categoryId), currency: budgetForm.currency, limit: Number(budgetForm.limit) }),
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
      setGoalForm({ name: "", currency: "IDR", targetAmount: "", currentAmount: "0", targetDate: "" });
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

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Card className="p-8 rounded-3xl border-2 border-primary/10">
          <div className="text-3xl font-black mb-2">Money Tracker</div>
          <div className="text-muted-foreground">Login dulu untuk pakai fitur money tracker.</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <div className="text-sm font-black text-primary uppercase tracking-widest">Money Tracker</div>
            <h1 className="text-5xl font-black tracking-tight">Finance</h1>
            <p className="text-muted-foreground mt-2">
              Transaksi, budget, goals, multi account, export/import, dan insight bulanan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Month</Label>
              <Input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="h-10 w-[160px] rounded-2xl"
              />
            </div>
            <Button variant="outline" className="rounded-2xl" onClick={() => reloadMonthData()} disabled={loading}>
              <RefreshCcw className="mr-2" size={18} />
              Refresh
            </Button>
            <Button variant="outline" className="rounded-2xl" asChild>
              <a href={exportUrl}>
                <Download className="mr-2" size={18} />
                Export CSV
              </a>
            </Button>
            <Button variant="outline" className="rounded-2xl" onClick={handleImportClick} disabled={loading}>
              <FileUp className="mr-2" size={18} />
              Import CSV
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => handleImportFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-destructive/10 text-destructive font-bold p-4 rounded-2xl border border-destructive/20">
            {error}
          </div>
        )}

        {active === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <Card className="p-6 rounded-3xl border-2 border-primary/10">
                <div className="text-lg font-black mb-4">This Month Summary</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {dashboardTotals.map((t) => (
                    <div key={t.currency} className="p-4 rounded-2xl bg-muted/30 border border-primary/5">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="rounded-xl">{t.currency}</Badge>
                        {t.monthOverMonthExpensePct !== null && (
                          <span className={`text-xs font-bold ${t.monthOverMonthExpenseDiff > 0 ? "text-destructive" : "text-emerald-600"}`}>
                            {t.monthOverMonthExpenseDiff > 0 ? "+" : ""}{t.monthOverMonthExpensePct.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="mt-3 text-sm text-muted-foreground">Income</div>
                      <div className="text-xl font-black">{formatMoney(t.income, t.currency)}</div>
                      <div className="mt-3 text-sm text-muted-foreground">Expense</div>
                      <div className="text-xl font-black">{formatMoney(t.expense, t.currency)}</div>
                      <div className="mt-3 text-sm text-muted-foreground">Balance</div>
                      <div className="text-xl font-black">{formatMoney(t.balance, t.currency)}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 rounded-3xl border-2 border-primary/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-black">Spending Trend (6 months)</div>
                  <Badge variant="outline" className="rounded-xl">EXPENSE</Badge>
                </div>
                <ChartContainer
                  className="w-full"
                  config={{
                    expense: { label: "Expense", color: "hsl(var(--primary))" },
                  }}
                >
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={chartLineData}>
                      <XAxis dataKey="month" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="expense" stroke="var(--color-expense)" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card className="p-6 rounded-3xl border-2 border-primary/10">
                <div className="text-lg font-black mb-4">AI Insight (Simple)</div>
                {insights ? (
                  <div className="space-y-3">
                    {Object.entries(insights.topSpendingByCurrency).map(([currency, top]) => (
                      <div key={currency} className="p-4 rounded-2xl bg-muted/30 border border-primary/5">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="rounded-xl">{currency}</Badge>
                          <span className="text-xs font-bold text-muted-foreground">{month}</span>
                        </div>
                        <div className="mt-3 text-sm text-muted-foreground">Most spending category</div>
                        <div className="text-base font-black">{top.category}</div>
                        <div className="text-sm font-bold text-primary">{formatMoney(top.amount, currency)}</div>
                      </div>
                    ))}
                    <div className="text-xs text-muted-foreground">
                      Insight dihitung dari total expense per kategori di bulan ini dibanding bulan sebelumnya.
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Loading insight...</div>
                )}
              </Card>

              <Card className="p-6 rounded-3xl border-2 border-primary/10">
                <div className="text-lg font-black mb-4">Budget Warnings</div>
                <div className="space-y-3">
                  {(insights?.budgetUsage || []).filter((b) => b.isOver).length === 0 ? (
                    <div className="text-sm text-muted-foreground">No budget exceeded.</div>
                  ) : (
                    (insights?.budgetUsage || [])
                      .filter((b) => b.isOver)
                      .slice(0, 6)
                      .map((b) => (
                        <div key={b.id} className="p-3 rounded-2xl border border-destructive/20 bg-destructive/10">
                          <div className="flex items-center justify-between">
                            <div className="font-black text-sm">{b.category.name}</div>
                            <AlertTriangle size={16} className="text-destructive" />
                          </div>
                          <div className="text-xs text-destructive font-bold mt-1">
                            {formatMoney(b.spent, b.currency)} / {formatMoney(b.limit, b.currency)}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {active === "transactions" && (
          <Card className="p-6 rounded-3xl border-2 border-primary/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
              <div>
                <div className="text-lg font-black">Transactions</div>
                <div className="text-sm text-muted-foreground">Tambah pemasukan, pengeluaran, atau transfer antar akun.</div>
              </div>
              <div className="flex items-center gap-2">
                <Button className="rounded-2xl font-bold" onClick={openNewTransaction}>
                  <Plus className="mr-2" size={18} />
                  Add Transaction
                </Button>
                <Button variant="outline" className="rounded-2xl" onClick={() => setTransferDialogOpen(true)}>
                  <ArrowLeftRight className="mr-2" size={18} />
                  Transfer
                </Button>
              </div>
            </div>

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
                    <TableCell colSpan={7} className="text-muted-foreground">
                      Belum ada transaksi di bulan ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{format(new Date(tx.date), "yyyy-MM-dd")}</TableCell>
                      <TableCell>
                        <Badge variant={tx.type === "EXPENSE" ? "secondary" : "outline"} className="rounded-xl">
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{tx.account.name}</TableCell>
                      <TableCell>{tx.category?.name || "-"}</TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {tx.tags.length ? tx.tags.map((t) => t.name).join(", ") : "-"}
                      </TableCell>
                      <TableCell className="font-mono font-bold">
                        {formatMoney(toNumber(tx.amount), tx.currency)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {tx.type !== "TRANSFER" && (
                            <Button variant="outline" size="icon" className="rounded-xl" onClick={() => openEditTransaction(tx)}>
                              <Pencil size={16} />
                            </Button>
                          )}
                          <Button variant="outline" size="icon" className="rounded-xl" onClick={() => deleteTransaction(tx.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        )}

        {active === "categories" && (
          <Card className="p-6 rounded-3xl border-2 border-primary/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-lg font-black">Categories</div>
                <div className="text-sm text-muted-foreground">Kategori default + bisa tambah sendiri.</div>
              </div>
              <Button className="rounded-2xl font-bold" onClick={() => setCategoryDialogOpen(true)}>
                <Plus className="mr-2" size={18} />
                New Category
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-muted/20 border border-primary/5">
                <div className="font-black mb-3">Expense</div>
                <div className="flex flex-wrap gap-2">
                  {expenseCategories.map((c) => (
                    <Badge key={c.id} variant="secondary" className="rounded-xl">
                      {c.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-muted/20 border border-primary/5">
                <div className="font-black mb-3">Income</div>
                <div className="flex flex-wrap gap-2">
                  {incomeCategories.map((c) => (
                    <Badge key={c.id} variant="outline" className="rounded-xl">
                      {c.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {active === "budgets" && (
          <Card className="p-6 rounded-3xl border-2 border-primary/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-lg font-black">Budgets</div>
                <div className="text-sm text-muted-foreground">Set limit budget bulanan per kategori.</div>
              </div>
              <Button className="rounded-2xl font-bold" onClick={() => setBudgetDialogOpen(true)}>
                <Plus className="mr-2" size={18} />
                Set Budget
              </Button>
            </div>

            <div className="space-y-3">
              {budgets.length === 0 ? (
                <div className="text-muted-foreground">Belum ada budget untuk bulan ini.</div>
              ) : (
                budgets.map((b) => {
                  const spent = toNumber(b.spent);
                  const limit = toNumber(b.limit);
                  const progress = limit === 0 ? 0 : (spent / limit) * 100;
                  const isOver = spent > limit;
                  return (
                    <div key={b.id} className={`p-4 rounded-2xl border ${isOver ? "border-destructive/20 bg-destructive/10" : "border-primary/5 bg-muted/20"}`}>
                      <div className="flex items-center justify-between">
                        <div className="font-black">{b.category.name}</div>
                        <Badge variant="secondary" className="rounded-xl">{b.currency}</Badge>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {formatMoney(spent, b.currency)} / {formatMoney(limit, b.currency)} • {progress.toFixed(0)}%
                      </div>
                      <div className="mt-3 w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`${isOver ? "bg-destructive" : "bg-primary"} h-2`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      {isOver && <div className="mt-2 text-xs font-bold text-destructive">Budget exceeded</div>}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        )}

        {active === "accounts" && (
          <Card className="p-6 rounded-3xl border-2 border-primary/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-lg font-black">Accounts</div>
                <div className="text-sm text-muted-foreground">Cash, Bank, E-wallet. Transfer antar akun tersedia.</div>
              </div>
              <Button className="rounded-2xl font-bold" onClick={() => setAccountDialogOpen(true)}>
                <Plus className="mr-2" size={18} />
                New Account
              </Button>
            </div>

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
                    <TableCell className="font-bold">{a.name}</TableCell>
                    <TableCell>{a.type}</TableCell>
                    <TableCell>{a.currency}</TableCell>
                    <TableCell className="font-mono">{a.initialBalance}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {active === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="p-6 rounded-3xl border-2 border-primary/10 lg:col-span-6">
              <div className="text-lg font-black mb-4">Pie (Top Categories)</div>
              <ChartContainer
                className="w-full"
                config={{
                  value: { label: "Expense", color: "hsl(var(--primary))" },
                }}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Tooltip content={<ChartTooltipContent />} />
                    <Pie data={chartPieData} dataKey="value" nameKey="name" fill="var(--color-value)" />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Card>

            <Card className="p-6 rounded-3xl border-2 border-primary/10 lg:col-span-6">
              <div className="text-lg font-black mb-4">Line (Monthly Expense)</div>
              <ChartContainer
                className="w-full"
                config={{
                  expense: { label: "Expense", color: "hsl(var(--primary))" },
                }}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartLineData}>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="expense" stroke="var(--color-expense)" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Card>
          </div>
        )}

        {active === "goals" && (
          <Card className="p-6 rounded-3xl border-2 border-primary/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-lg font-black">Goals</div>
                <div className="text-sm text-muted-foreground">Target tabungan dan progress pencapaian.</div>
              </div>
              <Button className="rounded-2xl font-bold" onClick={() => setGoalDialogOpen(true)}>
                <Plus className="mr-2" size={18} />
                New Goal
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.length === 0 ? (
                <div className="text-muted-foreground">Belum ada goals.</div>
              ) : (
                goals.map((g) => {
                  const current = toNumber(g.currentAmount);
                  const target = toNumber(g.targetAmount);
                  const progress = target === 0 ? 0 : (current / target) * 100;
                  return (
                    <div key={g.id} className="p-5 rounded-3xl border border-primary/10 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-black">{g.name}</div>
                        <Badge variant="secondary" className="rounded-xl">{g.currency}</Badge>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {formatMoney(current, g.currency)} / {formatMoney(target, g.currency)} • {progress.toFixed(0)}%
                      </div>
                      <div className="mt-3 w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className="bg-primary h-2" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                      {g.targetDate && (
                        <div className="mt-3 text-xs text-muted-foreground">
                          Target date: {format(new Date(g.targetDate), "yyyy-MM-dd")}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        )}
      </div>

      <MoneyTrackerNavbar active={active} onChange={setActive} />

      <Dialog open={txDialogOpen} onOpenChange={setTxDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-black">{txEditing ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
            <DialogDescription>Income atau expense dengan kategori dan tags.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold">Type</Label>
              <Select value={txForm.type} onValueChange={(v) => setTxForm((p) => ({ ...p, type: asIncomeExpense(v), categoryId: "" }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">EXPENSE</SelectItem>
                  <SelectItem value="INCOME">INCOME</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Account</Label>
              <Select value={txForm.accountId} onValueChange={(v) => setTxForm((p) => ({ ...p, accountId: v }))}>
                <SelectTrigger className="w-full">
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
              <Label className="font-bold">Category</Label>
              <Select value={txForm.categoryId} onValueChange={(v) => setTxForm((p) => ({ ...p, categoryId: v }))}>
                <SelectTrigger className="w-full">
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
              <Label className="font-bold">Date</Label>
              <Input type="date" value={txForm.date} onChange={(e) => setTxForm((p) => ({ ...p, date: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Amount</Label>
              <Input inputMode="decimal" value={txForm.amount} onChange={(e) => setTxForm((p) => ({ ...p, amount: e.target.value }))} placeholder="100000" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Currency</Label>
              <Input value={txForm.currency} onChange={(e) => setTxForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))} placeholder="IDR" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="font-bold">Tags</Label>
              <Input
                value={txForm.tags}
                onChange={(e) => setTxForm((p) => ({ ...p, tags: e.target.value }))}
                placeholder="contoh: groceries, family"
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 10).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="text-xs px-2 py-1 rounded-xl border border-primary/10 hover:bg-primary/5"
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

            <div className="space-y-2 md:col-span-2">
              <Label className="font-bold">Note</Label>
              <Input value={txForm.note} onChange={(e) => setTxForm((p) => ({ ...p, note: e.target.value }))} placeholder="Optional" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-2xl" onClick={() => setTxDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button className="rounded-2xl font-bold" onClick={saveTransaction} disabled={loading}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-black">Transfer</DialogTitle>
            <DialogDescription>Pindahkan saldo antar akun (currency harus sama).</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold">From</Label>
              <Select value={transferForm.fromAccountId} onValueChange={(v) => setTransferForm((p) => ({ ...p, fromAccountId: v }))}>
                <SelectTrigger className="w-full">
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
              <Label className="font-bold">To</Label>
              <Select value={transferForm.toAccountId} onValueChange={(v) => setTransferForm((p) => ({ ...p, toAccountId: v }))}>
                <SelectTrigger className="w-full">
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
              <Label className="font-bold">Amount</Label>
              <Input inputMode="decimal" value={transferForm.amount} onChange={(e) => setTransferForm((p) => ({ ...p, amount: e.target.value }))} placeholder="50000" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Date</Label>
              <Input type="date" value={transferForm.date} onChange={(e) => setTransferForm((p) => ({ ...p, date: e.target.value }))} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="font-bold">Note</Label>
              <Input value={transferForm.note} onChange={(e) => setTransferForm((p) => ({ ...p, note: e.target.value }))} placeholder="Optional" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-2xl" onClick={() => setTransferDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button className="rounded-2xl font-bold" onClick={saveTransfer} disabled={loading}>
              Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-black">New Category</DialogTitle>
            <DialogDescription>Buat kategori untuk income atau expense.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold">Kind</Label>
              <Select value={categoryForm.kind} onValueChange={(v) => setCategoryForm((p) => ({ ...p, kind: asIncomeExpense(v) }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select kind" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">EXPENSE</SelectItem>
                  <SelectItem value="INCOME">INCOME</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Name</Label>
              <Input value={categoryForm.name} onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-2xl" onClick={() => setCategoryDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button className="rounded-2xl font-bold" onClick={createCategory} disabled={loading}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-black">New Account</DialogTitle>
            <DialogDescription>Buat akun baru untuk tracking cash/bank/e-wallet.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold">Name</Label>
              <Input value={accountForm.name} onChange={(e) => setAccountForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Type</Label>
              <Select value={accountForm.type} onValueChange={(v) => setAccountForm((p) => ({ ...p, type: asAccountType(v) }))}>
                <SelectTrigger className="w-full">
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
                <Label className="font-bold">Currency</Label>
                <Input value={accountForm.currency} onChange={(e) => setAccountForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Initial</Label>
                <Input value={accountForm.initialBalance} onChange={(e) => setAccountForm((p) => ({ ...p, initialBalance: e.target.value }))} />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-2xl" onClick={() => setAccountDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button className="rounded-2xl font-bold" onClick={createAccount} disabled={loading}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-black">Set Budget</DialogTitle>
            <DialogDescription>Budget per kategori expense untuk bulan {month}.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold">Category</Label>
              <Select value={budgetForm.categoryId} onValueChange={(v) => setBudgetForm((p) => ({ ...p, categoryId: v }))}>
                <SelectTrigger className="w-full">
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
                <Label className="font-bold">Currency</Label>
                <Input value={budgetForm.currency} onChange={(e) => setBudgetForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Limit</Label>
                <Input value={budgetForm.limit} onChange={(e) => setBudgetForm((p) => ({ ...p, limit: e.target.value }))} placeholder="300000" />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-2xl" onClick={() => setBudgetDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button className="rounded-2xl font-bold" onClick={saveBudget} disabled={loading}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-black">New Goal</DialogTitle>
            <DialogDescription>Buat target tabungan dan track progress.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold">Name</Label>
              <Input value={goalForm.name} onChange={(e) => setGoalForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-bold">Currency</Label>
                <Input value={goalForm.currency} onChange={(e) => setGoalForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Target</Label>
                <Input value={goalForm.targetAmount} onChange={(e) => setGoalForm((p) => ({ ...p, targetAmount: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-bold">Current</Label>
                <Input value={goalForm.currentAmount} onChange={(e) => setGoalForm((p) => ({ ...p, currentAmount: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Target Date</Label>
                <Input type="date" value={goalForm.targetDate} onChange={(e) => setGoalForm((p) => ({ ...p, targetDate: e.target.value }))} />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-2xl" onClick={() => setGoalDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button className="rounded-2xl font-bold" onClick={createGoal} disabled={loading}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
