"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { id as localeID, enUS as localeEN } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, Coins, Gift, Link2, Soup, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";

type TaskItem = {
  id: number;
  memberId: number;
  label: string;
  date: string;
  time: string;
  completed: boolean;
  reward?: number | null;
  createdAt: string;
};

type RewardItem = {
  id: number;
  memberId: number;
  name: string;
  minStars: number;
  image: string;
  createdAt: string;
};

type MealEntry = {
  id: number;
  weekStart: string;
  dayIndex: number;
  mealType: "BREAKFAST" | "SNACK" | "LUNCH" | "DINNER";
  text: string;
  sortOrder: number;
  createdAt: string;
};

type SavedLinkItem = {
  id: number;
  url: string;
  title: string;
  label: string | null;
  previewImage: string | null;
  createdAt: string;
};

type FinanceTransaction = {
  id: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: string;
  currency: string;
  date: string;
  note: string | null;
  transferDirection?: "IN" | "OUT" | null;
};

type Member = {
  id: number;
  name: string;
};

type CalendarEvent = {
  id: string;
  kind: "task" | "reward" | "meal" | "money" | "link";
  title: string;
  subtitle?: string;
  date: Date;
  timeLabel?: string;
  tone: string;
};

const contentLocal = {
  id: {
    badge: "Kalender Bulanan Terpadu",
    subtitle: "Semua activity dari task, reward, meal plan, money, dan saved links ngumpul di satu kalender yang cakep.",
    today: "Hari Ini",
    monthlyEvents: "Event Bulanan",
    tasks: "Tugas",
    meals: "Makanan",
    moneyMoves: "Keuangan",
    savedLinks: "Simpanan Link",
    weekdayLabels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    selectedDayTitle: "Hari Terpilih",
    selectedDayDesc: "Semua catatan harian dari page lain masuk di sini biar gampang dipantau.",
    eventsLabel: "Event",
    noActivity: "Belum ada aktivitas",
    noActivityDesc: "Hari ini belum ada record. Tambahkan input di menu lain dan datanya bakal muncul di sini.",
    more: "lagi",
    mealLabels: { BREAKFAST: "Sarapan", SNACK: "Cemilan", LUNCH: "Makan Siang", DINNER: "Makan Malam" },
    fallbacks: { task: "Tugas", reward: "Hadiah", link: "Link", money: "Uang", meal: "Makanan" },
    rewardClaimed: "Hadiah diklaim",
    rewardSubtitle: "Bintang",
    savedSubtitle: "Link tersimpan"
  },
  en: {
    badge: "Unified monthly planner",
    subtitle: "All your activities from tasks, rewards, meal plans, money, and saved links gathered in one beautiful calendar.",
    today: "Today",
    monthlyEvents: "Monthly events",
    tasks: "Tasks",
    meals: "Meals",
    moneyMoves: "Money moves",
    savedLinks: "Saved links",
    weekdayLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    selectedDayTitle: "Selected day",
    selectedDayDesc: "All daily notes from other pages appear here, making them easy to monitor.",
    eventsLabel: "Events",
    noActivity: "No activity yet",
    noActivityDesc: "Today is still empty. Items will appear here once you input them from other pages.",
    more: "more",
    mealLabels: { BREAKFAST: "Breakfast", SNACK: "Snack", LUNCH: "Lunch", DINNER: "Dinner" },
    fallbacks: { task: "Task", reward: "Reward", link: "Link", money: "Money", meal: "Meal" },
    rewardClaimed: "Reward claimed",
    rewardSubtitle: "Stars",
    savedSubtitle: "Saved link"
  }
};

