"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Calendar1, CheckCircle, ChevronDown, ForkKnifeIcon, Image as ImageIcon, Link2, LogOut, Settings2, Sparkles, Stars, UserCircle2, Wallet } from "lucide-react";
import { useUserSession } from "@/hooks/useUserSession";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeLanguageSwitcher } from "../theme-language-switcher";

const navItems = [
  { label: "Calendar", href: "/calendar", icon: Calendar1 },
  { label: "Task", href: "/task", icon: CheckCircle },
  { label: "Reward", href: "/reward", icon: Stars },
  { label: "Meal", href: "/meal", icon: ForkKnifeIcon },
  { label: "Money", href: "/money", icon: Wallet },
  { label: "Photos", href: "/photo", icon: ImageIcon },
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
  const router = useRouter();
  const { user, session, handleSignOut } = useUserSession();
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

  const currentPage = useMemo(() => pageMeta[pathname] ?? { title: "Workspace", subtitle: "Manage your system from one place." }, [pathname]);

  if (!session || !user) return null;

  const greeting = loginState === "first-ever" ? `Welcome, ${user.name}` : `Hey, ${user.name}`;

  return (
    <header className="relative px-4 pt-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col items-center gap-4 text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-100/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-800 backdrop-blur-xl transition hover:border-cyan-300 hover:bg-cyan-200/50 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200 dark:hover:border-cyan-300/30 dark:hover:bg-cyan-400/15">
              <Sparkles className="h-3.5 w-3.5" />
              {greeting}
              <ChevronDown className="h-3.5 w-3.5 transition group-data-[state=open]:rotate-180" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="center" sideOffset={10} className="min-w-64 rounded-3xl border border-border bg-popover/95 p-2 text-popover-foreground shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1525]/95 dark:text-white dark:shadow-cyan-950/30">
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="rounded-2xl bg-muted/50 dark:bg-white/[0.04] px-3 py-3 text-left">
                <div className="truncate text-sm font-semibold text-foreground dark:text-white">{user.name}</div>
                <div className="truncate text-xs text-muted-foreground dark:text-slate-400">{user.email}</div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="my-2 bg-border dark:bg-white/10" />

            {/* INTEGRASI SWITCHER DI SINI */}
            <div className="px-2 py-2 flex justify-center">
              <ThemeLanguageSwitcher className="w-full justify-between" />
            </div>

            <DropdownMenuSeparator className="my-2 bg-border dark:bg-white/10" />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/profile")} className="rounded-2xl text-foreground focus:bg-accent focus:text-accent-foreground dark:text-slate-200 dark:focus:bg-white/10 dark:focus:text-white">
                <UserCircle2 className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")} className="rounded-2xl text-foreground focus:bg-accent focus:text-accent-foreground dark:text-slate-200 dark:focus:bg-white/10 dark:focus:text-white">
                <Settings2 className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-2 bg-border dark:bg-white/10" />
            <DropdownMenuItem onClick={handleSignOut} className="rounded-2xl text-red-600 focus:bg-red-100 focus:text-red-700 dark:text-red-300 dark:focus:bg-red-500/10 dark:focus:text-red-200">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground dark:text-white sm:text-4xl">{currentPage.title}</h1>
          <p className="mt-2 max-w-2xl mx-auto text-sm text-muted-foreground dark:text-slate-400 sm:text-base">{currentPage.subtitle}</p>
        </div>
      </div>

      <div className="mx-auto flex w-full justify-center">
        <nav className="flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-border bg-card/75 px-3 py-3 shadow-md backdrop-blur-xl dark:border-white/10 dark:bg-[#08111f]/75 dark:shadow-2xl dark:shadow-cyan-950/20">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-all sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm ${isActive ? "bg-cyan-100 text-cyan-900 shadow-sm ring-1 ring-cyan-200 dark:bg-gradient-to-r dark:from-cyan-400/20 dark:to-emerald-400/15 dark:text-black dark:shadow-lg dark:shadow-cyan-950/20 dark:ring-cyan-300/20" : "text-muted-foreground hover:bg-muted hover:text-foreground dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white"
                  }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-cyan-700 dark:text-cyan-900" : "text-muted-foreground dark:text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
