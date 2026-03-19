"use client";

import { useState, useEffect } from "react"; // Tambah useEffect & useState
import { CalendarDays, CreditCard, Link2, Sparkles, Trophy, UtensilsCrossed } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { ThemeLanguageSwitcher } from "@/components/theme-language-switcher";
import { LoginForm } from "@/components/layout/login-form";

const content = {
  id: {
    badge: "Danir App • Selamat datang lagi",
    titleA: "Masuk lagi ke",
    titleB: "dashboard harianmu.",
    description: "Semua yang penting buat rutinitasmu ada di sini — kalender, task, uang, reward, meal plan, dan link penting.",
    note: "Cepat dibuka, gampang dicek",
    stats: [
      { label: "Modul", value: "7+" },
      { label: "Style", value: "Clean" },
      { label: "Flow", value: "Ready" },
    ],
    quickAccess: ["Kalender", "Uang", "Reward", "Link", "Meal"],
    highlights: ["Cek jadwal & task harian.", "Alur cepat dibaca.", "Dibuat buat rutinitas."],
  },
  en: {
    badge: "Danir App • Welcome back",
    titleA: "Log back into",
    titleB: "your daily dashboard.",
    description: "Everything important for your routine lives here — calendar, tasks, money, rewards, meals, and links.",
    note: "Quick to open, easy to scan",
    stats: [
      { label: "Modules", value: "7+" },
      { label: "Style", value: "Clean" },
      { label: "Flow", value: "Ready" },
    ],
    quickAccess: ["Calendar", "Money", "Rewards", "Links", "Meals"],
    highlights: ["Check schedule & tasks.", "Fast scan flow.", "Built for routines."],
  },
};

const quickIcons = [CalendarDays, CreditCard, Trophy, Link2, UtensilsCrossed];

export default function Page() {
  const { locale } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // FIX HYDRATION: Tunggu sampai client-side siap
  useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  if (!mounted) {
    return <div className="min-h-svh bg-background" />;
  }

  const t = content[locale];

  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_30%)]" />

      <div className="relative mx-auto flex min-h-svh max-w-7xl flex-col px-5 py-6 sm:px-8 sm:py-10 lg:px-10 xl:px-12">
        {/* BARIS ATAS: Badge & Switcher (Dikecilkan di Mobile) */}
        <div className="mb-6 flex w-full items-center justify-between gap-3 sm:mb-10 lg:mb-12">
          {/* Badge Kiri */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-medium text-cyan-700 backdrop-blur-md dark:text-cyan-200 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs">
            <Sparkles className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            <span className="truncate">{t.badge}</span>
          </div>

          {/* Switcher Kanan */}
          <div className="relative z-50 shrink-0">
            <ThemeLanguageSwitcher />
          </div>
        </div>

        {/* GRID KONTEN */}
        <div className="grid flex-1 items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* SEKSI KIRI: Headline */}
          <section className="order-2 lg:order-1">
            <div className="mx-auto max-w-xl lg:mx-0">
              <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl xl:text-6xl">
                {t.titleA}
                <span className="block bg-linear-to-r from-cyan-500 via-foreground to-emerald-500 bg-clip-text text-transparent">{t.titleB}</span>
              </h1>

              <p className="mt-4 text-sm leading-6 text-muted-foreground sm:mt-5 sm:text-lg sm:leading-8">{t.description}</p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] text-emerald-700 dark:text-emerald-100 sm:px-4 sm:py-2 sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {t.note}
              </div>

              {/* Stats: Di mobile 3 kolom kecil */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                {t.stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border bg-card/70 p-3 backdrop-blur-sm sm:p-4">
                    <p className="text-lg font-bold sm:text-2xl">{item.value}</p>
                    <p className="text-[10px] text-muted-foreground sm:text-sm">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SEKSI KANAN: Login & Icons */}
          <section className="order-1 mx-auto w-full max-w-xl lg:order-2">
            {/* Quick Access Icons: Kecilin padding & text */}
            <div className="mb-4 grid grid-cols-5 gap-2 lg:mb-5">
              {quickIcons.map((LucideIcon, index) => (
                <div key={index} className="rounded-xl border border-border bg-card/70 p-2 text-center backdrop-blur-sm sm:rounded-2xl sm:p-4">
                  <LucideIcon className="mx-auto mb-1 h-4 w-4 text-cyan-500 dark:text-cyan-200 sm:mb-2 sm:h-5 sm:w-5" />
                  <p className="hidden text-[10px] font-medium text-muted-foreground sm:block sm:text-xs">{t.quickAccess[index]}</p>
                </div>
              ))}
            </div>

            <LoginForm />
          </section>
        </div>
      </div>
    </div>
  );
}