function getEventTone(kind: CalendarEvent["kind"]) {
  switch (kind) {
    case "task":
      return "border-cyan-200 bg-cyan-100 text-cyan-800 dark:border-cyan-300/20 dark:bg-cyan-400/10 dark:text-cyan-100";
    case "reward":
      return "border-violet-200 bg-violet-100 text-violet-800 dark:border-violet-300/20 dark:bg-violet-400/10 dark:text-violet-100";
    case "meal":
      return "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-300/20 dark:bg-amber-400/10 dark:text-amber-100";
    case "money":
      return "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-100";
    case "link":
      return "border-pink-200 bg-pink-100 text-pink-800 dark:border-pink-300/20 dark:bg-pink-400/10 dark:text-pink-100";
  }
}

function getEventDot(kind: CalendarEvent["kind"]) {
  switch (kind) {
    case "task":
      return "bg-cyan-400 dark:bg-cyan-300";
    case "reward":
      return "bg-violet-400 dark:bg-violet-300";
    case "meal":
      return "bg-amber-400 dark:bg-amber-300";
    case "money":
      return "bg-emerald-400 dark:bg-emerald-300";
    case "link":
      return "bg-pink-400 dark:bg-pink-300";
  }
}

function formatMoney(amount: string, currency: string) {
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) return `${currency} ${amount}`;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(numeric);
}

function getDateFromTask(task: TaskItem) {
  const raw = `${task.date}T${task.time && task.time.length >= 4 ? task.time : "00:00"}`;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date(task.createdAt) : parsed;
}

function getWeekStartString(date: Date) {
  return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
}

