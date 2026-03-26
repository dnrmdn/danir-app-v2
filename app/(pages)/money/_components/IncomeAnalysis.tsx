import React, { useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { formatDashboardCurrency } from "../_lib/utils";
import type { DashboardViewText, InsightsResponse } from "../_types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from "recharts";

type IncomeAnalysisProps = {
  insights: InsightsResponse | null;
  t: DashboardViewText;
};

// Skema perpaduan warna yang modern dan selaras untuk dark mode
const COLORS = [
  "#10b981", // emerald-500
  "#3b82f6", // blue-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
  "#f97316", // orange-500
  "#6366f1", // indigo-500
  "#84cc16", // lime-500
  "#ef4444", // rose-500
];

type PieLabelProps = {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelProps) => {
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

export function IncomeAnalysis({ insights, t }: IncomeAnalysisProps) {
  const currentIncomes = useMemo(() => insights?.incomeByCategory ?? [], [insights]);
  const prevIncomes = useMemo(() => insights?.incomeByCategoryPrev ?? [], [insights]);
  const categoryMap = useMemo(() => insights?.categoryMap ?? [], [insights]);

  const getCatName = useCallback((id: number | null) => {
    if (!id) return t.otherItem;
    const targetId = Number(id);
    const found = categoryMap.find((c) => Number(c.id) === targetId);
    if (found) return found.name;

    const inCur = currentIncomes.find((x) => Number(x.categoryId) === targetId);
    if (inCur && inCur.category) return inCur.category;

    const inPrev = prevIncomes.find((x) => Number(x.categoryId) === targetId);
    if (inPrev && inPrev.category) return inPrev.category;

    return t.otherItem;
  }, [categoryMap, currentIncomes, prevIncomes, t.otherItem]);

  // 1. PEMASUKAN TERTINGGI (Sub Kategori) - TOP 10
  const subCategoryRanking = useMemo(() => {
    const sorted = [...currentIncomes].sort((a, b) => b.amount - a.amount);
    return sorted
      .filter((c) => c.amount > 0)
      .map((c) => ({ ...c, name: c.category || t.otherItem }))
      .slice(0, 10);
  }, [currentIncomes, t]);

  // 2. ALOKASI KATEGORI PEMASUKAN (Induk/Parent)
  const parentAllocations = useMemo(() => {
    const map = new Map<number | null, number>();
    for (const row of currentIncomes) {
      const parentId = row.parentId || row.categoryId;
      const current = map.get(parentId) || 0;
      map.set(parentId, current + row.amount);
    }

    const arr = Array.from(map.entries()).map(([pId, amount]) => ({
      name: getCatName(pId),
      value: amount,
    }));
    return arr.sort((a, b) => b.value - a.value);
  }, [currentIncomes, getCatName]);

  // 3. PEMASUKAN BULAN INI VS BULAN LALU (Chart Horizontal)
  const comparisonList = useMemo(() => {
    const list: Array<{ name: string; current: number; prev: number }> = [];

    const allCatIds = new Set<number | null>();
    currentIncomes.forEach((c) => c.amount > 0 && allCatIds.add(c.categoryId));
    prevIncomes.forEach((c) => c.amount > 0 && allCatIds.add(c.categoryId));

    for (const cId of Array.from(allCatIds)) {
      const current = currentIncomes.find((x) => x.categoryId === cId)?.amount || 0;
      const prev = prevIncomes.find((x) => x.categoryId === cId)?.amount || 0;
      list.push({ name: getCatName(cId), current, prev });
    }

    // Top 8 perbandingan agar chart bar tidak terlalu sesak, diurutkan by bulan ini terbanyak.
    return list.sort((a, b) => b.current - a.current).slice(0, 8);
  }, [currentIncomes, getCatName, prevIncomes]);

  if (!insights) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6 pb-4">

      {/* --- PANEL 1: PEMASUKAN TERTINGGI --- */}
      <Card className="flex flex-col h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl border border-border bg-card/80 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:rounded-3xl sm:p-4 lg:p-5">
        <div className="mb-3 flex flex-col gap-1 sm:mb-4">
          <h3 className="text-xs font-bold text-foreground dark:text-white sm:text-sm lg:text-base">{t.highestIncome}</h3>
          <p className="text-[10px] leading-snug text-muted-foreground dark:text-slate-400 sm:text-xs">{t.highestIncomeDesc}</p>
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
              <div className="w-20 text-right font-bold sm:w-24 shrink-0 text-emerald-500">{formatDashboardCurrency(item.amount)}</div>
            </div>
          ))}
          {subCategoryRanking.length === 0 && (
            <div className="p-6 text-center text-xs text-muted-foreground">{t.noIncome}</div>
          )}
        </div>
      </Card>

      {/* --- PANEL 2: ALOKASI KATEGORI PEMASUKAN --- */}
      <Card className="flex flex-col h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl border border-border bg-card/80 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:rounded-3xl sm:p-4 lg:p-5">
        <div className="mb-3 flex flex-col gap-1 sm:mb-4">
          <h3 className="text-xs font-bold text-foreground dark:text-white sm:text-sm lg:text-base">{t.categoryAlloc}</h3>
          <p className="text-[10px] leading-snug text-muted-foreground dark:text-slate-400 sm:text-xs">{t.categoryAllocDescInc}</p>
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
                {parentAllocations.map((_, index) => (
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
              <div className="w-20 text-right font-bold sm:w-24 shrink-0 text-emerald-500 px-0">{formatDashboardCurrency(item.value)}</div>
            </div>
          ))}
          {parentAllocations.length === 0 && (
            <div className="p-6 text-center text-xs text-muted-foreground">{t.noIncome}</div>
          )}
        </div>
      </Card>

      {/* --- PANEL 3: BULAN INI VS BULAN LALU (CHART HORIZONTAL) --- */}
      <Card className="flex flex-col h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl border border-border bg-card/80 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:rounded-3xl sm:p-4 lg:p-5 md:col-span-2 lg:col-span-1">
        <div className="mb-3 flex flex-col gap-1 sm:mb-4">
          <h3 className="text-xs font-bold text-foreground dark:text-white sm:text-sm lg:text-base">{t.compareMonthly}</h3>
          <p className="text-[10px] leading-snug text-muted-foreground dark:text-slate-400 sm:text-xs">{t.compareMonthlyDesc}</p>
        </div>

        <div className="flex-1 w-full mt-2">
          {comparisonList.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={comparisonList} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={80}
                  tick={{ fontSize: 10, fill: "currentColor" }}
                  className="text-muted-foreground dark:text-slate-400"
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  formatter={(value: number) => formatDashboardCurrency(value)}
                  contentStyle={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(15,23,42,0.9)", color: "#fff", fontSize: "12px" }}
                />
                <Bar dataKey="current" name={t.thisMonth} fill="#10b981" radius={[0, 4, 4, 0]} barSize={14} />
                <Bar dataKey="prev" name={t.lastMonth} fill="#64748b" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="p-6 text-center text-xs text-muted-foreground">{t.noData}</div>
          )}
        </div>

        {/* LENGEND for Chart */}
        <div className="flex items-center justify-center gap-4 mt-4 text-[9px] font-semibold tracking-wide text-muted-foreground sm:text-[10px]">
          <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-[#10b981]"></div> {t.thisMonth}</div>
          <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-[#64748b]"></div> {t.lastMonth}</div>
        </div>
      </Card>

    </div>
  );
}
