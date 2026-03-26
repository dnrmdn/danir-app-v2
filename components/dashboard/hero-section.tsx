"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, CalendarDays, CheckCircle2, CreditCard, ImageIcon, Link2, Sparkles, Trophy, UtensilsCrossed } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { useUserSession } from "@/hooks/useUserSession";
import { useHasMounted } from "@/hooks/useHasMounted";

const ThemeLanguageSwitcher = dynamic(() => import("@/components/theme-language-switcher").then((mod) => mod.ThemeLanguageSwitcher), { ssr: false });

const featurePills = [
  { icon: CalendarDays, label: { id: "Kalender", en: "Calendar" } },
  { icon: CheckCircle2, label: { id: "Tugas", en: "Tasks" } },
  { icon: CreditCard, label: { id: "Uang", en: "Money" } },
  { icon: Link2, label: { id: "Link Tersimpan", en: "Saved Links" } },
  { icon: Trophy, label: { id: "Reward", en: "Rewards" } },
  { icon: UtensilsCrossed, label: { id: "Meal Plan", en: "Meal Plan" } },
  { icon: ImageIcon, label: { id: "Foto", en: "Photos" } },
];

const quickStats = {
  id: [
    { value: "7 modul", label: "buat kerja, rumah, dan rutinitas harian" },
    { value: "Lebih rapi", label: "karena semuanya ada di satu tempat" },
    { value: "1 dashboard", label: "buat cek hari kamu sekali lihat" },
  ],
  en: [
    { value: "7 modules", label: "for work, home, and daily life" },
    { value: "Less chaos", label: "because everything lives in one place" },
    { value: "1 dashboard", label: "to check your whole day at a glance" },
  ],
};

const copy = {
  id: {
    badge: "Danir App • Dibuat buat rutinitas harian beneran",
    titleA: "Simpan tugas, rencana,",
    titleB: "uang, meal, dan link dalam satu tempat.",
    description: "Danir App bantu kamu ngatur hidup sehari-hari tanpa bolak-balik pindah aplikasi. Cek jadwal, update task, atur meal, catat uang, dan simpan hal penting dari satu dashboard yang rapi.",
    note: "Dibuat biar kepake tiap hari, bukan cuma keliatan bagus di screenshot",
    ctaPrimary: "Buka Dashboard",
    ctaPrimaryLoggedOut: "Mulai Sekarang",
    ctaSecondary: "Lihat Preview",
    previewTitle: "Hari kamu, kebaca dalam hitungan detik",
    previewLabel: "Ringkasan hari ini",
    liveSync: "Sinkron aktif",
    dailyFocus: "Fokus hari ini",
    moneySnapshot: "Ringkasan uang",
    modules: "Modul",
    everything: "Semua dalam satu tempat",
    moduleCards: [
      ["Kalender", "Event dan rencana mingguan"],
      ["Link Tersimpan", "Kumpulan referensi penting"],
      ["Meal Planner", "Atur makan mingguan"],
      ["Reward", "Sistem motivasi"],
    ],
    tasks: ["Publish dashboard redesign", "Review finance entries", "Plan dinner this week"],
  },
  en: {
    badge: "Danir App • Built for real daily routines",
    titleA: "Keep tasks, plans,",
    titleB: "money, meals, and links in one place.",
    description: "Danir App helps you manage everyday life without jumping between apps. Check your schedule, update tasks, plan meals, track money, and save useful stuff from one clean dashboard.",
    note: "Made to feel useful every day, not just look good in a screenshot",
    ctaPrimary: "Open Dashboard",
    ctaPrimaryLoggedOut: "Get Started",
    ctaSecondary: "See Preview",
    previewTitle: "Your day, visible in seconds",
    previewLabel: "Today overview",
    liveSync: "Live sync",
    dailyFocus: "Daily focus",
    moneySnapshot: "Money snapshot",
    modules: "Modules",
    everything: "Everything in one place",
    moduleCards: [
      ["Calendar", "Events & weekly plans"],
      ["Saved Links", "Curated content hub"],
      ["Meal Planner", "Family meal schedule"],
      ["Rewards", "Motivation system"],
    ],
    tasks: ["Publish dashboard redesign", "Review finance entries", "Plan dinner this week"],
  },
};

