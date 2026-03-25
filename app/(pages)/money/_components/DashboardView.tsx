import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Landmark, PiggyBank, Wallet, WalletCards, Activity, Eye, EyeOff } from "lucide-react";
import { formatDashboardCurrency, toNumber } from "../_lib/utils";
import type { AccountLike, DashboardViewText, FinanceTransaction, InsightsResponse, MoneyNavId } from "../_types";
import { SummaryFinanceCard } from "./SummaryFinanceCard";
import { ExpenseAnalysis } from "./ExpenseAnalysis";
import { IncomeAnalysis } from "./IncomeAnalysis";
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { useTheme } from "next-themes";

type DashboardViewProps = {
  t: DashboardViewText;
  insights: InsightsResponse | null;
  transactions: FinanceTransaction[];
  accounts: AccountLike[];
  goals: unknown[];
  setActive: (tab: MoneyNavId) => void;
  monthStartEnd: { start: Date; end: Date };
};

function getAccountBalance(account: AccountLike) {
  if (account.balance != null) return toNumber(account.balance);
  if (account.currentBalance != null) return toNumber(account.currentBalance);
  if (account.initialBalance != null) return toNumber(account.initialBalance);
  return 0;
}

function normalizeAccountType(account: AccountLike) {
  const raw = String(account.type ?? account.accountType ?? account.kind ?? account.name ?? "").toLowerCase();

  if (raw.includes("cash") || raw.includes("tunai") || raw.includes("dompet")) {
    return "cash";
  }

  if (
    raw.includes("bank") ||
    raw.includes("bca") ||
    raw.includes("bri") ||
    raw.includes("bni") ||
    raw.includes("mandiri") ||
    raw.includes("cimb") ||
    raw.includes("permata") ||
    raw.includes("sea bank") ||
    raw.includes("seabank") ||
    raw.includes("jago")
  ) {
    return "bank";
  }

  if (raw.includes("ewallet") || raw.includes("e-wallet") || raw.includes("wallet digital") || raw.includes("ovo") || raw.includes("gopay") || raw.includes("dana") || raw.includes("shopeepay") || raw.includes("linkaja")) {
    return "ewallet";
  }

  return "other";
}