async function safeFetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(url, {
      credentials: "same-origin",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Calendar fetch failed: ${url} (${response.status})`);
      return fallback;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`Calendar fetch crashed: ${url}`, error);
    return fallback;
  }
}

export default function CalendarPage() {
  const { locale } = useLanguage();
  const t = contentLocal[locale];
  const dateLocale = locale === "id" ? localeID : localeEN;

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [savedLinks, setSavedLinks] = useState<SavedLinkItem[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const gridStartKey = format(gridStart, "yyyy-MM-dd");
  const gridEndKey = format(gridEnd, "yyyy-MM-dd");
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  useEffect(() => {
    const loadCalendarData = async () => {
      setLoading(true);
      try {
        const start = parseISO(`${gridStartKey}T00:00:00`);
        const end = parseISO(`${gridEndKey}T23:59:59`);
        const weekStarts = Array.from(new Set(eachDayOfInterval({ start, end }).map((date) => getWeekStartString(date))));

        const [taskData, linksData, membersData, financeData, ...mealData] = await Promise.all([
          safeFetchJson<{ success?: boolean; data?: TaskItem[] }>("/api/task", { success: false, data: [] }),
          safeFetchJson<{ success?: boolean; data?: SavedLinkItem[] }>("/api/links", { success: false, data: [] }),
          safeFetchJson<{ success?: boolean; data?: Member[] }>("/api/member", { success: false, data: [] }),
          safeFetchJson<{ success?: boolean; data?: FinanceTransaction[] }>(`/api/finance/transactions?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`, { success: false, data: [] }),
          ...weekStarts.map((weekStart) =>
            safeFetchJson<{ success?: boolean; data?: { weekStart: string; entries: Omit<MealEntry, "weekStart">[] } }>(`/api/meal-plan?weekStart=${encodeURIComponent(weekStart)}`, { success: false, data: { weekStart, entries: [] } }),
          ),
        ]);

        const memberList: Member[] = membersData?.success ? (membersData.data ?? []).map((member: Member) => ({ id: member.id, name: member.name })) : [];
        setMembers(memberList);

        setTasks(taskData?.success ? (taskData.data ?? []) : []);

        const rewardRequests = await Promise.all(
          memberList.map(async (member) => {
            const data = await safeFetchJson<{ success?: boolean; data?: RewardItem[] }>(`/api/reward?memberId=${encodeURIComponent(String(member.id))}`, { success: false, data: [] });
            return data?.success ? (data.data ?? []) : [];
          }),
        );
        setRewards(rewardRequests.flat());

        setSavedLinks(linksData?.success ? (linksData.data ?? []) : []);
        setTransactions(financeData?.success ? (financeData.data ?? []) : []);
        setMealEntries(
          mealData.flatMap((entry) =>
            entry?.success
              ? (entry.data?.entries ?? []).map((meal: Omit<MealEntry, "weekStart">) => ({
                  ...meal,
                  weekStart: entry.data?.weekStart ?? "",
                }))
              : [],
          ),
        );
      } catch (error) {
        console.error("Failed to load calendar data:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadCalendarData();
  }, [gridEndKey, gridStartKey]);

  const memberById = useMemo(() => new Map(members.map((member) => [member.id, member.name])), [members]);

  const events = useMemo<CalendarEvent[]>(() => {
    const generated: CalendarEvent[] = [];

    tasks.forEach((task) => {
      const date = getDateFromTask(task);
      generated.push({
        id: `task-${task.id}`,
        kind: "task",
        title: task.label,
        subtitle: memberById.get(task.memberId) ?? t.fallbacks.task,
        date,
        timeLabel: task.time || format(date, "HH:mm"),
        tone: getEventTone("task"),
      });

      if (task.label.toLowerCase().includes("claim reward") || task.label.toLowerCase().includes("klaim hadiah")) {
        generated.push({
          id: `reward-claim-${task.id}`,
          kind: "reward",
          title: t.rewardClaimed,
          subtitle: memberById.get(task.memberId) ?? t.fallbacks.reward,
          date,
          timeLabel: task.time || format(date, "HH:mm"),
          tone: getEventTone("reward"),
        });
      }
    });

    rewards.forEach((reward) => {
      const date = new Date(reward.createdAt);
      generated.push({
        id: `reward-${reward.id}`,
        kind: "reward",
        title: reward.name,
        subtitle: `${reward.minStars} ${t.rewardSubtitle.toLowerCase()} · ${memberById.get(reward.memberId) ?? t.fallbacks.reward}`,
        date,
        timeLabel: format(date, "HH:mm"),
        tone: getEventTone("reward"),
      });
    });

    savedLinks.forEach((link) => {
      const date = new Date(link.createdAt);
      generated.push({
        id: `link-${link.id}`,
        kind: "link",
        title: link.title,
        subtitle: link.label ?? t.savedSubtitle,
        date,
        timeLabel: format(date, "HH:mm"),
        tone: getEventTone("link"),
      });
    });

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      generated.push({
        id: `money-${transaction.id}`,
        kind: "money",
        title: transaction.note || transaction.type,
        subtitle: formatMoney(transaction.amount, transaction.currency),
        date,
        timeLabel: format(date, "HH:mm"),
        tone: getEventTone("money"),
      });
    });

    mealEntries.forEach((meal) => {
      const weekStartDate = parseISO(meal.weekStart);
      const mealDate = addDays(weekStartDate, meal.dayIndex);
      if (mealDate >= gridStart && mealDate <= gridEnd) {
        generated.push({
          id: `meal-${meal.id}-${meal.weekStart}`,
          kind: "meal",
          title: meal.text,
          subtitle: t.mealLabels[meal.mealType],
          date: mealDate,
          tone: getEventTone("meal"),
        });
      }
    });

    return generated.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [gridEnd, gridStart, mealEntries, memberById, rewards, savedLinks, tasks, transactions, t]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const key = format(event.date, "yyyy-MM-dd");
      const existing = map.get(key) ?? [];
      existing.push(event);
      map.set(key, existing);
    });
    return map;
  }, [events]);

  const selectedEvents = eventsByDay.get(format(selectedDate, "yyyy-MM-dd")) ?? [];

  const stats = useMemo(() => {
    const visibleEvents = events.filter((event) => isSameMonth(event.date, currentMonth));
    return {
      total: visibleEvents.length,
      tasks: visibleEvents.filter((event) => event.kind === "task").length,
      meals: visibleEvents.filter((event) => event.kind === "meal").length,
      money: visibleEvents.filter((event) => event.kind === "money").length,
      links: visibleEvents.filter((event) => event.kind === "link").length,
    };
  }, [currentMonth, events]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[1.25rem] border border-border bg-card/80 p-3 shadow-sm dark:border-white/10 dark:bg-[#08111f]/90 dark:shadow-2xl dark:shadow-cyan-950/20 backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
              <CalendarDays className="h-3.5 w-3.5" />
              {t.badge}
            </div>
            <h1 className="text-3xl font-black text-foreground sm:text-4xl">{format(currentMonth, "MMMM yyyy", { locale: dateLocale })}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground dark:text-slate-400">{t.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} variant="outline" className="rounded-2xl border-border bg-background text-foreground hover:bg-muted dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              onClick={() => {
                const today = new Date();
                setCurrentMonth(startOfMonth(today));
                setSelectedDate(today);
              }}
              variant="outline"
              className="rounded-2xl border-cyan-200 bg-cyan-100/50 text-cyan-800 hover:bg-cyan-100 dark:border-cyan-300/15 dark:bg-cyan-400/10 dark:text-cyan-100 dark:hover:bg-cyan-400/15"
            >
              {t.today}
            </Button>
            <Button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} variant="outline" className="rounded-2xl border-border bg-background text-foreground hover:bg-muted dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-4 gap-2 sm:mb-6 sm:grid-cols-2 sm:gap-3 xl:grid-cols-5">
          {[
            { label: t.monthlyEvents, value: stats.total, icon: Target, tone: "text-cyan-800 bg-cyan-100 border-cyan-200 dark:text-cyan-100 dark:bg-cyan-400/10 dark:border-cyan-300/15" },
            { label: t.tasks, value: stats.tasks, icon: Target, tone: "text-cyan-800 bg-cyan-100 border-cyan-200 dark:text-cyan-100 dark:bg-cyan-400/10 dark:border-cyan-300/15" },
            { label: t.meals, value: stats.meals, icon: Soup, tone: "text-amber-800 bg-amber-100 border-amber-200 dark:text-amber-100 dark:bg-amber-400/10 dark:border-amber-300/15" },
            { label: t.moneyMoves, value: stats.money, icon: Coins, tone: "text-emerald-800 bg-emerald-100 border-emerald-200 dark:text-emerald-100 dark:bg-emerald-400/10 dark:border-emerald-300/15" },
            { label: t.savedLinks, value: stats.links, icon: Link2, tone: "text-pink-800 bg-pink-100 border-pink-200 dark:text-pink-100 dark:bg-pink-400/10 dark:border-pink-300/15" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`min-h-[82px] rounded-[0.95rem] border p-2 ${stat.label === t.savedLinks ? "col-span-4 sm:col-span-1" : "col-span-1"} sm:min-h-[unset] sm:rounded-[1.5rem] sm:p-4 ${stat.tone}`}>
                <div className="mb-1.5 inline-flex rounded-lg bg-black/5 dark:bg-black/10 p-1 sm:mb-3 sm:rounded-2xl sm:p-2">
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div className="text-base font-black leading-none sm:text-2xl">{stat.value}</div>
                <div className="mt-1 line-clamp-2 text-[9px] leading-3 opacity-80 sm:mt-1 sm:text-sm sm:leading-4">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[1.25rem] border border-border bg-secondary/30 dark:border-white/10 dark:bg-white/[0.04] p-2 sm:rounded-[1.75rem] sm:p-4">
            <div className="mb-2 grid grid-cols-7 gap-1 sm:mb-3 sm:gap-2">
              {t.weekdayLabels.map((label) => (
                <div key={label} className="px-0.5 py-1 text-center text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground sm:px-2 sm:py-2 sm:text-xs sm:tracking-[0.18em]">
                  {label}
                </div>
              ))}
            </div>

            <div className="grid w-full grid-cols-7 gap-1.5 sm:gap-2">
              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const dayEvents = eventsByDay.get(key) ?? [];
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={`flex min-h-[68px] flex-col rounded-[0.85rem] border p-1.5 text-left transition sm:min-h-[138px] sm:rounded-[1.4rem] sm:p-3 ${
                      isSelected ? "border-cyan-300 bg-cyan-50 shadow-md dark:border-cyan-300/30 dark:bg-cyan-400/10 dark:shadow-lg dark:shadow-cyan-950/20" : "border-border bg-card hover:bg-muted dark:border-white/10 dark:bg-[#07111f]/70 dark:hover:border-white/20 dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="mb-1 flex items-start justify-between sm:mb-3 sm:items-center">
                      <span
                        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold leading-none sm:h-8 sm:w-8 sm:text-sm ${
                          isToday ? "bg-gradient-to-br from-cyan-400 to-emerald-400 dark:from-cyan-300 dark:to-emerald-300 text-slate-50 dark:text-slate-950" : isSameMonth(day, currentMonth) ? "text-foreground" : "text-muted-foreground dark:text-slate-600"
                        }`}
                      >
                        {format(day, "d")}
                      </span>

                      <span className="shrink-0 text-[7px] font-medium leading-none text-muted-foreground sm:text-[10px] sm:uppercase sm:tracking-[0.18em]">{dayEvents.length}</span>
                    </div>

                    <div className="mt-auto flex min-h-[14px] items-end sm:mt-0 sm:block sm:min-h-0">
                      <div className="flex flex-wrap content-start gap-1 sm:hidden">
                        {dayEvents.slice(0, 4).map((event) => (
                          <span key={event.id} className={`h-1.5 w-1.5 rounded-full ${getEventDot(event.kind)}`} />
                        ))}
                      </div>

                      <div className="hidden space-y-2 sm:block">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div key={event.id} className={`rounded-lg border px-1.5 py-1 text-[9px] font-medium sm:rounded-xl sm:px-2 sm:py-1.5 sm:text-[11px] ${event.tone}`}>
                            <div className="truncate">{event.title}</div>
                          </div>
                        ))}

                        {dayEvents.length > 3 && (
                          <div className="rounded-md border border-border bg-secondary/50 dark:border-white/10 dark:bg-white/[0.04] px-1 py-0.5 text-[8px] font-semibold leading-3 text-muted-foreground sm:rounded-xl sm:px-2 sm:py-1.5 sm:text-[11px] sm:leading-normal">
                            +{dayEvents.length - 3} {t.more}
                          </div>
                        )}
                      </div>

                      {dayEvents.length === 0 && <div className="text-[8px] leading-none text-muted-foreground sm:pt-4 sm:text-[11px]">—</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-card/60 dark:border-white/10 dark:bg-white/[0.04] p-5">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-200">{t.selectedDayTitle}</div>
                <h2 className="mt-2 text-lg font-black leading-tight text-foreground sm:text-2xl">{format(selectedDate, "EEEE, d MMMM yyyy", { locale: dateLocale })}</h2>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.selectedDayDesc}</p>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/40 dark:border-white/10 dark:bg-[#07111f]/80 px-3 py-2 text-right">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t.eventsLabel}</div>
                <div className="text-xl font-black text-foreground">{selectedEvents.length}</div>
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-20 animate-pulse rounded-2xl bg-muted dark:bg-white/[0.04]" />
                  ))}
                </div>
              ) : selectedEvents.length > 0 ? (
                selectedEvents.map((event) => (
                  <div key={event.id} className={`rounded-[1.3rem] border p-4 ${event.tone}`}>
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] opacity-90">
                      <span className={`h-2.5 w-2.5 rounded-full ${getEventDot(event.kind)}`} />
                      {event.kind}
                      {event.timeLabel ? <span className="opacity-70">· {event.timeLabel}</span> : null}
                    </div>
                    <div className="text-sm font-semibold">{event.title}</div>
                    {event.subtitle ? <div className="mt-1 text-xs opacity-80">{event.subtitle}</div> : null}
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-border bg-secondary/40 dark:border-white/10 dark:bg-[#07111f]/70 px-5 py-10 text-center">
                  <Gift className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">{t.noActivity}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.noActivityDesc}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