export function HeroSection() {
  const { session } = useUserSession();
  const { locale } = useLanguage();
  const mounted = useHasMounted();

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  const t = copy[locale];
  const stats = quickStats[locale];

  return (
    <section className="relative overflow-hidden border-b border-border bg-background text-foreground">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_25%),linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent)] dark:opacity-100 opacity-70" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(127,127,127,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(127,127,127,0.06)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30 dark:opacity-20" />
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />

      {/* Main Container */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-start px-5 pt-5 pb-16 sm:px-8 sm:pt-10 lg:justify-center lg:px-10 lg:py-20 xl:px-12">
        <div className="mb-8 flex w-full items-start justify-between gap-3 sm:mb-10 sm:items-center lg:mb-12">
          {/* Badge Kiri (Diperkecil di mobile, kembali normal di sm) */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-700 backdrop-blur-md dark:text-cyan-200 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
            <Sparkles className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            <span className="leading-tight">{t.badge}</span>
          </div>

          {/* Switcher Kanan (Diberi shrink-0 agar tidak menyusut tergencet teks) */}
          <div className="relative z-50 shrink-0">
            <ThemeLanguageSwitcher />
          </div>
        </div>

        {/* ========================================================= */}
        {/* KONTEN UTAMA: Grid Teks dan Preview (Sekarang rapi di bawah) */}
        {/* ========================================================= */}
        <div className="grid flex-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] xl:gap-16">
          {/* KOLOM KIRI (Teks dkk) */}
          <div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-[5.2rem]">
              {t.titleA}
              <span className="block bg-gradient-to-r from-cyan-500 via-foreground to-emerald-500 bg-clip-text text-transparent">{t.titleB}</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8 xl:text-xl">{t.description}</p>

            <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {t.note}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href={session ? "/calendar" : "/login"} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-7 py-4 text-base font-bold text-background transition hover:scale-[1.02] hover:opacity-90">
                {session ? t.ctaPrimary : t.ctaPrimaryLoggedOut}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/#overview"
                className="inline-flex items-center justify-center rounded-2xl border border-border bg-card/70 px-7 py-4 text-base font-semibold text-foreground backdrop-blur-md transition hover:border-cyan-400/40 hover:bg-accent"
              >
                {t.ctaSecondary}
              </Link>
            </div>

            <PwaInstallPrompt />

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-card/70 px-4 py-4 backdrop-blur-md">
                  <div className="text-lg font-bold sm:text-xl">{item.value}</div>
                  <div className="mt-1 text-sm leading-6 text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {featurePills.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label.en} className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-foreground backdrop-blur-md">
                    <Icon className="h-4 w-4 text-cyan-500 dark:text-cyan-300" />
                    {item.label[locale]}
                  </div>
                );
              })}
            </div>
          </div>

          {/* KOLOM KANAN (Preview Card) */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-cyan-400/20 via-transparent to-emerald-400/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card/80 p-4 shadow-2xl shadow-cyan-950/10 backdrop-blur-xl dark:shadow-cyan-950/40">
              <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border bg-background/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.previewLabel}</p>
                  <h3 className="mt-1 text-lg font-semibold">{t.previewTitle}</h3>
                </div>
                <div className="w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">{t.liveSync}</div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{t.dailyFocus}</p>
                    <span className="text-xs text-cyan-600 dark:text-cyan-300">4 tasks</span>
                  </div>
                  <div className="space-y-3">
                    {t.tasks.map((task, index) => (
                      <div key={task} className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${index === 0 ? "bg-cyan-400" : "bg-emerald-400"}`} />
                        <span className="text-sm">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{t.moneySnapshot}</p>
                    <span className="text-xs text-emerald-600 dark:text-emerald-300">+12.4%</span>
                  </div>
                  <div className="mb-4 text-3xl font-bold">Rp 12.8M</div>
                  <div className="space-y-3">
                    {[72, 48, 89, 63, 94, 70].map((height, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-cyan-400/80" />
                        <div className="h-2 flex-1 rounded-full bg-muted">
                          <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${height}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background/70 p-4 md:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{t.modules}</p>
                    <span className="text-xs text-muted-foreground">{t.everything}</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {t.moduleCards.map(([title, subtitle]) => (
                      <div key={title} className="rounded-2xl border border-border bg-card p-4">
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
