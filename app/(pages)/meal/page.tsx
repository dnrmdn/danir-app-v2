"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import {
  ArrowLeftRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Copy,
  Flame,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Sparkles,
  Trash2,
  WandSparkles,
  X,
} from "lucide-react";

import { useUserSession } from "@/hooks/useUserSession";
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

type MealType = "BREAKFAST" | "SNACK" | "LUNCH" | "DINNER";

type MealEntry = {
  id: number;
  weekId: number;
  dayIndex: number;
  mealType: MealType;
  text: string;
  sortOrder: number;
};

type ApiWeek = {
  id?: number;
  weekStart: string;
  entries: MealEntry[];
};

const MEAL_TYPES: Array<{ key: MealType; label: string; emoji: string; tone: string; soft: string }> = [
  { key: "BREAKFAST", label: "Breakfast", emoji: "🌅", tone: "text-amber-200", soft: "bg-amber-400/10 border-amber-300/15" },
  { key: "SNACK", label: "Snack", emoji: "🍓", tone: "text-pink-200", soft: "bg-pink-400/10 border-pink-300/15" },
  { key: "LUNCH", label: "Lunch", emoji: "🍽️", tone: "text-cyan-200", soft: "bg-cyan-400/10 border-cyan-300/15" },
  { key: "DINNER", label: "Dinner", emoji: "🌙", tone: "text-violet-200", soft: "bg-violet-400/10 border-violet-300/15" },
];

const DAYS: Array<{ label: string; short: string }> = [
  { label: "Monday", short: "Mon" },
  { label: "Tuesday", short: "Tue" },
  { label: "Wednesday", short: "Wed" },
  { label: "Thursday", short: "Thu" },
  { label: "Friday", short: "Fri" },
  { label: "Saturday", short: "Sat" },
  { label: "Sunday", short: "Sun" },
];

const MEAL_IDEAS: Record<MealType, string[]> = {
  BREAKFAST: ["Oatmeal & banana", "Egg sandwich", "Fruit yogurt bowl", "Nasi uduk", "Pancakes"],
  SNACK: ["Fresh fruit", "Granola bar", "Toast & peanut butter", "Pudding", "Mixed nuts"],
  LUNCH: ["Chicken rice bowl", "Soto ayam", "Spaghetti bolognese", "Salad wrap", "Beef teriyaki"],
  DINNER: ["Grilled salmon", "Fried rice", "Soup & toast", "Chicken katsu", "Vegetable stir fry"],
};

function weekStartString(date: Date) {
  return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
}

function addWeeks(date: Date, weeks: number) {
  return addDays(date, weeks * 7);
}

function parseISODate(value: string) {
  const [year, month, day] = value.split("-").map((v) => Number(v));
  return new Date(year, month - 1, day);
}

function makeKey(dayIndex: number, mealType: MealType) {
  return `${dayIndex}-${mealType}`;
}

const TOTAL_SLOTS = 28;

