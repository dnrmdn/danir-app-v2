"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { ArrowLeftRight, CalendarDays, ChevronLeft, ChevronRight, ClipboardList, Copy, Flame, Pencil, Plus, RefreshCcw, Save, Sparkles, Trash2, WandSparkles, X } from "lucide-react";
import { gooeyToast as toast } from "goey-toast";

import { useUserSession } from "@/hooks/useUserSession";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/components/language-provider";
import { GroceriesView } from "./_components/GroceriesView";
import { ViewModeToggle } from "@/components/partner/view-mode-toggle";
import { usePartnerStore } from "@/lib/store/partner-store";

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

const MEAL_TYPES: Array<{ key: MealType; label: Record<"en" | "id", string>; emoji: string; tone: string; soft: string }> = [
  { key: "BREAKFAST", label: { en: "Breakfast", id: "Sarapan" }, emoji: "🌅", tone: "text-amber-700 dark:text-amber-200", soft: "bg-amber-100/50 border-amber-200 dark:bg-amber-400/10 dark:border-amber-300/15" },
  { key: "SNACK", label: { en: "Snack", id: "Camilan" }, emoji: "🍓", tone: "text-pink-700 dark:text-pink-200", soft: "bg-pink-100/50 border-pink-200 dark:bg-pink-400/10 dark:border-pink-300/15" },
  { key: "LUNCH", label: { en: "Lunch", id: "Makan Siang" }, emoji: "🍽️", tone: "text-cyan-700 dark:text-cyan-200", soft: "bg-cyan-100/50 border-cyan-200 dark:bg-cyan-400/10 dark:border-cyan-300/15" },
  { key: "DINNER", label: { en: "Dinner", id: "Makan Malam" }, emoji: "🌙", tone: "text-violet-700 dark:text-violet-200", soft: "bg-violet-100/50 border-violet-200 dark:bg-violet-400/10 dark:border-violet-300/15" },
];

const DAYS: Array<{ label: Record<"en" | "id", string>; short: Record<"en" | "id", string> }> = [
  { label: { en: "Monday", id: "Senin" }, short: { en: "Mon", id: "Sen" } },
  { label: { en: "Tuesday", id: "Selasa" }, short: { en: "Tue", id: "Sel" } },
  { label: { en: "Wednesday", id: "Rabu" }, short: { en: "Wed", id: "Rab" } },
  { label: { en: "Thursday", id: "Kamis" }, short: { en: "Thu", id: "Kam" } },
  { label: { en: "Friday", id: "Jumat" }, short: { en: "Fri", id: "Jum" } },
  { label: { en: "Saturday", id: "Sabtu" }, short: { en: "Sat", id: "Sab" } },
  { label: { en: "Sunday", id: "Minggu" }, short: { en: "Sun", id: "Min" } },
];

