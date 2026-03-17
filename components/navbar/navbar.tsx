"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Calendar1, CheckCircle, ForkKnifeIcon, Image, Link2, Sparkles, Stars, Wallet } from "lucide-react";
import { useUserSession } from "@/hooks/useUserSession";

const navItems = [
  { label: "Calendar", href: "/calendar", icon: Calendar1 },
  { label: "Task", href: "/task", icon: CheckCircle },
  { label: "Reward", href: "/reward", icon: Stars },
  { label: "Meal", href: "/meal", icon: ForkKnifeIcon },
  { label: "Money", href: "/money", icon: Wallet },
  { label: "Photos", href: "/photo", icon: Image },
  { label: "Links", href: "/saved-links", icon: Link2 },
];

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/calendar": { title: "Calendar", subtitle: "Plan events, routines, and weekly focus." },
  "/task": { title: "Task", subtitle: "Track priorities and keep momentum moving." },
  "/reward": { title: "Reward", subtitle: "Turn progress into motivation." },
  "/meal": { title: "Meal", subtitle: "Keep your weekly meal plan clear and simple." },
  "/money": { title: "Money", subtitle: "Watch your spending, budgets, and goals." },
  "/photo": { title: "Photos", subtitle: "A quick visual space for your memories." },
  "/saved-links": { title: "Saved Links", subtitle: "Your curated library of useful content." },
  "/list": { title: "List", subtitle: "Capture quick notes and simple collections." },
};

export default function Navbar() {
  const pathname = usePathname();
  const { user, session } = useUserSession();
  const [loginState, setLoginState] = useState<"first-ever" | "first-this-session" | "returning" | null>(null);

  useEffect(() => {
    if (!session || !user?.email) return;

    const userKey = user.email;
    const localKey = `hasLoggedIn-${userKey}`;
    const sessionKey = `sessionActive-${userKey}`;
    const hasLoggedInBefore = localStorage.getItem(localKey);
    const hasSessionActive = sessionStorage.getItem(sessionKey);

    queueMicrotask(() => {
      if (!hasLoggedInBefore) {
        localStorage.setItem(localKey, "true");
        sessionStorage.setItem(sessionKey, "true");
        setLoginState("first-ever");
      } else if (!hasSessionActive) {
        sessionStorage.setItem(sessionKey, "true");
        setLoginState("first-this-session");
      } else {
        setLoginState("returning");
      }
    });
  }, [session, user?.email]);

  const currentPage = useMemo(
    () => pageMeta[pathname] ?? { title: "Workspace", subtitle: "Manage your system from one place." },
    [pathname]
  );

  const greeting = loginState === "first-ever" ? `Welcome, ${user?.name ?? "there"}` : `Hey, ${user?.name ?? "there"}`;

  if (!session || !user) return null;

  return (
    <header className="relative px-4 pt-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200 backdrop-blur-xl">
          <Sparkles className="h-3.5 w-3.5" />
          {greeting}
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{currentPage.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">{currentPage.subtitle}</p>
      </div>

      <div className="mx-auto flex w-full justify-center">
        <nav className="flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-[#08111f]/75 px-3 py-3 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-400/20 to-emerald-400/15 text-white shadow-lg shadow-cyan-950/20 ring-1 ring-cyan-300/20"
                    : "text-slate-300 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-cyan-200" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
