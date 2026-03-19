"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

const footerLinks = [
  { href: "/calendar", label: { id: "Kalender", en: "Calendar" } },
  { href: "/task", label: { id: "Tugas", en: "Task" } },
  { href: "/money", label: { id: "Uang", en: "Money" } },
  { href: "/saved-links", label: { id: "Link Tersimpan", en: "Saved Links" } },
];

const descriptions = {
  id: "App produktivitas personal untuk tugas, kalender, reward, uang, meal planning, foto, dan link tersimpan.",
  en: "Personal productivity super app for tasks, calendar, rewards, money, meal planning, photos, and saved links.",
};

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { locale } = useLanguage();

  return (
    <footer id="footer" className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12 xl:px-12">
        <div className="grid gap-8 rounded-[2rem] border border-border bg-card/70 p-6 text-sm text-muted-foreground backdrop-blur-sm lg:grid-cols-[1.2fr_0.8fr_auto] lg:items-center lg:p-8">
          <div>
            <p className="text-base font-semibold text-foreground">Danir App</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">{descriptions[locale]}</p>
          </div>

          <nav className="flex flex-wrap items-center gap-4 gap-y-3 sm:gap-5">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-foreground">
                {link.label[locale]}
              </Link>
            ))}
          </nav>

          <div className="text-muted-foreground lg:text-right">© {currentYear} Danir App</div>
        </div>
      </div>
    </footer>
  );
}
