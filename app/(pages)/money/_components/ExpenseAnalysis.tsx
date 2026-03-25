import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { formatDashboardCurrency } from "../_lib/utils";
import type { DashboardViewText, InsightsResponse } from "../_types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

type ExpenseAnalysisProps = {
  insights: InsightsResponse | null;
  t: DashboardViewText;
};

// Skema perpaduan warna yang modern dan selaras untuk dark mode
const COLORS = [
  "#ef4444", // rose-500
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
  "#f97316", // orange-500
  "#6366f1", // indigo-500
  "#84cc16", // lime-500
];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

  if (percent < 0.04) return null; // Sembunyikan jika potongannya terlalu kecil (di bawah 4%) agar tidak tabrakan

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central" 
      className="text-[9px] font-bold drop-shadow-md sm:text-[11px]"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function ExpenseAnalysis({ insights, t }: ExpenseAnalysisProps) {
  const currentExpenses = insights?.expenseByCategory || [];
  const prevExpenses = insights?.expenseByCategoryPrev || [];
  const categoryMap = insights?.categoryMap || [];

  const getCatName = (id: number | null) => {
    if (!id) return t.otherItem;
    const targetId = Number(id);
    const found = categoryMap.find((c) => Number(c.id) === targetId);
    if (found) return found.name;

    const inCur = currentExpenses.find((x) => Number(x.categoryId) === targetId);
    if (inCur && inCur.category) return inCur.category;

    const inPrev = prevExpenses.find((x) => Number(x.categoryId) === targetId);
    if (inPrev && inPrev.category) return inPrev.category;

    return t.otherItem;
  };

  // 1. PENGELUARAN TERTINGGI (Sub Kategori)
  const subCategoryRanking = useMemo(() => {
    const sorted = [...currentExpenses].sort((a, b) => b.amount - a.amount);
    return sorted
      .filter((c) => c.amount > 0)
      .map((c) => ({ ...c, name: c.category || t.otherItem }))
      .slice(0, 21);
  }, [currentExpenses, t]);

  // 2. ALOKASI KATEGORI PENGELUARAN (Induk/Parent)
  const parentAllocations = useMemo(() => {
    const map = new Map<number | null, number>();
    for (const row of currentExpenses) {
      const parentId = row.parentId || row.categoryId;
      const current = map.get(parentId) || 0;
      map.set(parentId, current + row.amount);
    }

    const arr = Array.from(map.entries()).map(([pId, amount]) => ({
      name: getCatName(pId),
      value: amount,
    }));
    return arr.sort((a, b) => b.value - a.value);
  }, [currentExpenses, categoryMap]);

  const totalParentAlloc = parentAllocations.reduce((idx, item) => idx + item.value, 0);

  // 3. PENGELUARAN BULAN INI VS BULAN LALU (Sub Kategori)
  const comparisonList = useMemo(() => {
    const list: Array<{ name: string; current: number; prev: number; pct: number | null; diff: number }> = [];

    const allCatIds = new Set<number | null>();
    currentExpenses.forEach((c) => c.amount > 0 && allCatIds.add(c.categoryId));
    prevExpenses.forEach((c) => c.amount > 0 && allCatIds.add(c.categoryId));

    for (const cId of Array.from(allCatIds)) {
      const current = currentExpenses.find((x) => x.categoryId === cId)?.amount || 0;
      const prev = prevExpenses.find((x) => x.categoryId === cId)?.amount || 0;
      const diff = current - prev;
      
      let pct: number | null = null;
      if (prev > 0) {
        pct = (diff / prev) * 100;
      } else if (current > 0) {
        pct = null; // Penanda "Baru"
      } else {
        pct = 0;
      }

      list.push({ name: getCatName(cId), current, prev, pct, diff });
    }

    return list.sort((a, b) => b.current - a.current);
  }, [currentExpenses, prevExpenses, categoryMap]);

  if (!insights) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6 pb-4">
      
      {/* --- PANEL 1: PENGELUARAN TERTINGGI --- */}
      <Card className="flex flex-col h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl border border-border bg-card/80 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:rounded-3xl sm:p-4 lg:p-5">
        <div className="mb-3 flex flex-col gap-1 sm:mb-4">
          <h3 className="text-xs font-bold text-foreground dark:text-white sm:text-sm lg:text-base">{t.highestExpense}</h3>
          <p className="text-[10px] leading-snug text-muted-foreground dark:text-slate-400 sm:text-xs">{t.highestExpenseDesc}</p>
        </div>
        
        <div className="flex rounded-md bg-muted/60 px-3 py-2 text-[9px] font-semibold tracking-wide text-muted-foreground dark:bg-white/10 sm:px-4 sm:text-[10px] uppercase">
          <div className="w-6 sm:w-8 shrink-0">No</div>
          <div className="flex-1">{t.subCategory}</div>
          <div className="w-20 text-right sm:w-24 shrink-0">{t.total}</div>
        </div>
        <div className="flex-1 overflow-y-auto mt-1 scrollbar-thin">
          {subCategoryRanking.map((item, idx) => (
            <div key={idx} className="flex items-center px-3 py-2.5 text-[10px] text-foreground dark:text-slate-200 sm:px-4 sm:text-xs border-b border-border/40 hover:bg-accent/40 transition-colors last:border-0">
              <div className="w-6 font-medium text-muted-foreground sm:w-8 shrink-0">{idx + 1}</div>
              <div className="flex-1 truncate pr-2 font-medium">{item.name}</div>
              <div className="w-20 text-right font-bold sm:w-24 shrink-0">{formatDashboardCurrency(item.amount)}</div>
            </div>
          ))}
          {subCategoryRanking.length === 0 && (
            <div className="p-6 text-center text-xs text-muted-foreground">{t.noExpense}</div>
          )}
        </div>
      </Card>

      {/* --- PANEL 2: ALOKASI KATEGORI PENGELUARAN --- */}
      <Card className="flex flex-col h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl border border-border bg-card/80 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:rounded-3xl sm:p-4 lg:p-5">
        <div className="mb-3 flex flex-col gap-1 sm:mb-4">
          <h3 className="text-xs font-bold text-foreground dark:text-white sm:text-sm lg:text-base">{t.categoryAlloc}</h3>
          <p className="text-[10px] leading-snug text-muted-foreground dark:text-slate-400 sm:text-xs">{t.categoryAllocDesc}</p>
        </div>

        <div className="h-[180px] w-full shrink-0 sm:h-[200px] lg:h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={parentAllocations}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="85%"
                innerRadius="45%"
                paddingAngle={2}
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {parentAllocations.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value: number) => formatDashboardCurrency(value)}
                contentStyle={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(15,23,42,0.9)", color: "#fff", fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex rounded-md bg-muted/60 mt-1 px-3 py-2 text-[9px] font-semibold tracking-wide text-muted-foreground dark:bg-white/10 sm:px-4 sm:text-[10px] uppercase">
          <div className="flex-1">{t.parentCategory}</div>
          <div className="w-20 text-right sm:w-24 shrink-0">{t.total}</div>
        </div>
        <div className="flex-1 overflow-y-auto mt-1 scrollbar-thin">
          {parentAllocations.slice(0, 10).map((item, idx) => (
            <div key={idx} className="flex items-center px-3 py-2 text-[10px] text-foreground dark:text-slate-200 sm:px-4 sm:text-[11px] border-b border-border/40 hover:bg-accent/40 transition-colors last:border-0">
              <div className="flex-1 truncate pr-2 flex items-center gap-2 font-medium">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                {item.name}
              </div>
              <div className="w-20 text-right font-bold sm:w-24 shrink-0 px-0">{formatDashboardCurrency(item.value)}</div>
            </div>
          ))}
          {parentAllocations.length === 0 && (
            <div className="p-6 text-center text-xs text-muted-foreground">{t.noExpense}</div>
          )}
        </div>
      </Card>

      {/* --- PANEL 3: BULAN INI VS BULAN LALU --- */}
      <Card className="flex flex-col h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl border border-border bg-card/80 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:rounded-3xl sm:p-4 lg:p-5 md:col-span-2 lg:col-span-1">
        <div className="mb-3 flex flex-col gap-1 sm:mb-4">
          <h3 className="text-xs font-bold text-foreground dark:text-white sm:text-sm lg:text-base">{t.compareMonthly}</h3>
          <p className="text-[10px] leading-snug text-muted-foreground dark:text-slate-400 sm:text-xs">{t.compareMonthlyDesc}</p>
        </div>

        <div className="flex rounded-md bg-muted/60 px-2 py-2 text-[8px] font-semibold tracking-wide text-muted-foreground dark:bg-white/10 sm:px-3 sm:text-[9px] uppercase items-center">
          <div className="w-4 sm:w-5 shrink-0"></div>
          <div className="flex-1">{t.subCategory}</div>
          <div className="w-14 text-right sm:w-16 shrink-0">{t.thisMonth}</div>
          <div className="w-8 text-right sm:w-10 shrink-0 ml-1">%</div>
        </div>
        <div className="flex-1 overflow-y-auto mt-1 scrollbar-thin">
          {comparisonList.map((item, idx) => {
            const isUp = item.diff > 0;
            const isDown = item.diff < 0;

            let Icon = Minus;
            let colorClass = "text-slate-400 dark:text-slate-500 opacity-60";
            if (isUp) {
              Icon = ArrowUp;
              colorClass = "text-rose-500";
            }
            if (isDown) {
              Icon = ArrowDown;
              colorClass = "text-emerald-500";
            }

            let pctText = "-";
            if (item.pct === null) {
              pctText = t.newItem;
            } else {
              pctText = `${Math.abs(Math.round(item.pct))}%`;
            }

            return (
              <div key={idx} className="flex items-center px-2 py-2.5 text-[9px] text-foreground dark:text-slate-200 sm:px-3 sm:text-[11px] border-b border-border/40 hover:bg-accent/40 transition-colors last:border-0">
                <div className={`w-4 flex justify-center shrink-0 sm:w-5 ${colorClass}`}>
                  <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={3} />
                </div>
                <div className="flex-1 truncate pr-1 font-medium">{item.name}</div>
                <div className="w-14 text-right tracking-tight shrink-0 sm:w-16">{formatDashboardCurrency(item.current)}</div>
                <div className={`w-8 text-right font-bold shrink-0 sm:w-10 ml-1 ${colorClass}`}>{pctText}</div>
              </div>
            );
          })}
          {comparisonList.length === 0 && (
            <div className="p-6 text-center text-xs text-muted-foreground">{t.noExpense}</div>
          )}
        </div>
      </Card>

    </div>
  );
}
