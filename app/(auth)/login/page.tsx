import { CheckCircle2, CreditCard, Link2, Sparkles, Trophy } from "lucide-react";
import { LoginForm } from "@/components/layout/login-form";

const highlights = [
  "One dashboard for tasks, calendar, money, and saved resources.",
  "Fast daily flow with clean navigation and focused modules.",
  "Built to organize your real life, not just your to-do list.",
];

const stats = [
  { label: "Modules", value: "7+" },
  { label: "Focus", value: "All-in-one" },
  { label: "Workflow", value: "Daily-ready" },
];

export default function Page() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20" />

      <div className="relative mx-auto grid min-h-svh max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200">
              <Sparkles className="h-4 w-4" />
              Danir App • Productivity super app
            </div>
            <h1 className="text-5xl font-black leading-tight tracking-tight text-white xl:text-6xl">
              Welcome back to your
              <span className="block bg-gradient-to-r from-cyan-300 via-white to-emerald-300 bg-clip-text text-transparent">
                daily control center.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Jump back into your calendar, priorities, finances, rewards, and saved knowledge without losing momentum.
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
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.label}</p>
                </div>
              ))}
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

          <div className="mb-6 grid grid-cols-3 gap-3">
            {[
              [CreditCard, "Money"],
              [Trophy, "Rewards"],
              [Link2, "Saved Links"],
            ].map(([Icon, label]) => {
              const LucideIcon = Icon as typeof CreditCard;
              return (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
                  <LucideIcon className="mx-auto mb-2 h-5 w-5 text-cyan-200" />
                  <p className="text-xs font-medium text-slate-300">{label}</p>
                </div>
              );
            })}
          </div>

          <LoginForm />
        </section>
      </div>
    </div>
  );
}
