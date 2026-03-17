import { CalendarPreview } from "@/components/dashboard/calendar-preview";
import { Footer } from "@/components/dashboard/footer";
import { HeroSection } from "@/components/dashboard/hero-section";
import { MealPlan } from "@/components/dashboard/meal-plan";
import { MoneyTracker } from "@/components/dashboard/money-tracker";
import { RewardsSystem } from "@/components/dashboard/rewards-system";
import { SavedLinks } from "@/components/dashboard/saved-links";
import { TaskOverview } from "@/components/dashboard/task-overview";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <HeroSection />

      <main className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-12 text-center lg:text-left">
          <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200">
            Product overview
          </div>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
            A bento-style preview of your daily system.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-300 lg:mx-0">
            Danir App keeps your routines, plans, money, and saved resources inside one clean workflow — fast to scan,
            easy to manage, and built for real everyday life.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 auto-rows-fr mb-6">
          <TaskOverview />
          <CalendarPreview />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 auto-rows-fr mb-6">
          <RewardsSystem />
          <MealPlan />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 auto-rows-fr">
          <SavedLinks />
          <MoneyTracker />
        </section>
      </main>

      <Footer />
    </div>
  );
}