export function DashboardView({ t, insights, transactions, accounts, monthStartEnd }: DashboardViewProps) {
  const { theme } = useTheme();
  const [showSaldos, setShowSaldos] = useState(false);
  const lineColor = theme === "dark" ? "#ffffff" : "#0f172a"; // slate-900
  const dashboardTotals = useMemo(() => {
    return insights?.totalsByCurrency ?? [];
  }, [insights]);
  
  const hiddenText = "Rp •••••••";

  const totalIncome = useMemo(() => {
    return dashboardTotals.reduce((sum: number, item) => sum + toNumber(item.income), 0);
  }, [dashboardTotals]);

  const totalExpense = useMemo(() => {
    return dashboardTotals.reduce((sum: number, item) => sum + toNumber(item.expense), 0);
  }, [dashboardTotals]);

  const totalPrevIncome = useMemo(() => {
    return dashboardTotals.reduce((sum: number, item) => sum + toNumber(item.prevIncome), 0);
  }, [dashboardTotals]);

  const totalPrevExpense = useMemo(() => {
    return dashboardTotals.reduce((sum: number, item) => sum + toNumber(item.prevExpense), 0);
  }, [dashboardTotals]);

  const totalCount = useMemo(() => {
    return dashboardTotals.reduce((sum: number, item) => sum + toNumber(item.count), 0);
  }, [dashboardTotals]);

  const totalPrevCount = useMemo(() => {
    return dashboardTotals.reduce((sum: number, item) => sum + toNumber(item.prevCount), 0);
  }, [dashboardTotals]);

  const countTrend = useMemo(() => {
    if (totalPrevCount === 0 && totalCount === 0) return undefined;
    const diff = totalCount - totalPrevCount;
    const pct = totalPrevCount === 0 ? null : (diff / totalPrevCount) * 100;

    let direction: "up" | "down" | "neutral" = "neutral";
    if (diff > 0) direction = "up";
    else if (diff < 0) direction = "down";

    let text = "";
    if (pct !== null) {
      text = `${direction === "up" ? "+" : ""}${pct.toFixed(1)}% (bln lalu)`;
    } else {
      text = diff > 0 ? "+100% (bln lalu)" : "0% (bln lalu)";
    }

    return {
      direction,
      value: text,
      isPositive: diff < 0, // Merah untuk naik, hijau untuk turun
    };
  }, [totalCount, totalPrevCount]);

  const incomeTrend = useMemo(() => {
    if (totalPrevIncome === 0 && totalIncome === 0) return undefined;
    const diff = totalIncome - totalPrevIncome;
    const pct = totalPrevIncome === 0 ? null : (diff / totalPrevIncome) * 100;

    let direction: "up" | "down" | "neutral" = "neutral";
    if (diff > 0) direction = "up";
    else if (diff < 0) direction = "down";

    let text = "";
    if (pct !== null) {
      text = `${direction === "up" ? "+" : ""}${pct.toFixed(1)}% (bln lalu)`;
    } else {
      text = diff > 0 ? "+100% (bln lalu)" : "0% (bln lalu)";
    }

    return {
      direction,
      value: text,
      isPositive: diff > 0, // Green if income increases
    };
  }, [totalIncome, totalPrevIncome]);

  const expenseTrend = useMemo(() => {
    if (totalPrevExpense === 0 && totalExpense === 0) return undefined;
    const diff = totalExpense - totalPrevExpense;
    const pct = totalPrevExpense === 0 ? null : (diff / totalPrevExpense) * 100;

    let direction: "up" | "down" | "neutral" = "neutral";
    if (diff > 0) direction = "up";
    else if (diff < 0) direction = "down";

    let text = "";
    if (pct !== null) {
      text = `${direction === "up" ? "+" : ""}${pct.toFixed(1)}% (bln lalu)`;
    } else {
      text = diff > 0 ? "+100% (bln lalu)" : "0% (bln lalu)";
    }

    return {
      direction,
      value: text,
      isPositive: diff < 0, // Green if expense decreases
    };
  }, [totalExpense, totalPrevExpense]);

  const groupedAccountBalances = useMemo(() => {
    return accounts.reduce(
      (acc, account) => {
        const normalizedType = normalizeAccountType(account);
        const amount = getAccountBalance(account);

        if (normalizedType === "cash") acc.cash += amount;
        else if (normalizedType === "bank") acc.bank += amount;
        else if (normalizedType === "ewallet") acc.ewallet += amount;

        return acc;
      },
      {
        cash: 0,
        bank: 0,
        ewallet: 0,
      },
    );
  }, [accounts]);

  const totalBalance = useMemo(() => {
    return Object.values(groupedAccountBalances).reduce((sum, val) => sum + val, 0);
  }, [groupedAccountBalances]);

  const topSpending = useMemo(() => {
    const rows = insights?.expenseByCategory ?? [];

    if (!rows.length) {
      return {
        category: "-",
        amount: 0,
      };
    }

    const highest = rows.reduce((max, row) => {
      return toNumber(row.amount) > toNumber(max.amount) ? row : max;
    }, rows[0]);

    return {
      category: highest.category || "Unknown",
      amount: toNumber(highest.amount),
    };
  }, [insights]);

  const dailyExpenseData = useMemo(() => {
    const start = monthStartEnd.start;
    const end = monthStartEnd.end;
    const daysInMonth = end.getDate();

    const base = Array.from({ length: daysInMonth }, (_, index) => ({
      day: String(index + 1).padStart(2, "0"),
      amount: 0,
    }));

    for (const tx of transactions ?? []) {
      const txDate = new Date(tx.date);
      if (Number.isNaN(txDate.getTime())) continue;

      if (txDate < start || txDate > end) continue;
      if (tx.type !== "EXPENSE") continue;

      const dayIndex = txDate.getDate() - 1;
      if (dayIndex < 0 || dayIndex >= base.length) continue;

      base[dayIndex].amount += toNumber(tx.amount);
    }

    return base;
  }, [transactions, monthStartEnd]);

  const maxDailyExpense = useMemo(() => {
    return dailyExpenseData.reduce((max, item) => {
      return item.amount > max ? item.amount : max;
    }, 0);
  }, [dailyExpenseData]);

  type DailyExpenseTooltipProps = {
    active?: boolean;
    payload?: Array<{ value?: number }>;
    label?: string;
  };

  const dailyExpenseTooltip = ({ active, payload, label }: DailyExpenseTooltipProps) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="rounded-2xl border border-border bg-card px-3 py-2 text-xs shadow-lg dark:border-white/10 dark:bg-slate-900">
        <div className="font-semibold text-foreground dark:text-white">Tanggal {label}</div>
        <div className="mt-1 text-muted-foreground dark:text-slate-300">Pengeluaran: {formatDashboardCurrency(payload[0]?.value ?? 0)}</div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold sm:text-base text-foreground">Ringkasan Keuangan</h2>
        <button 
          onClick={() => setShowSaldos(!showSaldos)}
          className="flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-muted dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 sm:text-xs transition-colors"
        >
          {showSaldos ? (
            <>
              <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> Sembunyikan Saldo
            </>
          ) : (
            <>
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" /> Tampilkan Saldo
            </>
          )}
        </button>
      </div>

      {/* Row 1 */}
      <div className="pb-1">
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">
          <div className="min-w-0">
            <SummaryFinanceCard title={t.balance} value={showSaldos ? formatDashboardCurrency(totalBalance) : hiddenText} badge="All" icon={<WalletCards className="h-3 w-3 text-emerald-600 dark:text-emerald-200 sm:h-5 sm:w-5" />} iconTone="bg-emerald-400/10" />
          </div>

          <div className="min-w-0">
            <SummaryFinanceCard
              title="Total Transaksi"
              value={totalCount.toString()}
              badge="Count"
              icon={<Activity className="h-3 w-3 text-fuchsia-600 dark:text-fuchsia-200 sm:h-5 sm:w-5" />}
              iconTone="bg-fuchsia-400/10"
              badgeTone="border-fuchsia-300/15 bg-fuchsia-400/10 text-fuchsia-600 dark:text-fuchsia-100"
              trend={countTrend}
            />
          </div>

          <div className="min-w-0">
            <SummaryFinanceCard
              title={t.income}
              value={showSaldos ? formatDashboardCurrency(totalIncome) : hiddenText}
              badge="In"
              icon={<ArrowUpRight className="h-3 w-3 text-cyan-600 dark:text-cyan-200 sm:h-5 sm:w-5" />}
              iconTone="bg-cyan-400/10"
              badgeTone="border-cyan-300/15 bg-cyan-400/10 text-cyan-600 dark:text-cyan-100"
              trend={showSaldos ? incomeTrend : undefined}
            />
          </div>

          <div className="min-w-0">
            <SummaryFinanceCard
              title={t.expense}
              value={showSaldos ? formatDashboardCurrency(totalExpense) : hiddenText}
              badge="Out"
              icon={<ArrowDownRight className="h-3 w-3 text-rose-600 dark:text-rose-200 sm:h-5 sm:w-5" />}
              iconTone="bg-rose-400/10"
              badgeTone="border-rose-300/15 bg-rose-400/10 text-rose-600 dark:text-rose-100"
              trend={showSaldos ? expenseTrend : undefined}
            />
          </div>


        </div>
      </div>

      {/* Row 2 */}
      <div className="pb-1">
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-3 sm:gap-3">
          <div className="min-w-0">
            <SummaryFinanceCard
              title="Cash"
              value={showSaldos ? formatDashboardCurrency(groupedAccountBalances.cash) : hiddenText}
              badge="Now"
              icon={<Wallet className="h-3 w-3 text-amber-600 dark:text-amber-200 sm:h-5 sm:w-5" />}
              iconTone="bg-amber-400/10"
              badgeTone="border-amber-300/15 bg-amber-400/10 text-amber-600 dark:text-amber-100"
            />
          </div>

          <div className="min-w-0">
            <SummaryFinanceCard
              title="Bank"
              value={showSaldos ? formatDashboardCurrency(groupedAccountBalances.bank) : hiddenText}
              badge="Now"
              icon={<Landmark className="h-3 w-3 text-indigo-600 dark:text-indigo-200 sm:h-5 sm:w-5" />}
              iconTone="bg-indigo-400/10"
              badgeTone="border-indigo-300/15 bg-indigo-400/10 text-indigo-600 dark:text-indigo-100"
            />
          </div>

          <div className="min-w-0">
            <SummaryFinanceCard
              title="E-Wallet"
              value={showSaldos ? formatDashboardCurrency(groupedAccountBalances.ewallet) : hiddenText}
              badge="Now"
              icon={<WalletCards className="h-3 w-3 text-teal-600 dark:text-teal-200 sm:h-5 sm:w-5" />}
              iconTone="bg-teal-400/10"
              badgeTone="border-teal-300/15 bg-teal-400/10 text-teal-600 dark:text-teal-100"
            />
          </div>
        </div>
      </div>

      {/* Row 3 - Daily Expense Chart */}
      <Card className="rounded-2xl border border-border bg-card/80 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:rounded-3xl sm:p-4 lg:p-5">
        <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-start sm:justify-between lg:items-center">
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-foreground dark:text-white sm:text-sm lg:text-base">Pengeluaran Harian</h3>
            <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground dark:text-slate-400 sm:text-xs lg:text-sm">Total pengeluaran per hari dalam bulan ini</p>
          </div>

          <div className="inline-flex w-fit shrink-0 rounded-full border border-border bg-muted px-2 py-1 text-[9px] font-medium text-muted-foreground dark:border-white/10 dark:bg-white/10 dark:text-slate-300 sm:px-2.5 sm:text-[10px] lg:text-xs">
            Max: {formatDashboardCurrency(maxDailyExpense)}
          </div>
        </div>

        <div className="h-[200px] w-full sm:h-[240px] md:h-[260px] lg:h-[300px] xl:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={dailyExpenseData}
              margin={{
                top: 8,
                right: 6,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />

              <XAxis dataKey="day" tickLine={false} axisLine={false} minTickGap={12} tickMargin={8} tick={{ fontSize: 10 }} />

              <YAxis
                tickLine={false}
                axisLine={false}
                width={42}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => {
                  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}M`;
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
                  if (value >= 1000) return `${Math.round(value / 1000)}rb`;
                  return `${value}`;
                }}
              />

              <Tooltip content={dailyExpenseTooltip} cursor={{ stroke: "#94a3b8", strokeWidth: 1 }} />

              <Bar dataKey="amount" radius={[4, 4, 0, 0]} className="fill-rose-500/60 dark:fill-rose-400/60" />

              <Line type="monotone" dataKey="amount" stroke={lineColor} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Row 4 - Pengeluaran Tertinggi, Alokasi & Komparasi */}
      <ExpenseAnalysis insights={insights} t={t} />

      {/* Row 5 - Pemasukan Tertinggi, Alokasi & Komparasi */}
      <IncomeAnalysis insights={insights} t={t} />
    </div>
  );
}