export default function MealPage() {
  const { session } = useUserSession();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [week, setWeek] = useState<ApiWeek | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [activeMealType, setActiveMealType] = useState<MealType>("BREAKFAST");
  const [activeText, setActiveText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<{ text: string } | null>(null);
  const [weekNote, setWeekNote] = useState("");

  const weekStart = useMemo(() => weekStartString(currentDate), [currentDate]);
  const weekDates = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  const noteStorageKey = `meal-note-${weekStart}`;

  useEffect(() => {
    const savedNote = typeof window !== "undefined" ? localStorage.getItem(noteStorageKey) : null;
    setWeekNote(savedNote ?? "");
  }, [noteStorageKey]);

  const entryMap = useMemo(() => {
    const map = new Map<string, MealEntry>();
    for (const entry of week?.entries ?? []) {
      if (entry.sortOrder !== 0) continue;
      map.set(makeKey(entry.dayIndex, entry.mealType), entry);
    }
    return map;
  }, [week]);

  const filledEntries = useMemo(
    () => Array.from(entryMap.values()).filter((entry) => entry.text.trim().length > 0),
    [entryMap]
  );

  const plannedCount = filledEntries.length;
  const emptyCount = TOTAL_SLOTS - plannedCount;
  const progress = Math.round((plannedCount / TOTAL_SLOTS) * 100);

  const mealTypeCounts = useMemo(() => {
    const counts: Record<MealType, number> = { BREAKFAST: 0, SNACK: 0, LUNCH: 0, DINNER: 0 };
    filledEntries.forEach((entry) => {
      counts[entry.mealType] += 1;
    });
    return counts;
  }, [filledEntries]);

  const repeatedMeals = useMemo(() => {
    const counts = new Map<string, number>();
    filledEntries.forEach((entry) => {
      const text = entry.text.trim();
      if (!text) return;
      counts.set(text, (counts.get(text) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [filledEntries]);

  const recentMeals = useMemo(
    () => Array.from(new Set(filledEntries.map((entry) => entry.text.trim()).filter(Boolean))).slice(0, 8),
    [filledEntries]
  );

  const fetchWeek = async (ws: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/meal-plan?weekStart=${encodeURIComponent(ws)}`);
      const json = await res.json();
      if (json.success) {
        setWeek(json.data);
      } else {
        setError(json.error || "Gagal memuat meal plan");
      }
    } catch {
      setError("Gagal memuat meal plan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session) return;
    fetchWeek(weekStart);
  }, [session, weekStart]);

  const openCell = (dayIndex: number, mealType: MealType) => {
    const existing = entryMap.get(makeKey(dayIndex, mealType));
    setActiveDayIndex(dayIndex);
    setActiveMealType(mealType);
    setActiveText(existing?.text ?? "");
    setDialogOpen(true);
  };

  const saveMealToSlot = async (dayIndex: number, mealType: MealType, text: string) => {
    const res = await fetch("/api/meal-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekStart,
        dayIndex,
        mealType,
        text,
        sortOrder: 0,
      }),
    });

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Gagal menyimpan");
    }
  };

  const saveCell = async () => {
    if (!session) return;
    setSaving(true);
    setError(null);
    try {
      await saveMealToSlot(activeDayIndex, activeMealType, activeText);
      await fetchWeek(weekStart);
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const copyFromCell = () => {
    setClipboard({ text: activeText });
  };

  const pasteToCell = () => {
    if (!clipboard) return;
    setActiveText(clipboard.text);
  };

  const applyIdea = (idea: string) => {
    setActiveText(idea);
  };

  const handleQuickFillWeekdays = async () => {
    if (!clipboard?.text) return;
    setSaving(true);
    setError(null);
    try {
      await Promise.all(
        [0, 1, 2, 3, 4].map((dayIndex) => saveMealToSlot(dayIndex, activeMealType, clipboard.text))
      );
      await fetchWeek(weekStart);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal quick fill weekdays");
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicatePreviousWeek = async () => {
    if (!session) return;
    setSaving(true);
    setError(null);
    try {
      const previousWeekStart = weekStartString(addWeeks(currentDate, -1));
      const res = await fetch(`/api/meal-plan?weekStart=${encodeURIComponent(previousWeekStart)}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal memuat minggu sebelumnya");

      const previousEntries: MealEntry[] = json.data?.entries ?? [];
      await Promise.all(
        MEAL_TYPES.flatMap((meal) =>
          Array.from({ length: 7 }, (_, dayIndex) => {
            const found = previousEntries.find((entry) => entry.dayIndex === dayIndex && entry.mealType === meal.key && entry.sortOrder === 0);
            return saveMealToSlot(dayIndex, meal.key, found?.text ?? "");
          })
        )
      );
      await fetchWeek(weekStart);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal duplicate last week");
    } finally {
      setSaving(false);
    }
  };

  const handleClearWeek = async () => {
    if (!session) return;
    setSaving(true);
    setError(null);
    try {
      await Promise.all(
        MEAL_TYPES.flatMap((meal) =>
          Array.from({ length: 7 }, (_, dayIndex) => saveMealToSlot(dayIndex, meal.key, ""))
        )
      );
      await fetchWeek(weekStart);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal clear week");
    } finally {
      setSaving(false);
    }
  };

  const handleAutoFillIdeas = async () => {
    if (!session) return;
    setSaving(true);
    setError(null);
    try {
      await Promise.all(
        MEAL_TYPES.flatMap((meal) =>
          Array.from({ length: 7 }, (_, dayIndex) => {
            const idea = MEAL_IDEAS[meal.key][dayIndex % MEAL_IDEAS[meal.key].length];
            return saveMealToSlot(dayIndex, meal.key, idea);
          })
        )
      );
      await fetchWeek(weekStart);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal auto fill ideas");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWeekNote = (value: string) => {
    setWeekNote(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(noteStorageKey, value);
    }
  };

  if (!session) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Card className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-white backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-3">
            <CalendarDays className="text-cyan-200" />
            <h1 className="text-3xl font-black">Meal Planner</h1>
          </div>
          <p className="mb-6 text-slate-300">Kamu perlu login dulu untuk bikin rencana makan mingguan.</p>
          <Button asChild className="rounded-2xl bg-white font-bold text-slate-950 hover:bg-slate-100">
            <Link href="/login">Login</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1700px] px-2 py-6 sm:px-4 lg:px-2">
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 text-white shadow-2xl shadow-cyan-950/10 backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              Meal Planner v2
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Plan your week without overthinking meals.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Build your weekly meal routine, repeat what works, fill gaps faster, and keep one clear overview for breakfast,
              snacks, lunch, and dinner.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => setCurrentDate((d) => addWeeks(d, -1))}>
              <ChevronLeft className="mr-2" size={18} />
              Prev
            </Button>
            <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => setCurrentDate(new Date())}>
              This Week
            </Button>
            <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => setCurrentDate((d) => addWeeks(d, 1))}>
              Next
              <ChevronRight className="ml-2" size={18} />
            </Button>
            <Badge className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-slate-200">
              {format(parseISODate(weekStart), "dd MMM yyyy")} – {format(addDays(parseISODate(weekStart), 6), "dd MMM yyyy")}
            </Badge>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Planned meals" value={`${plannedCount}/${TOTAL_SLOTS}`} subtitle="Slots already filled this week" icon={<CalendarDays className="h-5 w-5 text-cyan-200" />} />
        <SummaryCard title="Empty slots" value={String(emptyCount)} subtitle="Meals that still need decisions" icon={<Plus className="h-5 w-5 text-amber-200" />} />
        <SummaryCard title="Progress" value={`${progress}%`} subtitle="Weekly meal planning completion" icon={<Flame className="h-5 w-5 text-pink-200" />} />
        <SummaryCard title="Top repeat" value={repeatedMeals[0]?.[0] ?? "—"} subtitle={repeatedMeals[0] ? `${repeatedMeals[0][1]} times this week` : "No repeated meals yet"} icon={<RefreshCcw className="h-5 w-5 text-emerald-200" />} compact />
      </section>

      <section className="mb-8 grid gap-6 2xl:grid-cols-[1.6fr_0.9fr]">
        <Card className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 text-white backdrop-blur-xl">
          <div className="border-b border-white/10 p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-2xl font-black">Weekly meal board</h2>
                <p className="mt-1 text-sm text-slate-400">Click any slot to edit, copy meals, or fill the week faster.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={handleDuplicatePreviousWeek} disabled={saving}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate last week
                </Button>
                <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={handleAutoFillIdeas} disabled={saving}>
                  <WandSparkles className="mr-2 h-4 w-4" />
                  Auto fill ideas
                </Button>
                <Button variant="outline" className="rounded-2xl border-red-400/15 bg-red-500/5 text-red-200 hover:bg-red-500/10" onClick={handleClearWeek} disabled={saving}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear week
                </Button>
              </div>
            </div>
          </div>

          {error && <div className="mx-5 mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 font-semibold text-red-300 sm:mx-6">{error}</div>}
          {loading && <div className="mx-5 mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-medium text-slate-300 sm:mx-6">Loading meal plan...</div>}

          <div className="p-3 sm:p-4">
            <div className="w-full rounded-[1.5rem] border border-white/10 bg-[#07111f]/70">
              <div className="grid grid-cols-[140px_repeat(7,minmax(0,1fr))] border-b border-white/10 bg-white/[0.03] xl:grid-cols-[160px_repeat(7,minmax(0,1fr))]">
                <div className="p-4 text-xs font-black uppercase tracking-[0.2em] text-slate-500">Meal</div>
                {weekDates.map((date, idx) => (
                  <div key={idx} className="border-l border-white/10 p-3 xl:p-4">
                    <div className="text-sm font-black text-white">{DAYS[idx].short}</div>
                    <div className="mt-1 text-xs text-slate-400">{format(date, "dd MMM")}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-rows-4">
                {MEAL_TYPES.map((meal) => (
                  <div key={meal.key} className="grid grid-cols-[140px_repeat(7,minmax(0,1fr))] border-b border-white/10 last:border-b-0 xl:grid-cols-[160px_repeat(7,minmax(0,1fr))]">
                    <div className={`border-r border-white/10 p-3 xl:p-4 ${meal.soft}`}>
                      <div className="flex items-center gap-2 text-sm font-black text-white">
                        <span>{meal.emoji}</span>
                        {meal.label}
                      </div>
                      <div className={`mt-1 text-[10px] uppercase tracking-[0.2em] ${meal.tone}`}>{meal.key}</div>
                      <div className="mt-2 text-xs text-slate-400">{mealTypeCounts[meal.key]}/7 planned</div>
                    </div>

                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const entry = entryMap.get(makeKey(dayIndex, meal.key));
                      const hasValue = !!entry?.text?.trim();
                      return (
                        <button
                          key={dayIndex}
                          type="button"
                          onClick={() => openCell(dayIndex, meal.key)}
                          className={`group relative min-h-[96px] border-l border-white/10 p-3 text-left transition xl:min-h-[108px] xl:p-4 ${
                            hasValue ? "bg-white/[0.02] hover:bg-white/[0.06]" : "bg-transparent hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="absolute right-3 top-3 opacity-0 transition group-hover:opacity-100">
                            <Pencil size={14} className="text-slate-500" />
                          </div>
                          {hasValue ? (
                            <div>
                              <div className="line-clamp-3 pr-5 text-sm font-semibold text-slate-100">{entry?.text}</div>
                              <div className="mt-3 text-[11px] text-slate-500">Tap to edit</div>
                            </div>
                          ) : (
                            <div className="flex h-full flex-col items-start justify-center">
                              <div className="mb-2 rounded-full border border-dashed border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                Empty slot
                              </div>
                              <div className="text-sm text-slate-400">Click to add meal</div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border border-white/10 bg-white/5 p-5 text-white backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <WandSparkles className="h-4 w-4 text-cyan-200" />
              <h3 className="text-lg font-black">Quick actions</h3>
            </div>
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={handleDuplicatePreviousWeek} disabled={saving}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate previous week
              </Button>
              <Button variant="outline" className="justify-start rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={handleAutoFillIdeas} disabled={saving}>
                <WandSparkles className="mr-2 h-4 w-4" />
                Fill with meal ideas
              </Button>
              <Button variant="outline" className="justify-start rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={handleQuickFillWeekdays} disabled={!clipboard?.text || saving}>
                <ClipboardList className="mr-2 h-4 w-4" />
                Paste clipboard to weekdays
              </Button>
              <Button variant="outline" className="justify-start rounded-2xl border-red-400/15 bg-red-500/5 text-red-200 hover:bg-red-500/10" onClick={handleClearWeek} disabled={saving}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear current week
              </Button>
            </div>
          </Card>

          <Card className="rounded-[2rem] border border-white/10 bg-white/5 p-5 text-white backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-200" />
              <h3 className="text-lg font-black">Meal idea bank</h3>
            </div>
            <div className="space-y-4">
              {MEAL_TYPES.map((meal) => (
                <div key={meal.key}>
                  <div className={`mb-2 text-sm font-semibold ${meal.tone}`}>{meal.emoji} {meal.label}</div>
                  <div className="flex flex-wrap gap-2">
                    {MEAL_IDEAS[meal.key].map((idea) => (
                      <button
                        key={idea}
                        type="button"
                        onClick={() => {
                          setActiveMealType(meal.key);
                          setActiveText(idea);
                          setDialogOpen(true);
                        }}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/[0.08]"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[2rem] border border-white/10 bg-white/5 p-5 text-white backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-violet-200" />
              <h3 className="text-lg font-black">Weekly notes & grocery reminders</h3>
            </div>
            <textarea
              value={weekNote}
              onChange={(e) => handleSaveWeekNote(e.target.value)}
              placeholder="Contoh: beli ayam fillet, susu, telur, buah, oatmeal..."
              className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-[#07111f]/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
            <p className="mt-2 text-xs text-slate-500">Saved locally for this week in your browser.</p>
          </Card>

          <Card className="rounded-[2rem] border border-white/10 bg-white/5 p-5 text-white backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <RefreshCcw className="h-4 w-4 text-cyan-200" />
              <h3 className="text-lg font-black">Patterns this week</h3>
            </div>
            <div className="space-y-3">
              {repeatedMeals.length > 0 ? (
                repeatedMeals.map(([text, count]) => (
                  <div key={text} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#07111f]/70 px-4 py-3">
                    <span className="text-sm text-slate-200">{text}</span>
                    <Badge className="rounded-full border border-white/10 bg-white/10 text-slate-200">{count}x</Badge>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#07111f]/50 px-4 py-6 text-sm text-slate-400">
                  No repeated meals yet — good for variety.
                </div>
              )}

              {recentMeals.length > 0 && (
                <div className="pt-2">
                  <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Recent meals</div>
                  <div className="flex flex-wrap gap-2">
                    {recentMeals.map((meal) => (
                      <button
                        key={meal}
                        type="button"
                        onClick={() => applyIdea(meal)}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/[0.08]"
                      >
                        {meal}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2rem] border border-white/10 bg-[#08111f]/95 text-white backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-black text-white">
              <ArrowLeftRight className="text-cyan-200" size={18} />
              Edit meal slot
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {DAYS[activeDayIndex].label} • {MEAL_TYPES.find((m) => m.key === activeMealType)?.label} • Week {weekStart}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="font-bold text-slate-200">Meal name</Label>
              <Input
                value={activeText}
                onChange={(e) => setActiveText(e.target.value)}
                placeholder="Contoh: Ayam dori / Soto ayam / Spaghetti / Fruit bowl"
                className="h-12 rounded-2xl border-white/10 bg-[#07111f]/80 text-white placeholder:text-slate-500"
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Kosongkan input untuk menghapus isi slot.</div>
                {clipboard?.text ? (
                  <Badge className="rounded-xl border border-white/10 bg-white/10 text-slate-200">Clipboard ready</Badge>
                ) : (
                  <Badge variant="outline" className="rounded-xl border-white/10 text-slate-400">Clipboard empty</Badge>
                )}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold text-slate-200">Quick ideas for this meal</div>
              <div className="flex flex-wrap gap-2">
                {MEAL_IDEAS[activeMealType].map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => applyIdea(idea)}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/[0.08]"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>

            {recentMeals.length > 0 && (
              <div>
                <div className="mb-2 text-sm font-semibold text-slate-200">Recent meals</div>
                <div className="flex flex-wrap gap-2">
                  {recentMeals.map((meal) => (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => applyIdea(meal)}
                      className="rounded-full border border-cyan-300/15 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-400/15"
                    >
                      {meal}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-3">
            <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => setDialogOpen(false)} disabled={saving}>
              <X className="mr-2" size={18} />
              Cancel
            </Button>
            <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={copyFromCell} disabled={!activeText.trim() || saving}>
              <Copy className="mr-2" size={18} />
              Copy
            </Button>
            <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={pasteToCell} disabled={!clipboard?.text || saving}>
              Paste
            </Button>
            <Button className="rounded-2xl bg-white font-bold text-slate-950 hover:bg-slate-100" onClick={saveCell} disabled={saving}>
              <Save className="mr-2" size={18} />
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  compact = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <Card className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-white backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">{icon}</div>
        {!compact && <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Overview</div>}
      </div>
      <div className="text-2xl font-black text-white sm:text-3xl">{value}</div>
      <div className="mt-2 text-sm font-semibold text-slate-200">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</div>
    </Card>
  );
}
