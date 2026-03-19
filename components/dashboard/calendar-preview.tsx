"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useState } from "react";

export function CalendarPreview() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 10));

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-xl shadow-cyan-950/5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:shadow-cyan-950/10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-400/20 dark:text-emerald-200">
            <CalendarDays className="h-3.5 w-3.5" />
            Smart Planning
          </div>
          <h3 className="text-xl font-semibold text-foreground dark:text-white">Calendar</h3>
          <p className="mt-2 text-sm text-muted-foreground dark:text-slate-300">Plan your week, keep track of events, and stay ahead of deadlines.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="rounded-xl border border-border bg-muted/50 p-2 text-muted-foreground transition hover:border-cyan-400/40 hover:bg-accent hover:text-foreground dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:border-cyan-400/30 dark:hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="rounded-xl border border-border bg-muted/50 p-2 text-muted-foreground transition hover:border-cyan-400/40 hover:bg-accent hover:text-foreground dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:border-cyan-400/30 dark:hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-muted/30 p-4 dark:border-white/10 dark:bg-slate-950/60">
        <p className="mb-4 text-center text-sm font-medium text-foreground dark:text-slate-200">{monthName}</p>

        <div className="mb-3 grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground dark:text-slate-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {emptyDays.map((i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const isHighlighted = day === 8 || day === 14 || day === 22;
            const isToday = day === 18;
            return (
              <button
                key={day}
                className={`aspect-square rounded-xl text-sm font-medium transition ${
                  isToday
                    ? "bg-foreground text-background dark:bg-white dark:text-slate-950"
                    : isHighlighted
                      ? "border border-cyan-200 bg-cyan-100 text-cyan-700 dark:border-cyan-300/25 dark:bg-cyan-400/15 dark:text-cyan-200"
                      : "border border-transparent bg-background text-foreground hover:border-border hover:bg-accent dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/10 dark:hover:bg-white/10"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
