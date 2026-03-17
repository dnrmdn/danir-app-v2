import { CalendarDays, CheckCircle2, CreditCard, Sparkles, UtensilsCrossed } from "lucide-react";
import { SignupForm } from "@/components/layout/signup-form";

const highlights = [
  "Set up one clean workspace for your plans, routines, and priorities.",
  "Track tasks, meals, rewards, links, and money in one flow.",
  "Built for daily life with a modern dashboard that stays easy to use.",
];

export default function SignupPage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.15),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20" />

      <div className="relative mx-auto grid min-h-svh max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200">
              <Sparkles className="h-4 w-4" />
              Build your workspace
            </div>
            <h1 className="text-5xl font-black leading-tight tracking-tight text-white xl:text-6xl">
              Start organizing
              <span className="block bg-gradient-to-r from-cyan-300 via-white to-emerald-300 bg-clip-text text-transparent">
                everything that matters.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Danir App gives you one modern dashboard for planning, tracking, and managing your everyday life.
            </p>

            <div className="mt-8 space-y-4">
              {highlights.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                  <p className="text-slate-200">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                [CalendarDays, "Calendar"],
                [CreditCard, "Money"],
                [UtensilsCrossed, "Meals"],
              ].map(([Icon, label]) => {
                const LucideIcon = Icon as typeof CalendarDays;
                return (
                  <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-center">
                    <LucideIcon className="mx-auto mb-2 h-5 w-5 text-cyan-200" />
                    <p className="text-sm font-medium text-slate-300">{label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-xl lg:ml-auto">
          <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
            <div className="rounded-xl border border-white/10 bg-white/10 p-2">
              <Sparkles className="h-5 w-5 text-cyan-200" />
            </div>
            <span className="text-lg font-semibold text-white">Danir App</span>
          </div>
          <SignupForm />
        </section>
      </div>
    </div>
  );
}
