"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Coins, Gift, Link2, Soup, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getEventTone(kind: CalendarEvent["kind"]) {
  switch (kind) {
    case "task":
      return "border-cyan-300/20 bg-cyan-400/10 text-cyan-100";
    case "reward":
      return "border-violet-300/20 bg-violet-400/10 text-violet-100";
    case "meal":
      return "border-amber-300/20 bg-amber-400/10 text-amber-100";
    case "money":
      return "border-emerald-300/20 bg-emerald-400/10 text-emerald-100";
    case "link":
      return "border-pink-300/20 bg-pink-400/10 text-pink-100";
  }
}

function getEventDot(kind: CalendarEvent["kind"]) {
  switch (kind) {
    case "task":
      return "bg-cyan-300";
    case "reward":
      return "bg-violet-300";
    case "meal":
      return "bg-amber-300";
    case "money":
      return "bg-emerald-300";
    case "link":
      return "bg-pink-300";
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

function getMealTypeLabel(type: MealEntry["mealType"]) {
  switch (type) {
    case "BREAKFAST":
      return "Breakfast";
    case "SNACK":
      return "Snack";
    case "LUNCH":
      return "Lunch";
    case "DINNER":
      return "Dinner";
  }
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
        subtitle: memberById.get(task.memberId) ?? "Task",
        date,
        timeLabel: task.time || format(date, "HH:mm"),
        tone: getEventTone("task"),
      });

      if (task.label.toLowerCase().includes("claim reward")) {
        generated.push({
          id: `reward-claim-${task.id}`,
          kind: "reward",
          title: "Reward claimed",
          subtitle: memberById.get(task.memberId) ?? "Reward",
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
        subtitle: `${reward.minStars} stars · ${memberById.get(reward.memberId) ?? "Reward"}`,
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
        subtitle: link.label ?? "Saved link",
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
          subtitle: getMealTypeLabel(meal.mealType),
          date: mealDate,
          tone: getEventTone("meal"),
        });
      }
    });

    return generated.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [gridEnd, gridStart, mealEntries, memberById, rewards, savedLinks, tasks, transactions]);

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
      <section className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#08111f]/90 p-3 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <CalendarDays className="h-3.5 w-3.5" />
              Unified monthly planner
            </div>
            <h1 className="text-3xl font-black text-white sm:text-4xl">{format(currentMonth, "MMMM yyyy")}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Semua activity dari task, reward, meal plan, money, dan saved links ngumpul di satu calendar yang cakep.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} variant="outline" className="rounded-2xl border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]">
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
              className="rounded-2xl border-cyan-300/15 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15"
            >
              Today
            </Button>
            <Button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} variant="outline" className="rounded-2xl border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-4 gap-2 sm:mb-6 sm:grid-cols-2 sm:gap-3 xl:grid-cols-5">
          {[
            { label: "Monthly events", value: stats.total, icon: Target, tone: "text-cyan-100 bg-cyan-400/10 border-cyan-300/15" },
            { label: "Tasks", value: stats.tasks, icon: Target, tone: "text-cyan-100 bg-cyan-400/10 border-cyan-300/15" },
            { label: "Meals", value: stats.meals, icon: Soup, tone: "text-amber-100 bg-amber-400/10 border-amber-300/15" },
            { label: "Money moves", value: stats.money, icon: Coins, tone: "text-emerald-100 bg-emerald-400/10 border-emerald-300/15" },
            { label: "Saved links", value: stats.links, icon: Link2, tone: "text-pink-100 bg-pink-400/10 border-pink-300/15" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`min-h-[82px] rounded-[0.95rem] border p-2 ${stat.label === "Saved links" ? "col-span-4 sm:col-span-1" : "col-span-1"} sm:min-h-[unset] sm:rounded-[1.5rem] sm:p-4 ${stat.tone}`}>
                <div className="mb-1.5 inline-flex rounded-lg bg-black/10 p-1 sm:mb-3 sm:rounded-2xl sm:p-2">
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div className="text-base font-black leading-none sm:text-2xl">{stat.value}</div>
                <div className="mt-1 line-clamp-2 text-[9px] leading-3 opacity-80 sm:mt-1 sm:text-sm sm:leading-4">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-2 sm:rounded-[1.75rem] sm:p-4">
            <div className="mb-2 grid grid-cols-7 gap-1 sm:mb-3 sm:gap-2">
              {weekdayLabels.map((label) => (
                <div key={label} className="px-0.5 py-1 text-center text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500 sm:px-2 sm:py-2 sm:text-xs sm:tracking-[0.18em]">
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
                      isSelected ? "border-cyan-300/30 bg-cyan-400/10 shadow-lg shadow-cyan-950/20" : "border-white/10 bg-[#07111f]/70 hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="mb-1 flex items-start justify-between sm:mb-3 sm:items-center">
                      <span
                        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold leading-none sm:h-8 sm:w-8 sm:text-sm ${
                          isToday ? "bg-gradient-to-br from-cyan-300 to-emerald-300 text-slate-950" : isSameMonth(day, currentMonth) ? "text-white" : "text-slate-600"
                        }`}
                      >
                        {format(day, "d")}
                      </span>

                      <span className="shrink-0 text-[7px] font-medium leading-none text-slate-500 sm:text-[10px] sm:uppercase sm:tracking-[0.18em]">{dayEvents.length}</span>
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
                          <div className="rounded-md border border-white/10 bg-white/[0.04] px-1 py-0.5 text-[8px] font-semibold leading-3 text-slate-300 sm:rounded-xl sm:px-2 sm:py-1.5 sm:text-[11px] sm:leading-normal">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>

                      {dayEvents.length === 0 && <div className="text-[8px] leading-none text-slate-700 sm:pt-4 sm:text-[11px]">—</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Selected day</div>
                <h2 className="mt-2 text-lg font-black leading-tight text-white sm:text-2xl">{format(selectedDate, "EEEE, d MMMM yyyy")}</h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-400 sm:text-sm">Semua catatan harian dari page lain nongol di sini biar gampang dipantau.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#07111f]/80 px-3 py-2 text-right">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Events</div>
                <div className="text-xl font-black text-white">{selectedEvents.length}</div>
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-20 animate-pulse rounded-2xl bg-white/[0.04]" />
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
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-[#07111f]/70 px-5 py-10 text-center">
                  <Gift className="mx-auto mb-3 h-6 w-6 text-slate-500" />
                  <h3 className="text-sm font-semibold text-white">No activity yet</h3>
                  <p className="mt-1 text-sm text-slate-400">Hari ini masih kosong. Begitu user input dari page lain, item-nya bakal nongol di sini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
