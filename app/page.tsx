"use client";

import { useState, useEffect } from "react";
import { CalendarPreview } from "@/components/dashboard/calendar-preview";
import { Footer } from "@/components/dashboard/footer";
import { HeroSection } from "@/components/dashboard/hero-section";
import { MealPlan } from "@/components/dashboard/meal-plan";
import { MoneyTracker } from "@/components/dashboard/money-tracker";
import { RewardsSystem } from "@/components/dashboard/rewards-system";
import { SavedLinks } from "@/components/dashboard/saved-links";
import { TaskOverview } from "@/components/dashboard/task-overview";
import { useLanguage } from "@/components/language-provider";

const content = {
  // ... (Isi content object kamu biarkan persis seperti aslinya, tidak saya ubah) ...
  id: {
    badge: "Product overview",
    title: "Dashboard yang bikin hidup harian terasa gak berantakan.",
    description: "Daripada buka tool beda-beda buat tiap hal kecil, Danir App naruh kebutuhan harianmu ke satu alur yang gampang dicek, gampang diupdate, dan enak dipakai.",
    highlights: [
      { title: "Dibuat buat rutinitas beneran", description: "Catat hal yang emang kamu urus tiap hari — task, rencana, makanan, uang, dan link penting — tanpa pindah-pindah aplikasi." },
      { title: "Enak discan", description: "Layout-nya dibuat biar kamu cepat paham isi harimu, jadi check-in terasa ringan, bukan capek." },
      { title: "Clean dan personal", description: "Visual gelap-terang yang rapi, card yang fokus, dan modul praktis bikin app terasa tenang dan kepake." },
    ],
    practicalBadge: "Kenapa terasa praktis",
    practicalTitle: "Landing page harus nunjukin pemakaian nyata, bukan sekadar blok cantik.",
    useCases: ["Mulai pagi dengan cek task dan kalender sekali lihat.", "Update meal plan, reward, dan link penting tanpa motong flow.", "Taruh money tracking dekat dengan rutinitas harian yang lain."],
    readyBadge: "Siap dipakai",
    readyTitle: "Semua yang penting, lebih dekat ke alur harianmu.",
    readyDescription: "Buka dashboard, cek yang penting, lalu lanjut jalan. Gak ribet, gak loncat-loncat, cukup satu tempat buat tetap on track.",
  },
  en: {
    badge: "Product overview",
    title: "A dashboard that helps daily life feel less scattered.",
    description: "Instead of opening different tools for every little thing, Danir App brings your daily essentials into one flow that is easy to check, easy to update, and actually pleasant to use.",
    highlights: [
      { title: "Built for real routines", description: "Track the things you actually manage every day — tasks, plans, food, money, and useful links — without hopping between apps." },
      { title: "Easy to scan", description: "The layout is made to help you understand your day quickly, so checking in feels light instead of tiring." },
      { title: "Clean and personal", description: "Theme-aware visuals, focused cards, and practical modules make the app feel calm, useful, and close to real life." },
    ],
    practicalBadge: "Why it feels practical",
    practicalTitle: "A landing page should show real use, not just pretty blocks.",
    useCases: ["Start the morning by checking tasks and calendar in one glance.", "Update meal plans, rewards, and saved links without breaking your flow.", "Keep money tracking close to the rest of your daily routine."],
    readyBadge: "Ready to use",
    readyTitle: "Everything important, closer to your daily flow.",
    readyDescription: "Open the dashboard, check what matters, and keep moving. No clutter, no bouncing around, just one place to stay on top of your day.",
  },
};

export default function Dashboard() {
  const { locale } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  const t = content[locale];

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* HeroSection murni, tidak ada navbar absolute lagi */}
      <HeroSection />

      <main id="overview" className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20 xl:px-12">
        <header className="mb-12 text-center lg:mb-16 lg:text-left">
          <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-700 dark:text-cyan-200">{t.badge}</div>
          <h2 className="mt-5 max-w-4xl text-xl font-black tracking-tight sm:text-5xl lg:text-6xl">{t.title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8 lg:mx-0">{t.description}</p>
        </header>

        <section id="features" className="mb-8 grid gap-4 lg:mb-10 lg:grid-cols-3">
          {t.highlights.map((item) => (
            <article key={item.title} className="rounded-3xl border border-border bg-card/70 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="mb-8 rounded-[2rem] border border-border bg-gradient-to-r from-card to-muted/40 p-6 backdrop-blur-sm lg:mb-10 lg:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">{t.practicalBadge}</p>
            <h3 className="mt-3 text-2xl font-bold sm:text-3xl">{t.practicalTitle}</h3>
          </div>
          <div className="mt-6 grid gap-3 lg:grid-cols-3">
            {t.useCases.map((item) => (
              <div key={item} className="rounded-2xl border border-border bg-background/70 p-4 text-sm leading-6 text-foreground sm:text-base">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 grid auto-rows-fr grid-cols-1 gap-6 lg:grid-cols-2">
          <TaskOverview />
          <CalendarPreview />
        </section>

        <section className="mb-6 grid auto-rows-fr grid-cols-1 gap-6 lg:grid-cols-2">
          <RewardsSystem />
          <MealPlan />
        </section>

        <section className="grid auto-rows-fr grid-cols-1 gap-6 lg:grid-cols-2">
          <SavedLinks />
          <MoneyTracker />
        </section>

        <section className="mt-8 rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-6 text-center backdrop-blur-sm sm:p-8 lg:mt-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-800 dark:text-cyan-100">{t.readyBadge}</p>
          <h3 className="mt-3 text-2xl font-bold sm:text-3xl">{t.readyTitle}</h3>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-cyan-900/80 dark:text-cyan-50/85 sm:text-base sm:leading-7">{t.readyDescription}</p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