const MEAL_IDEAS_ID: Record<MealType, string[]> = {
  BREAKFAST: ["Nasi uduk", "Nasi goreng", "Bubur ayam", "Roti bakar selai", "Lontong sayur", "Ketupat sayur", "Telur dadar", "Nasi kuning"],
  SNACK: ["Pisang goreng", "Martabak mini", "Tahu crispy", "Risoles", "Onde-onde", "Klepon", "Bakwan sayur", "Ubi goreng"],
  LUNCH: ["Nasi padang", "Soto ayam", "Gado-gado", "Mie goreng", "Nasi rawon", "Ayam penyet", "Nasi liwet", "Sop buntut"],
  DINNER: ["Ayam bakar", "Ikan goreng", "Sayur lodeh", "Nasi goreng kampung", "Lele goreng", "Tempe orek", "Sate ayam", "Sup ayam"],
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

const contentMealLocal = {
  id: {
    badge: "Perencana Makan v2",
    title: "Rencanakan minggu tanpa pusing mikirin makan.",
    desc: "Buat rutinitas makan mingguan, ulangi yang berhasil, isi kekosongan lebih cepat, dan simpan ringkasan untuk sarapan, camilan, siang, dan malam.",
    prev: "Prev",
    thisWeek: "Pekan ini",
    next: "Next",
    summPlanned: "Rencana",
    summPlannedSub: "Slot terisi minggu ini",
    summEmpty: "Kosong",
    summEmptySub: "Masih butuh keputusan",
    summProg: "Progres",
    summProgSub: "Persentase isi pola makan",
    summRepeat: "Paling sering",
    summRepeatSub: (n: number) => `${n} kali minggu ini`,
    summRepeatNone: "Belum ada repetisi",
    boardTitle: "Papan makan mingguan",
    boardDesc: "Klik slot manapun untuk edit, copy, atau isi minggu lebih cepat.",
    dupLast: "Duplikat minggu lalu",
    autoFill: "Auto isi",
    clearWeek: "Kosongkan minggu",
    confirmClearTitle: "Bersihkan minggu ini?",
    confirmClearDesc: "Semua rencana makan dari Senin-Minggu akan terhapus.",
    confirmClearY: "Ya, bersihkan",
    clearedSuccess: "Minggu ini berhasil dibersihkan.",
    alreadyEmpty: "Belum ada rencana makan di minggu ini.",
    loading: "Memuat rencana makan...",
    errLoad: "Gagal memuat meal plan",
    errDup: "Gagal menduplikat minggu lalu",
    errClear: "Gagal membersihkan minggu",
    errSave: "Gagal menyimpan",
    errQuick: "Gagal quick fill weekdays",
    errAuto: "Gagal auto fill ideas",
    tableMeal: "Menu",
    plannedStatus: "direncanakan",
    emptySlot: "Kosong",
    addMeal: "Tambah",
    tapEdit: "Tap untuk edit",
    quickTitle: "Aksi cepat",
    ideaBank: "Ide menu makan",
    notes: "Catatan & daftar belanja",
    notesPlaceholder: "Contoh: beli ayam fillet, susu, telur, buah...",
    notesSaved: "Disimpan secara lokal di browser Anda untuk minggu ini.",
    patterns: "Pola minggu ini",
    noRepeats: "Belum ada pola repetisi menu — bagus untuk variasi.",
    recentMeals: "Menu terbaru",
    editSlot: "Edit slot menu",
    mealName: "Nama menu",
    mealNamePlaceholder: "Contoh: Ayam dori / Soto ayam / Spaghetti",
    clearToDel: "Kosongkan input untuk menghapus slot.",
    clipReady: "Clipboard siap",
    clipEmpty: "Clipboard kosong",
    quickIdeas: "Ide cepat",
    cancel: "Batal",
    copy: "Salin",
    paste: "Tempel",
    save: "Simpan",
    saving: "Menyimpan...",
    notLogged: "Kamu perlu login dulu untuk bikin rencana makan mingguan.",
    login: "Masuk",
    pasteWeekdays: "Tempel ke hari kerja"
  },
  en: {
    badge: "Meal Planner v2",
    title: "Plan your week without overthinking meals.",
    desc: "Build your weekly meal routine, repeat what works, fill gaps faster, and keep one clear overview for breakfast, snacks, lunch, and dinner.",
    prev: "Prev",
    thisWeek: "This Week",
    next: "Next",
    summPlanned: "Planned meals",
    summPlannedSub: "Slots already filled this week",
    summEmpty: "Empty slots",
    summEmptySub: "Meals that still need decisions",
    summProg: "Progress",
    summProgSub: "Weekly meal planning completion",
    summRepeat: "Top repeat",
    summRepeatSub: (n: number) => `${n} times this week`,
    summRepeatNone: "No repeated meals yet",
    boardTitle: "Weekly meal board",
    boardDesc: "Click any slot to edit, copy meals, or fill the week faster.",
    dupLast: "Duplicate last week",
    autoFill: "Auto fill ideas",
    clearWeek: "Clear week",
    confirmClearTitle: "Clear this week?",
    confirmClearDesc: "All meal plans from Monday to Sunday will be deleted.",
    confirmClearY: "Yes, clear it",
    clearedSuccess: "This week has been successfully cleared.",
    alreadyEmpty: "No meal plans found for this week.",
    loading: "Loading meal plan...",
    errLoad: "Failed to load meal plan",
    errDup: "Failed to duplicate last week",
    errClear: "Failed to clear week",
    errSave: "Failed to save",
    errQuick: "Failed quick fill weekdays",
    errAuto: "Failed auto fill ideas",
    tableMeal: "Meal",
    plannedStatus: "planned",
    emptySlot: "Empty",
    addMeal: "Add meal",
    tapEdit: "Tap to edit",
    quickTitle: "Quick actions",
    ideaBank: "Meal idea bank",
    notes: "Weekly notes & grocery reminders",
    notesPlaceholder: "Example: buy chicken fillet, milk, eggs, fruits...",
    notesSaved: "Saved locally for this week in your browser.",
    patterns: "Patterns this week",
    noRepeats: "No repeated meals yet — good for variety.",
    recentMeals: "Recent meals",
    editSlot: "Edit meal slot",
    mealName: "Meal name",
    mealNamePlaceholder: "Example: Chicken katsu / Spaghetti / Fruit bowl",
    clearToDel: "Empty the input to clear this slot.",
    clipReady: "Clipboard ready",
    clipEmpty: "Clipboard empty",
    quickIdeas: "Quick ideas for this meal",
    cancel: "Cancel",
    copy: "Copy",
    paste: "Paste",
    save: "Save",
    saving: "Saving...",
    notLogged: "You need to login first to plan your weekly meals.",
    login: "Login",
    pasteWeekdays: "Paste clipboard to weekdays"
  }
};

export default function MealPage() {
  const { session } = useUserSession();
  const { locale } = useLanguage();
  const t = contentMealLocal[locale];
  const [activeTab, setActiveTab] = useState<"meal" | "groceries">("meal");
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
  const [userIdeas, setUserIdeas] = useState<Record<MealType, string[]>>({ BREAKFAST: [], SNACK: [], LUNCH: [], DINNER: [] });
  const [weekNote, setWeekNote] = useState("");

  // Partner sharing
  const { viewMode: partnerViewMode, fetchConnection, fetchFeatureAccess, getActiveConnectionId, isFeatureShared, connection } = usePartnerStore();

  const partnerQs = useMemo(() => {
    if (partnerViewMode === "shared" && isFeatureShared("MEAL")) {
      const connId = getActiveConnectionId();
      if (connId) return `view=shared&connectionId=${connId}`;
    }
    return "";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerViewMode]);

  const partnerBodyParams = useMemo(() => {
    if (partnerViewMode === "shared" && isFeatureShared("MEAL")) {
      const connId = getActiveConnectionId();
      if (connId) return { view: "shared", connectionId: connId };
    }
    return {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerViewMode]);

  const partnerName = useMemo(() => {
    if (!connection || !session) return null;
    const partner = connection.userAId === session.user.id ? connection.userB : connection.userA;
    return partner?.name || partner?.email || null;
  }, [connection, session]);

  const appendPartnerQs = (url: string) => {
    if (!partnerQs) return url;
    return url + (url.includes("?") ? "&" : "?") + partnerQs;
  };

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

  const filledEntries = useMemo(() => Array.from(entryMap.values()).filter((entry) => entry.text.trim().length > 0), [entryMap]);

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

  const recentMeals = useMemo(() => Array.from(new Set(filledEntries.map((entry) => entry.text.trim()).filter(Boolean))).slice(0, 8), [filledEntries]);

  const fetchWeek = async (ws: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(appendPartnerQs(`/api/meal-plan?weekStart=${encodeURIComponent(ws)}`));
      const json = await res.json();
      if (json.success) {
        setWeek(json.data);
        if (json.ideas) {
          setUserIdeas(json.ideas as Record<MealType, string[]>);
        }
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
    fetchConnection().then(() => fetchFeatureAccess());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    if (!session) return;
    fetchWeek(weekStart);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, weekStart, partnerQs]);

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
        ...partnerBodyParams,
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
      await Promise.all([0, 1, 2, 3, 4].map((dayIndex) => saveMealToSlot(dayIndex, activeMealType, clipboard.text)));
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
          }),
        ),
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
      await Promise.all(MEAL_TYPES.flatMap((meal) => Array.from({ length: 7 }, (_, dayIndex) => saveMealToSlot(dayIndex, meal.key, ""))));
      await fetchWeek(weekStart);
      toast.success(t.clearedSuccess);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errClear);
    } finally {
      setSaving(false);
    }
  };

  const confirmClearWeek = () => {
    if (plannedCount === 0) {
      toast.info(t.alreadyEmpty);
      return;
    }

    toast.error(t.confirmClearTitle, {
      description: t.confirmClearDesc,
      action: {
        label: t.confirmClearY,
        onClick: handleClearWeek,
      },
      classNames: {
        actionButton: "!bg-red-600 hover:!bg-red-700 !text-white !border-red-600",
      },
    });
  };

  const handleAutoFillIdeas = async () => {
    if (!session) return;
    setSaving(true);
    setError(null);
    try {
      await Promise.all(
        MEAL_TYPES.flatMap((meal) =>
          Array.from({ length: 7 }, (_, dayIndex) => {
            const idea = MEAL_IDEAS_ID[meal.key][dayIndex % MEAL_IDEAS_ID[meal.key].length];
            return saveMealToSlot(dayIndex, meal.key, idea);
          }),
        ),
      );
      await fetchWeek(weekStart);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errAuto);
    } finally {
      setSaving(false);
    }
  };

  const handleMoveMeal = async (
    sourceDayIndex: number,
    sourceMealType: MealType,
    targetDayIndex: number,
    targetMealType: MealType,
    sourceText: string,
    targetText: string
  ) => {
    if (!session) return;
    if (sourceDayIndex === targetDayIndex && sourceMealType === targetMealType) return;
    setSaving(true);
    setError(null);
    try {
      await Promise.all([
        saveMealToSlot(targetDayIndex, targetMealType, sourceText),
        saveMealToSlot(sourceDayIndex, sourceMealType, targetText)
      ]);
      await fetchWeek(weekStart);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errSave);
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
        <Card className="rounded-[1.25rem] border border-border bg-card/80 p-6 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white sm:rounded-[2rem] sm:p-8">
          <div className="mb-2 flex items-center gap-3">
            <CalendarDays className="text-cyan-600 dark:text-cyan-200" />
            <h1 className="text-2xl font-black sm:text-3xl">Meal Planner</h1>
          </div>
          <p className="mb-6 text-sm text-muted-foreground dark:text-slate-300 sm:text-base">{t.notLogged}</p>
          <Button asChild className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-white dark:font-bold dark:text-slate-950 dark:hover:bg-slate-100 sm:rounded-2xl">
            <Link href="/login">{t.login}</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1700px] px-2 py-4 sm:px-4 sm:py-6 lg:px-2">
      <section className="mb-6 rounded-[1.25rem] border border-border bg-card/80 p-3 text-foreground shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-2xl dark:shadow-cyan-950/10 sm:mb-8 sm:rounded-[2rem] sm:p-8">
        <div className="flex flex-col gap-4 sm:gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-100/50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200 sm:mb-3 sm:px-3 sm:text-[11px] sm:tracking-[0.2em]">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {t.badge}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black tracking-tight text-foreground dark:text-white sm:text-4xl lg:text-5xl">{t.title}</h1>
              <ViewModeToggle feature="MEAL" locale={locale} />
            </div>
            {partnerViewMode === "shared" && isFeatureShared("MEAL") && partnerName && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50/80 px-3 py-1 text-xs font-medium text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
                👀 {locale === "id" ? `Berbagi dengan ${partnerName}` : `Shared with ${partnerName}`}
              </div>
            )}
            <p className="mt-2 max-w-2xl text-xs leading-6 text-muted-foreground dark:text-slate-300 sm:mt-3 sm:text-sm sm:leading-7 lg:text-base">
              {t.desc}
            </p>
          </div>
          
          <div className="mt-4 flex w-fit gap-1 rounded-2xl bg-muted/60 p-1 dark:bg-white/5 sm:mt-0 xl:flex-row">
            <button
              onClick={() => setActiveTab("meal")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === "meal" ? "bg-white text-cyan-800 shadow dark:bg-cyan-500/20 dark:text-cyan-200" : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5"}`}
            >
              Meal Plan
            </button>
            <button
              onClick={() => setActiveTab("groceries")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === "groceries" ? "bg-white text-cyan-800 shadow dark:bg-cyan-500/20 dark:text-cyan-200" : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5"}`}
            >
              Groceries
            </button>
          </div>
        </div>
      </section>

      {activeTab === "meal" && (
        <>
          <section className="mb-5 grid grid-cols-4 gap-2 sm:mb-8 sm:gap-3">
        <SummaryCard title={t.summPlanned} value={`${plannedCount}/${TOTAL_SLOTS}`} subtitle={t.summPlannedSub} icon={<CalendarDays className="h-4 w-4 text-cyan-600 dark:text-cyan-200 sm:h-5 sm:w-5" />} />
        <SummaryCard title={t.summEmpty} value={String(emptyCount)} subtitle={t.summEmptySub} icon={<Plus className="h-4 w-4 text-amber-600 dark:text-amber-200 sm:h-5 sm:w-5" />} />
        <SummaryCard title={t.summProg} value={`${progress}%`} subtitle={t.summProgSub} icon={<Flame className="h-4 w-4 text-pink-600 dark:text-pink-200 sm:h-5 sm:w-5" />} />
        <SummaryCard
          title={t.summRepeat}
          value={repeatedMeals[0]?.[0] ?? "—"}
          subtitle={repeatedMeals[0] ? t.summRepeatSub(repeatedMeals[0][1]) : t.summRepeatNone}
          icon={<RefreshCcw className="h-4 w-4 text-emerald-600 dark:text-emerald-200 sm:h-5 sm:w-5" />}
          compact
        />
      </section>

      <section className="mb-8 grid gap-4 sm:gap-6 2xl:grid-cols-[1.6fr_0.9fr]">
        <Card className="overflow-hidden rounded-[1.25rem] border border-border bg-card/80 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white sm:rounded-[2rem]">
          <div className="border-b border-border dark:border-white/10 p-3 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h2 className="text-lg font-black sm:text-2xl">{t.boardTitle}</h2>
                  <Badge className="w-fit rounded-xl border border-border bg-muted/50 px-2.5 py-1 text-[10px] text-foreground dark:border-white/10 dark:bg-white/10 dark:text-slate-200 sm:px-3 sm:text-xs">
                    {format(parseISODate(weekStart), "dd MMM yyyy")} – {format(addDays(parseISODate(weekStart), 6), "dd MMM yyyy")}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground dark:text-slate-400 sm:text-sm">{t.boardDesc}</p>
              </div>

              <div className="flex flex-col items-start xl:items-end gap-3 mt-2 xl:mt-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <Button variant="outline" className="h-8 rounded-lg border-border bg-muted/50 px-3 text-xs text-foreground hover:bg-muted dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:h-9 sm:rounded-xl" onClick={() => setCurrentDate((d) => addWeeks(d, -1))}>
                    <ChevronLeft className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
                    {t.prev}
                  </Button>

                  <Button variant="outline" className="h-8 rounded-lg border-border bg-muted/50 px-3 text-xs text-foreground hover:bg-muted dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:h-9 sm:rounded-xl" onClick={() => setCurrentDate(new Date())}>
                    {t.thisWeek}
                  </Button>

                  <Button variant="outline" className="h-8 rounded-lg border-border bg-muted/50 px-3 text-xs text-foreground hover:bg-muted dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:h-9 sm:rounded-xl" onClick={() => setCurrentDate((d) => addWeeks(d, 1))}>
                    {t.next}
                    <ChevronRight className="ml-1 h-3 w-3 sm:ml-1.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="h-8 rounded-lg border-border bg-muted/50 px-2.5 text-[11px] text-foreground hover:bg-muted dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:h-9 sm:rounded-xl sm:px-3 sm:text-xs" onClick={handleDuplicatePreviousWeek} disabled={saving}>
                    <Copy className="mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">{t.dupLast}</span>
                  </Button>

                  <Button variant="outline" className="h-8 rounded-lg border-border bg-muted/50 px-2.5 text-[11px] text-foreground hover:bg-muted dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:h-9 sm:rounded-xl sm:px-3 sm:text-xs" onClick={handleAutoFillIdeas} disabled={saving}>
                    <WandSparkles className="mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    {t.autoFill}
                  </Button>

                  <Button variant="outline" className="h-8 rounded-lg border-red-200 bg-red-100/50 px-2.5 text-[11px] text-red-800 hover:bg-red-200/50 dark:border-red-400/15 dark:bg-red-500/5 dark:text-red-200 dark:hover:bg-red-500/10 sm:h-9 sm:rounded-xl sm:px-3 sm:text-xs" onClick={confirmClearWeek} disabled={saving}>
                    <Trash2 className="mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    {t.clearWeek}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="mx-3 mt-3 rounded-xl border border-red-200 bg-red-100 p-3 text-sm font-semibold text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 sm:mx-6 sm:mt-5 sm:rounded-2xl sm:p-4">{error}</div>}

          {loading && <div className="mx-3 mt-3 rounded-xl border border-border bg-muted/50 p-3 text-xs font-medium text-foreground dark:border-white/10 dark:bg-white/5 dark:text-slate-300 sm:mx-6 sm:mt-5 sm:rounded-2xl sm:p-4 sm:text-sm">{t.loading}</div>}

          <div className="p-2 sm:p-4">
            <div className="w-full overflow-x-auto rounded-[1rem] border border-border bg-muted/50 dark:border-white/10 dark:bg-[#07111f]/70 sm:rounded-[1.5rem]">
              <div className="grid min-w-[760px] grid-cols-[88px_repeat(7,minmax(84px,1fr))] border-b border-border bg-muted/30 dark:border-white/10 dark:bg-white/[0.03] sm:min-w-0 sm:grid-cols-[110px_repeat(7,minmax(0,1fr))] xl:grid-cols-[160px_repeat(7,minmax(0,1fr))]">
                <div className="p-2 text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground dark:text-slate-500 sm:p-3 sm:text-xs sm:tracking-[0.2em] xl:p-4">{t.tableMeal}</div>

                {weekDates.map((date, idx) => (
                  <div key={idx} className="border-l border-border dark:border-white/10 p-2 sm:p-3 xl:p-4">
                    <div className="text-[11px] font-black text-foreground dark:text-white sm:text-sm">{DAYS[idx].short[locale as "en" | "id"]}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground dark:text-slate-400 sm:mt-1 sm:text-xs">{format(date, "dd MMM")}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-rows-4">
                {MEAL_TYPES.map((meal) => (
                  <div
                    key={meal.key}
                    className="grid min-w-[760px] grid-cols-[88px_repeat(7,minmax(84px,1fr))] border-b border-border dark:border-white/10 last:border-b-0 sm:min-w-0 sm:grid-cols-[110px_repeat(7,minmax(0,1fr))] xl:grid-cols-[160px_repeat(7,minmax(0,1fr))]"
                  >
                    <div className={`border-r border-border dark:border-white/10 p-2 sm:p-3 xl:p-4 ${meal.soft}`}>
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-foreground dark:text-white sm:gap-2 sm:text-sm">
                        <span>{meal.emoji}</span>
                        <span className="truncate">{meal.label[locale as "en" | "id"]}</span>
                      </div>
                      <div className={`mt-1 text-[8px] uppercase tracking-[0.12em] sm:text-[10px] sm:tracking-[0.2em] ${meal.tone}`}>{meal.key}</div>
                      <div className="mt-1.5 text-[10px] text-muted-foreground dark:text-slate-400 sm:mt-2 sm:text-xs">{mealTypeCounts[meal.key]}/7 {t.plannedStatus}</div>
                    </div>

                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const entry = entryMap.get(makeKey(dayIndex, meal.key));
                      const hasValue = !!entry?.text?.trim();

                      return (
                        <button
                          key={dayIndex}
                          type="button"
                          onClick={() => openCell(dayIndex, meal.key)}
                          draggable={hasValue}
                          onDragStart={(e) => {
                            if (!hasValue) return;
                            e.dataTransfer.setData("application/json", JSON.stringify({
                              sourceDayIndex: dayIndex,
                              sourceMealType: meal.key,
                              text: entry?.text
                            }));
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            try {
                              const data = JSON.parse(e.dataTransfer.getData("application/json"));
                              handleMoveMeal(
                                data.sourceDayIndex,
                                data.sourceMealType,
                                dayIndex,
                                meal.key,
                                data.text,
                                entry?.text ?? ""
                              );
                            } catch (err) {
                              // ignore json parse error
                            }
                          }}
                          className={`group relative min-h-[72px] border-l border-border dark:border-white/10 p-2 text-left transition sm:min-h-[88px] sm:p-3 xl:min-h-[108px] xl:p-4 ${
                            hasValue ? "bg-muted/30 hover:bg-muted/50 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] cursor-grab active:cursor-grabbing" : "bg-transparent hover:bg-muted/30 dark:hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100 sm:right-3 sm:top-3">
                            <Pencil size={12} className="text-muted-foreground dark:text-slate-500 sm:h-[14px] sm:w-[14px]" />
                          </div>

                          {hasValue ? (
                            <div>
                              <div className="line-clamp-3 pr-4 text-[11px] font-semibold leading-4 text-foreground dark:text-slate-100 sm:pr-5 sm:text-sm sm:leading-5">{entry?.text}</div>
                              <div className="mt-2 text-[10px] text-muted-foreground dark:text-slate-500 sm:mt-3 sm:text-[11px]">{t.tapEdit}</div>
                            </div>
                          ) : (
                            <div className="flex h-full flex-col items-start justify-center">
                              <div className="mb-1.5 rounded-full border border-dashed border-border bg-muted/30 px-2 py-1 text-[8px] uppercase tracking-[0.12em] text-muted-foreground dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-500 sm:mb-2 sm:text-[10px] sm:tracking-[0.18em]">{t.emptySlot}</div>
                              <div className="text-[11px] text-muted-foreground dark:text-slate-400 sm:text-sm">{t.addMeal}</div>
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

        <div className="space-y-4 sm:space-y-6">
          <Card className="rounded-[1.25rem] border border-border bg-card/80 p-3 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white sm:rounded-[2rem] sm:p-5">
            <div className="mb-3 flex items-center gap-2 sm:mb-4">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-200" />
              <h3 className="text-base font-black sm:text-lg">{t.ideaBank}</h3>
            </div>

            <div className="space-y-4">
              {MEAL_TYPES.map((meal) => {
                const ideas = userIdeas[meal.key]?.length > 0
                  ? userIdeas[meal.key]
                  : MEAL_IDEAS_ID[meal.key];
                return (
                  <div key={meal.key}>
                    <div className={`mb-2 text-sm font-semibold ${meal.tone}`}>
                      {meal.emoji} {meal.label[locale as "en" | "id"]}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {ideas.map((idea: string) => (
                        <button
                          key={idea}
                          type="button"
                          onClick={() => {
                            setActiveMealType(meal.key);
                            setActiveText(idea);
                            setDialogOpen(true);
                          }}
                          className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-[11px] text-foreground transition hover:bg-muted dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] sm:text-xs"
                        >
                          {idea}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="rounded-[1.25rem] border border-border bg-card/80 p-3 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white sm:rounded-[2rem] sm:p-5">
            <div className="mb-3 flex items-center gap-2 sm:mb-4">
              <ClipboardList className="h-4 w-4 text-violet-600 dark:text-violet-200" />
              <h3 className="text-base font-black sm:text-lg">{t.notes}</h3>
            </div>

            <textarea
              value={weekNote}
              onChange={(e) => handleSaveWeekNote(e.target.value)}
              placeholder={t.notesPlaceholder}
              className="min-h-[120px] w-full rounded-[1rem] border border-border bg-muted/50 px-3 py-2.5 text-xs text-foreground outline-none placeholder:text-muted-foreground dark:border-white/10 dark:bg-[#07111f]/70 dark:text-white dark:placeholder:text-slate-500 sm:min-h-[140px] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
            />
            <p className="mt-2 text-[10px] text-muted-foreground dark:text-slate-500 sm:text-xs">{t.notesSaved}</p>
          </Card>

          <Card className="rounded-[1.25rem] border border-border bg-card/80 p-3 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white sm:rounded-[2rem] sm:p-5">
            <div className="mb-3 flex items-center gap-2 sm:mb-4">
              <RefreshCcw className="h-4 w-4 text-cyan-600 dark:text-cyan-200" />
              <h3 className="text-base font-black sm:text-lg">{t.patterns}</h3>
            </div>

            <div className="space-y-3">
              {repeatedMeals.length > 0 ? (
                repeatedMeals.map(([text, count]) => (
                  <div key={text} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/50 px-3 py-2.5 dark:border-white/10 dark:bg-[#07111f]/70 sm:rounded-2xl sm:px-4 sm:py-3">
                    <span className="text-xs text-foreground dark:text-slate-200 sm:text-sm">{text}</span>
                    <Badge className="rounded-full border border-border bg-muted text-[10px] text-foreground dark:border-white/10 dark:bg-white/10 dark:text-slate-200 sm:text-xs">{count}x</Badge>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-5 text-xs text-muted-foreground dark:border-white/10 dark:bg-[#07111f]/50 dark:text-slate-400 sm:rounded-2xl sm:py-6 sm:text-sm">{t.noRepeats}</div>
              )}

              {recentMeals.length > 0 && (
                <div className="pt-2">
                  <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground dark:text-slate-500 sm:text-xs">{t.recentMeals}</div>

                  <div className="flex flex-wrap gap-2">
                    {recentMeals.map((meal) => (
                      <button key={meal} type="button" onClick={() => applyIdea(meal)} className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-[11px] text-foreground transition hover:bg-muted dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] sm:text-xs">
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
      </>
      )}

      {activeTab === "groceries" && <GroceriesView />}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[1.25rem] border border-border bg-popover/95 p-4 text-popover-foreground backdrop-blur-xl dark:border-white/10 dark:bg-[#08111f]/95 dark:text-white sm:rounded-[2rem] sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-black text-foreground dark:text-white">
              <ArrowLeftRight className="text-cyan-600 dark:text-cyan-200" size={18} />
              {t.editSlot}
            </DialogTitle>

            <DialogDescription className="text-muted-foreground dark:text-slate-400">
              {DAYS[activeDayIndex].label[locale as "en" | "id"]} • {MEAL_TYPES.find((m) => m.key === activeMealType)?.label[locale as "en" | "id"]} • Week {weekStart}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="font-bold text-foreground dark:text-slate-200">{t.mealName}</Label>
              <Input
                value={activeText}
                onChange={(e) => setActiveText(e.target.value)}
                placeholder={t.mealNamePlaceholder}
                className="h-11 rounded-[1rem] border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground dark:border-white/10 dark:bg-[#07111f]/80 dark:text-white dark:placeholder:text-slate-500 sm:h-12 sm:rounded-2xl"
              />

              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] text-muted-foreground dark:text-slate-500 sm:text-xs">{t.clearToDel}</div>

                {clipboard?.text ? (
                  <Badge className="rounded-xl border border-border bg-muted/50 text-[10px] text-foreground dark:border-white/10 dark:bg-white/10 dark:text-slate-200 sm:text-xs">{t.clipReady}</Badge>
                ) : (
                  <Badge variant="outline" className="rounded-xl border-border text-[10px] text-muted-foreground dark:border-white/10 dark:text-slate-400 sm:text-xs">
                    {t.clipEmpty}
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold text-foreground dark:text-slate-200">{t.quickIdeas}</div>
              <div className="flex flex-wrap gap-2">
                {(userIdeas[activeMealType]?.length > 0 ? userIdeas[activeMealType] : MEAL_IDEAS_ID[activeMealType]).map((idea: string) => (
                  <button key={idea} type="button" onClick={() => applyIdea(idea)} className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-[11px] text-foreground transition hover:bg-muted dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] sm:text-xs">
                    {idea}
                  </button>
                ))}
              </div>
            </div>

            {recentMeals.length > 0 && (
              <div>
                <div className="mb-2 text-sm font-semibold text-foreground dark:text-slate-200">{t.recentMeals}</div>
                <div className="flex flex-wrap gap-2">
                  {recentMeals.map((meal) => (
                    <button key={meal} type="button" onClick={() => applyIdea(meal)} className="rounded-full border border-cyan-200 bg-cyan-100/50 px-3 py-1.5 text-[11px] text-cyan-800 transition hover:bg-cyan-200/50 dark:border-cyan-300/15 dark:bg-cyan-400/10 dark:text-cyan-100 dark:hover:bg-cyan-400/15 sm:text-xs">
                      {meal}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-3">
            <Button variant="outline" className="h-9 rounded-xl border-border bg-muted/50 px-3 text-xs text-foreground hover:bg-muted dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={() => setDialogOpen(false)} disabled={saving}>
              <X className="mr-1.5 h-4 w-4 sm:mr-2" />
              {t.cancel}
            </Button>

            <Button variant="outline" className="h-9 rounded-xl border-border bg-muted/50 px-3 text-xs text-foreground hover:bg-muted dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={copyFromCell} disabled={!activeText.trim() || saving}>
              <Copy className="mr-1.5 h-4 w-4 sm:mr-2" />
              {t.copy}
            </Button>

            <Button variant="outline" className="h-9 rounded-xl border-border bg-muted/50 px-3 text-xs text-foreground hover:bg-muted dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={pasteToCell} disabled={!clipboard?.text || saving}>
              {t.paste}
            </Button>

            <Button className="h-9 rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm" onClick={saveCell} disabled={saving}>
              <Save className="mr-1.5 h-4 w-4 sm:mr-2" />
              {saving ? t.saving : t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({ title, value, subtitle, icon, compact = false }: { title: React.ReactNode; value: string; subtitle: React.ReactNode; icon: React.ReactNode; compact?: boolean }) {
  return (
    <Card className="self-start rounded-[0.85rem] border border-border bg-card/80 px-2 py-2 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white sm:rounded-[1rem] sm:px-3 sm:py-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="rounded-lg border border-border bg-muted/50 p-1 dark:border-white/10 dark:bg-white/5">{icon}</div>

        {!compact && <div className="hidden text-[8px] uppercase tracking-[0.12em] text-muted-foreground dark:text-slate-500 sm:block">Overview</div>}
      </div>

      <div className="text-[14px] font-black leading-none truncate text-foreground dark:text-white sm:text-lg">{value}</div>

      <div className="mt-2 line-clamp-1 text-[10px] font-semibold leading-none text-foreground dark:text-slate-200 sm:text-xs">{title}</div>

      <div className="mt-1 hidden line-clamp-1 text-[9px] leading-none text-muted-foreground dark:text-slate-500 sm:block">{subtitle}</div>
    </Card>
  );
}
