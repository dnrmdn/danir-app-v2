"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, CreditCard, ImageIcon, Link2, Sparkles, Trophy, UtensilsCrossed } from "lucide-react";
import { useUserSession } from "@/hooks/useUserSession";

const featurePills = [
  { icon: CalendarDays, label: "Calendar" },
  { icon: CheckCircle2, label: "Tasks" },
  { icon: CreditCard, label: "Money" },
  { icon: Link2, label: "Saved Links" },
  { icon: Trophy, label: "Rewards" },
  { icon: UtensilsCrossed, label: "Meal Plan" },
  { icon: ImageIcon, label: "Photos" },
];

export function HeroSection() {
  const { session } = useUserSession();

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_25%),linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              Danir App • Personal productivity super app
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-[5.4rem]">
              Organize your
              <span className="block bg-gradient-to-r from-cyan-300 via-white to-emerald-300 bg-clip-text text-transparent">
                entire life in one dashboard.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Calendar, tasks, rewards, meals, money, photos, and saved links — all connected in one clean workspace
              built for your daily flow.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href={session ? "/calendar" : "/login"}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-bold text-slate-950 transition hover:scale-[1.02] hover:bg-cyan-50"
              >
                {session ? "Open Dashboard" : "Get Started"}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/saved-links"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-7 py-4 text-base font-semibold text-white backdrop-blur-md transition hover:border-cyan-300/40 hover:bg-white/10"
              >
                Explore Features
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {featurePills.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-md"
                  >
                    <Icon className="h-4 w-4 text-cyan-300" />
                    {item.label}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-cyan-400/20 via-transparent to-emerald-400/20 blur-3xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-white/8 p-4 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Today overview</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">Danir App Workspace</h3>
                </div>
                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Live sync
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-300">Daily focus</p>
                    <span className="text-xs text-cyan-300">4 tasks</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Publish dashboard redesign",
                      "Review finance entries",
                      "Plan dinner this week",
                    ].map((task, index) => (
                      <div key={task} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${index === 0 ? "bg-cyan-300" : "bg-emerald-300"}`} />
                        <span className="text-sm text-slate-200">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-300">Money snapshot</p>
                    <span className="text-xs text-emerald-300">+12.4%</span>
                  </div>
                  <div className="mb-4 text-3xl font-bold text-white">Rp 12.8M</div>
                  <div className="space-y-3">
                    {[72, 48, 89, 63, 94, 70].map((height, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-cyan-300/80" />
                        <div className="h-2 flex-1 rounded-full bg-white/10">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                            style={{ width: `${height}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 md:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-300">Modules</p>
                    <span className="text-xs text-slate-400">Everything in one place</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      ["Calendar", "Events & weekly plans"],
                      ["Saved Links", "Curated content hub"],
                      ["Meal Planner", "Family meal schedule"],
                      ["Rewards", "Motivation system"],
                    ].map(([title, subtitle]) => (
                      <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">{subtitle}</p>
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
