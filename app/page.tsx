import { CalendarPreview } from "@/components/dashboard/calendar-preview";
import { Footer } from "@/components/dashboard/footer";
import { HeroSection } from "@/components/dashboard/hero-section";
import { MealPlan } from "@/components/dashboard/meal-plan";
import { MoneyTracker } from "@/components/dashboard/money-tracker";
import { RewardsSystem } from "@/components/dashboard/rewards-system";
import { SavedVideos } from "@/components/dashboard/saved-videos";
import { TaskOverview } from "@/components/dashboard/task-overview";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      {/* Top Section */}
      <HeroSection />

      {/* Main Dashboard Section */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header */}
        <header className="mb-12 text-center lg:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Your Dashboard
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to manage your life, in one place.
          </p>
        </header>

        {/* Grid Section 1 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr mb-10">
          <TaskOverview />
          <CalendarPreview />
        </section>

        {/* Grid Section 2 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr mb-10">
          <RewardsSystem />
          <MealPlan />
        </section>

        {/* Grid Section 3 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
          <SavedVideos />
          <MoneyTracker />
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
