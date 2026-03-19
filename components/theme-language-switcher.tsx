"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

export function ThemeLanguageSwitcher({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { locale, setLocale } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("h-11 w-[8.5rem] rounded-full border border-white/10 bg-white/5 animate-pulse", className)} />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className={cn("flex items-center gap-1 rounded-full border border-white/10 bg-black/20 p-1 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl", className)}>
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-all duration-200 hover:bg-white/15 hover:text-white active:scale-95"
        aria-label="Toggle Theme"
      >
        {isDark ? <Moon className="h-[1rem] w-[1rem]" /> : <Sun className="h-[1rem] w-[1rem]" />}
      </button>

      <div className="mx-1 h-5 w-px bg-white/15" />

      <div className="relative flex items-center rounded-full bg-white/5 p-0.5">
        <div className={cn("absolute top-0.5 h-8 w-9 rounded-full bg-white/15 transition-all duration-300", locale === "id" ? "left-0.5" : "left-[2.55rem]")} />
        <button
          type="button"
          onClick={() => setLocale("id")}
          className={cn("relative z-10 flex h-8 w-9 items-center justify-center rounded-full text-[11px] font-semibold tracking-wide transition-colors", locale === "id" ? "text-white" : "text-white/55 hover:text-white/80")}
          aria-label="Set language to Indonesian"
        >
          ID
        </button>
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={cn("relative z-10 flex h-8 w-9 items-center justify-center rounded-full text-[11px] font-semibold tracking-wide transition-colors", locale === "en" ? "text-white" : "text-white/55 hover:text-white/80")}
          aria-label="Set language to English"
        >
          EN
        </button>
      </div>
    </div>
  );
}
