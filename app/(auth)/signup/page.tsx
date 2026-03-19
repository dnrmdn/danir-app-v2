"use client";

import { useState, useEffect } from "react";
import { CalendarDays, CheckCircle2, CreditCard, Sparkles, UtensilsCrossed } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { ThemeLanguageSwitcher } from "@/components/theme-language-switcher";
import { SignupForm } from "@/components/layout/signup-form";

const content = {
  id: {
    badge: "Bangun workspace kamu",
    titleA: "Mulai atur",
    titleB: "semua yang penting.",
    description: "Danir App kasih satu dashboard modern buat ngerencanain, ngelacak, dan ngatur hidup sehari-hari kamu.",
    highlights: ["Siapin satu workspace yang rapi buat rencana.", "Track task, meal, reward, link, dan uang.", "Dashboard modern yang tetap gampang dipakai."],
    cards: ["Kalender", "Uang", "Meal"],
  },
  en: {
    badge: "Build your workspace",
    titleA: "Start organizing",
    titleB: "everything that matters.",
    description: "Danir App gives you one modern dashboard for planning, tracking, and managing your everyday life.",
    highlights: ["Set up one clean workspace for your plans.", "Track tasks, meals, rewards, links, and money.", "Modern dashboard that stays easy to use."],
    cards: ["Calendar", "Money", "Meals"],
  },
};

const cardIcons = [CalendarDays, CreditCard, UtensilsCrossed];

export default function SignupPage() {
  const { locale } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // FIX HYDRATION: Tunggu client-side siap
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.14),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(127,127,127,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(127,127,127,0.06)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30 dark:opacity-20" />

      {/* KONTAINER UTAMA */}
      <div className="relative mx-auto flex min-h-svh max-w-7xl flex-col px-5 py-6 sm:px-8 sm:py-10 lg:px-10 xl:px-12">
        {/* ========================================================= */}
        {/* BARIS ATAS: Sejajar Sempurna Badge & Switcher            */}
        {/* ========================================================= */}
        <div className="mb-6 flex w-full items-center justify-between gap-3 sm:mb-10 lg:mb-12">
          {/* Badge Kiri */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-medium text-emerald-700 backdrop-blur-md dark:text-emerald-200 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs">
            <Sparkles className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            <span className="truncate">{t.badge}</span>
          </div>

          {/* Switcher Kanan */}
          <div className="relative z-50 shrink-0">
            <ThemeLanguageSwitcher />
          </div>
        </div>

        {/* ========================================================= */}
        {/* GRID KONTEN                                               */}
        {/* ========================================================= */}
        <div className="grid flex-1 items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* SEKSI KIRI: Headline & Info */}
          <section className="order-2 lg:order-1">
            <div className="mx-auto max-w-xl lg:mx-0">
              <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl xl:text-6xl">
                {t.titleA}
                <span className="block bg-gradient-to-r from-cyan-500 via-foreground to-emerald-500 bg-clip-text text-transparent">{t.titleB}</span>
              </h1>

              <p className="mt-4 text-sm leading-6 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8">{t.description}</p>

              {/* Highlights (Kecil di mobile) */}
              <div className="mt-6 space-y-3 sm:mt-8">
                {t.highlights.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-border bg-card/70 px-4 py-3 backdrop-blur-sm sm:py-4">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400 sm:h-5 sm:w-5" />
                    <p className="text-xs leading-5 sm:text-base sm:leading-7">{item}</p>
                  </div>
                ))}
              </div>

              {/* Cards Icons */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                {cardIcons.map((LucideIcon, index) => (
                  <div key={index} className="rounded-2xl border border-border bg-card/70 p-3 text-center backdrop-blur-sm sm:p-4">
                    <LucideIcon className="mx-auto mb-1.5 h-4 w-4 text-cyan-500 dark:text-cyan-200 sm:mb-2 sm:h-5 sm:w-5" />
                    <p className="text-[10px] font-medium text-muted-foreground sm:text-sm">{t.cards[index]}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SEKSI KANAN: Signup Form */}
          <section className="order-1 mx-auto w-full max-w-xl lg:order-2 lg:ml-auto">
            {/* Logo Mobile Only */}
            <div className="mb-5 flex items-center justify-center gap-3 lg:hidden">
              <div className="rounded-xl border border-border bg-card p-2">
                <Sparkles className="h-5 w-5 text-cyan-500 dark:text-cyan-200" />
              </div>
              <span className="text-lg font-semibold">Danir App</span>
            </div>

            <SignupForm />
          </section>
        </div>
      </div>
    </div>
  );
}
