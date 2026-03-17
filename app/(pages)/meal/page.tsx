
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { ArrowLeftRight, CalendarDays, ChevronLeft, ChevronRight, Copy, Pencil, Save, X } from "lucide-react";

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

const MEAL_TYPES: Array<{ key: MealType; label: string; emoji: string }> = [
  { key: "BREAKFAST", label: "Breakfast", emoji: "🌅" },
  { key: "SNACK", label: "Snack", emoji: "🍓" },
  { key: "LUNCH", label: "Lunch", emoji: "🍽️" },
  { key: "DINNER", label: "Dinner", emoji: "🌙" },
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

function weekStartString(date: Date) {
  return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
}

function addWeeks(date: Date, weeks: number) {
  return addDays(date, weeks * 7);
}

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

function makeKey(dayIndex: number, mealType: MealType) {
  return `${dayIndex}-${mealType}`;
}

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

  const weekStart = useMemo(() => weekStartString(currentDate), [currentDate]);
  const weekDates = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  const entryMap = useMemo(() => {
    const map = new Map<string, MealEntry>();
    for (const entry of week?.entries ?? []) {
      if (entry.sortOrder !== 0) continue;
      map.set(makeKey(entry.dayIndex, entry.mealType), entry);
    }
    return map;
  }, [week]);

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

  const saveCell = async () => {
    if (!session) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStart,
          dayIndex: activeDayIndex,
          mealType: activeMealType,
          text: activeText,
          sortOrder: 0,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Gagal menyimpan");
        return;
      }
      await fetchWeek(weekStart);
      setDialogOpen(false);
    } catch {
      setError("Gagal menyimpan");
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

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Card className="p-8 rounded-3xl border-2 border-primary/10">
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays className="text-primary" />
            <h1 className="text-3xl font-black">Meal Planner</h1>
          </div>
          <p className="text-muted-foreground mb-6">
            Kamu perlu login dulu untuk bikin rencana makan mingguan.
          </p>
          <Button asChild className="rounded-2xl font-bold">
            <Link href="/login">Login</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary uppercase tracking-widest">
            <CalendarDays size={16} />
            Weekly Meal Prep
          </div>
          <h1 className="text-5xl font-black tracking-tight">Meal Planner</h1>
          <p className="text-muted-foreground mt-2">
            Klik kotak untuk isi menu, lalu copy ke kotak lain kalau perlu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => setCurrentDate((d) => addWeeks(d, -1))}
          >
            <ChevronLeft className="mr-2" size={18} />
            Prev
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => setCurrentDate(new Date())}
          >
            This Week
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => setCurrentDate((d) => addWeeks(d, 1))}
          >
            Next
            <ChevronRight className="ml-2" size={18} />
          </Button>
          <Badge variant="secondary" className="rounded-xl px-3 py-2 text-xs">
            {weekStart} – {format(addDays(parseISODate(weekStart), 6), "yyyy-MM-dd")}
          </Badge>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-destructive/10 text-destructive font-bold p-4 rounded-2xl border border-destructive/20">
          {error}
        </div>
      )}
      {loading && (
        <div className="mb-6 bg-muted/40 text-muted-foreground font-semibold p-4 rounded-2xl border border-primary/5">
          Loading meal plan...
        </div>
      )}

      <div className="rounded-3xl border-2 border-primary/10 bg-card/40 backdrop-blur-sm overflow-hidden">
        <div className="grid grid-cols-8 bg-muted/30 border-b border-primary/10">
          <div className="p-4 text-xs font-black text-muted-foreground uppercase tracking-widest">Meal</div>
          {weekDates.map((date, idx) => (
            <div key={idx} className="p-4 border-l border-primary/5">
              <div className="text-sm font-black">{DAYS[idx].short}</div>
              <div className="text-xs text-muted-foreground">{format(date, "dd MMM")}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-rows-4">
          {MEAL_TYPES.map((meal) => (
            <div key={meal.key} className="grid grid-cols-8 border-b border-primary/5 last:border-b-0">
              <div className="p-4 bg-muted/20">
                <div className="text-sm font-black flex items-center gap-2">
                  <span>{meal.emoji}</span>
                  {meal.label}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                  {meal.key}
                </div>
              </div>

              {Array.from({ length: 7 }, (_, dayIndex) => {
                const entry = entryMap.get(makeKey(dayIndex, meal.key));
                const hasValue = !!entry?.text?.trim();
                return (
                  <button
                    key={dayIndex}
                    type="button"
                    onClick={() => openCell(dayIndex, meal.key)}
                    className={`group relative text-left p-4 border-l border-primary/5 min-h-[88px] transition-colors ${
                      hasValue ? "hover:bg-primary/5" : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Pencil size={14} className="text-muted-foreground" />
                    </div>
                    {hasValue ? (
                      <div className="text-sm font-semibold line-clamp-3">{entry?.text}</div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Click to add
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-black flex items-center gap-2">
              <ArrowLeftRight className="text-primary" size={18} />
              Edit Meal
            </DialogTitle>
            <DialogDescription>
              {DAYS[activeDayIndex].label} • {MEAL_TYPES.find((m) => m.key === activeMealType)?.label} • Week {weekStart}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label className="font-bold">Menu</Label>
            <Input
              value={activeText}
              onChange={(e) => setActiveText(e.target.value)}
              placeholder="Contoh: Ayam dori / Ikan teri bakar / Spaghetti / Buah-buahan"
              className="h-12 rounded-2xl"
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Kosongkan input untuk menghapus isi kotak.
              </div>
              {clipboard?.text ? (
                <Badge variant="secondary" className="rounded-xl">
                  Clipboard ready
                </Badge>
              ) : (
                <Badge variant="outline" className="rounded-xl">
                  Clipboard empty
                </Badge>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-3">
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              <X className="mr-2" size={18} />
              Cancel
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={copyFromCell}
              disabled={!activeText.trim() || saving}
            >
              <Copy className="mr-2" size={18} />
              Copy
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={pasteToCell}
              disabled={!clipboard?.text || saving}
            >
              Paste
            </Button>
            <Button
              className="rounded-2xl font-bold bg-gradient-to-r from-primary to-secondary"
              onClick={saveCell}
              disabled={saving}
            >
              <Save className="mr-2" size={18} />
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function parseISODate(value: string) {
  const [year, month, day] = value.split("-").map((v) => Number(v));
  return new Date(year, month - 1, day);
}
