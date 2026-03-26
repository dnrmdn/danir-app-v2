"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Palette, Sparkles, Languages, ShieldCheck, LockKeyhole } from "lucide-react";
import { useUserSession } from "@/hooks/useUserSession";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/language-provider";
import { ChangePasswordDialog } from "@/components/setting/change-password-dialog";
import { PartnerSection } from "@/components/setting/partner-section";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useHasMounted } from "@/hooks/useHasMounted";

const contentSettingsLocal = {
  id: {
    pageTitle: "Pengaturan",
    heroTag: "Kontrol Workspace",
    heroDesc: "Semua preferensi penting ada di sini agar mudah diatur.",

    notif: "Notifikasi",
    notifDesc: "Atur pengingat agar aplikasi membantu tanpa cerewet.",
    emailNotif: "Notifikasi email",
    taskNotif: "Pengingat tugas",
    mealNotif: "Pengingat menu makan",
    moneyNotif: "Pengingat keuangan",

    appearance: "Tampilan",
    appearanceDesc: "Sesuaikan tampilan dan bahasa sesuai selera Anda.",
    darkMode: "Mode gelap",
    language: "Bahasa",
    compactCards: "Kartu ringkas",

    security: "Keamanan",
    securityDesc: "Kelola password akun dan keamanan login Anda.",
    changePassword: "Ubah Password",
    changePasswordHint: "Perbarui password akun lokal Anda agar tetap aman.",

    accountActions: "Aksi Akun",
    accountDesc: "Opsi untuk mengontrol sesi masuk akun Anda.",
    logOut: "Keluar",
    plan: "Paket",
    planDesc: "Lihat status paket Anda dan batas akses yang sedang berlaku.",
    currentPlan: "Paket saat ini",
    trialDaysLeft: "Sisa trial",
    sharedAccess: "Akses shared feature",
    linksLimit: "Batas saved links",
    moneyWindow: "Riwayat money",
    enabled: "Aktif",
    locked: "Terkunci",
    unlimited: "Unlimited",
    months: "bulan",
  },
  en: {
    pageTitle: "Settings",
    heroTag: "Workspace controls",
    heroDesc: "All your important preferences gathered here for easy access.",

    notif: "Notifications",
    notifDesc: "Set reminders so the app is helpful but not annoying.",
    emailNotif: "Email notifications",
    taskNotif: "Task reminders",
    mealNotif: "Meal plan reminders",
    moneyNotif: "Money tracker reminders",

    appearance: "Appearance",
    appearanceDesc: "Customize the look, feel, and language of your workspace.",
    darkMode: "Dark mode",
    language: "Language",
    compactCards: "Compact cards",

    security: "Security",
    securityDesc: "Manage your account password and login security.",
    changePassword: "Change Password",
    changePasswordHint: "Update your local account password to keep it secure.",

    accountActions: "Account actions",
    accountDesc: "Options to control your account login sessions.",
    logOut: "Log out",
    plan: "Plan",
    planDesc: "See your current plan status and the access limits that apply right now.",
    currentPlan: "Current plan",
    trialDaysLeft: "Trial left",
    sharedAccess: "Shared features",
    linksLimit: "Saved links limit",
    moneyWindow: "Money history",
    enabled: "Enabled",
    locked: "Locked",
    unlimited: "Unlimited",
    months: "months",
  },
} as const;

function useLocalSetting(key: string, defaultValue: boolean) {
  const mounted = useHasMounted();
  const [val, setVal] = useState(() => {
    if (typeof window === "undefined") {
      return defaultValue;
    }

    const stored = localStorage.getItem(`setting_${key}`);
    return stored !== null ? stored === "true" : defaultValue;
  });

  const updateVal = (newValue: boolean) => {
    setVal(newValue);
    localStorage.setItem(`setting_${key}`, String(newValue));
  };

  return [val, updateVal, mounted] as const;
}

export default function SettingsPage() {
  const { handleSignOut } = useUserSession();
  const { resolvedTheme, setTheme } = useTheme();
  const { locale, setLocale } = useLanguage();
  const { plan } = usePlanAccess();
  const t = contentSettingsLocal[locale];
  const router = useRouter();

  const [emailNotif, setEmailNotif, emailMounted] = useLocalSetting("email_notif", true);
  const [taskReminder, setTaskReminder, taskMounted] = useLocalSetting("task_reminder", true);
  const [mealReminder, setMealReminder, mealMounted] = useLocalSetting("meal_reminder", false);
  const [moneyReminder, setMoneyReminder, moneyMounted] = useLocalSetting("money_reminder", true);
  const [compactCards, setCompactCards, compactMounted] = useLocalSetting("compact_cards", false);

  const mounted = useHasMounted();

  const isDark = resolvedTheme === "dark";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-6">
      <section className="overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl dark:border-white/10 dark:bg-[#08111f]/90 sm:rounded-4xl sm:p-6">
        <div className="mb-6">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            {t.heroTag}
          </div>
          <h1 className="text-3xl font-black text-foreground dark:text-white sm:text-4xl">{t.pageTitle}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground dark:text-slate-400">{t.heroDesc}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-5">
          <div className="rounded-[1.75rem] border border-border bg-muted/30 p-5 dark:border-white/10 dark:bg-white/4">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-2xl border border-emerald-300/15 bg-emerald-400/10 p-3 text-emerald-700 dark:text-emerald-200">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground dark:text-white sm:text-xl">{t.plan}</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground dark:text-slate-400 sm:text-sm">{t.planDesc}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-border bg-muted/50 px-4 py-3 dark:border-white/10 dark:bg-[#07111f]/75">
                <div className="text-xs text-muted-foreground dark:text-slate-400">{t.currentPlan}</div>
                <div className="mt-1 text-lg font-bold text-foreground dark:text-white">{plan?.label ?? "..."}</div>
                {plan?.isTrialActive && (
                  <div className="mt-2 inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-100">
                    {t.trialDaysLeft}: {plan.trialDaysRemaining}
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-muted/50 px-4 py-3 dark:border-white/10 dark:bg-[#07111f]/75">
                  <div className="text-xs text-muted-foreground dark:text-slate-400">{t.sharedAccess}</div>
                  <div className="mt-1 text-sm font-semibold text-foreground dark:text-white">{plan?.hasSharedFeatures ? t.enabled : t.locked}</div>
                </div>
                <div className="rounded-2xl border border-border bg-muted/50 px-4 py-3 dark:border-white/10 dark:bg-[#07111f]/75">
                  <div className="text-xs text-muted-foreground dark:text-slate-400">{t.linksLimit}</div>
                  <div className="mt-1 text-sm font-semibold text-foreground dark:text-white">
                    {plan?.savedLinksLimit ?? t.unlimited}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-muted/50 px-4 py-3 dark:border-white/10 dark:bg-[#07111f]/75">
                  <div className="text-xs text-muted-foreground dark:text-slate-400">{t.moneyWindow}</div>
                  <div className="mt-1 text-sm font-semibold text-foreground dark:text-white">
                    {plan?.moneyHistoryMonths ? `${plan.moneyHistoryMonths} ${t.months}` : t.unlimited}
                  </div>
                </div>
              </div>

              {/* Upgrade / Manage Plan CTA */}
              {plan && (
                <div className="mt-3">
                  {plan.isPaidPro ? (
                    <button
                      onClick={() => router.push("/settings/billing")}
                      className="w-full rounded-2xl border border-cyan-300/30 bg-cyan-50/60 px-4 py-2.5 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100/60 dark:border-cyan-400/15 dark:bg-cyan-400/5 dark:text-cyan-300 dark:hover:bg-cyan-400/10"
                    >
                      {locale === "id" ? "Kelola Paket" : "Manage Plan"}
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push("/settings/billing")}
                      className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-cyan-500"
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        {locale === "id" ? "Upgrade ke Pro" : "Upgrade to Pro"}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notifications Section */}
          <div className="rounded-[1.75rem] border border-border bg-muted/30 p-5 dark:border-white/10 dark:bg-white/4">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/10 p-3 text-cyan-700 dark:text-cyan-200">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground dark:text-white sm:text-xl">{t.notif}</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground dark:text-slate-400 sm:text-sm">{t.notifDesc}</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: t.emailNotif, checked: emailNotif, onCheckedChange: setEmailNotif, mounted: emailMounted },
                { label: t.taskNotif, checked: taskReminder, onCheckedChange: setTaskReminder, mounted: taskMounted },
                { label: t.mealNotif, checked: mealReminder, onCheckedChange: setMealReminder, mounted: mealMounted },
                { label: t.moneyNotif, checked: moneyReminder, onCheckedChange: setMoneyReminder, mounted: moneyMounted },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-2xl border border-border bg-muted/50 px-4 py-3 dark:border-white/10 dark:bg-[#07111f]/75">
                  <span className="pr-4 text-sm font-medium text-foreground dark:text-slate-200">{item.label}</span>
                  {item.mounted ? <Switch checked={item.checked} onCheckedChange={item.onCheckedChange} /> : <div className="h-5 w-9 rounded-full bg-muted dark:bg-white/10" />}
                </div>
              ))}
            </div>
          </div>

            {/* Partner Sharing Section */}
            <PartnerSection locale={locale} />
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Appearance */}
            <div className="rounded-[1.75rem] border border-border bg-muted/30 p-5 dark:border-white/10 dark:bg-white/4">
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-2xl border border-violet-300/15 bg-violet-400/10 p-3 text-violet-700 dark:text-violet-200">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground dark:text-white sm:text-xl">{t.appearance}</h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground dark:text-slate-400 sm:text-sm">{t.appearanceDesc}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/50 px-4 py-3 dark:border-white/10 dark:bg-[#07111f]/75">
                  <span className="pr-4 text-sm font-medium text-foreground dark:text-slate-200">{t.darkMode}</span>
                  {mounted ? <Switch checked={isDark} onCheckedChange={(c) => setTheme(c ? "dark" : "light")} /> : <div className="h-5 w-9 rounded-full bg-muted dark:bg-white/10" />}
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/50 px-4 py-3 dark:border-white/10 dark:bg-[#07111f]/75">
                  <span className="pr-4 text-sm font-medium text-foreground dark:text-slate-200">{t.compactCards}</span>
                  {compactMounted ? <Switch checked={compactCards} onCheckedChange={setCompactCards} /> : <div className="h-5 w-9 rounded-full bg-muted dark:bg-white/10" />}
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/50 px-4 py-3 dark:border-white/10 dark:bg-[#07111f]/75">
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-muted-foreground dark:text-slate-400" />
                    <span className="text-sm font-medium text-foreground dark:text-slate-200">{t.language}</span>
                  </div>

                  {mounted ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setLocale("id")}
                        className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
                          locale === "id" ? "bg-cyan-400/15 text-cyan-700 dark:text-cyan-100" : "text-muted-foreground hover:bg-muted dark:text-slate-400 dark:hover:bg-white/5"
                        }`}
                      >
                        ID
                      </button>
                      <button
                        onClick={() => setLocale("en")}
                        className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
                          locale === "en" ? "bg-cyan-400/15 text-cyan-700 dark:text-cyan-100" : "text-muted-foreground hover:bg-muted dark:text-slate-400 dark:hover:bg-white/5"
                        }`}
                      >
                        EN
                      </button>
                    </div>
                  ) : (
                    <div className="h-6 w-16 rounded bg-muted dark:bg-white/10" />
                  )}
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="rounded-[1.75rem] border border-border bg-muted/30 p-5 dark:border-white/10 dark:bg-white/4">
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-2xl border border-amber-300/15 bg-amber-400/10 p-3 text-amber-700 dark:text-amber-200">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground dark:text-white sm:text-lg">{t.security}</h2>
                  <p className="mt-1 text-xs text-muted-foreground dark:text-slate-400">{t.securityDesc}</p>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <div className="rounded-2xl border border-border bg-muted/50 p-3 dark:border-white/10 dark:bg-[#07111f]/75">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="rounded-xl border border-amber-300/15 bg-amber-400/10 p-2 text-amber-700 dark:text-amber-200">
                      <LockKeyhole className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground dark:text-slate-100">{t.changePassword}</h3>
                      <p className="mt-1 text-xs text-muted-foreground dark:text-slate-400">{t.changePasswordHint}</p>
                    </div>
                  </div>

                  <ChangePasswordDialog locale={locale} />
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="rounded-[1.75rem] border border-border bg-muted/30 p-5 dark:border-white/10 dark:bg-white/4">
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-2xl border border-rose-300/15 bg-rose-400/10 p-3 text-rose-700 dark:text-rose-200">
                  <LogOut className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground dark:text-white sm:text-lg">{t.accountActions}</h2>
                  <p className="mt-1 text-xs text-muted-foreground dark:text-slate-400">{t.accountDesc}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <Button type="button" onClick={handleSignOut} className="h-12 w-full justify-start rounded-2xl border border-rose-300/20 bg-rose-500/10 text-sm text-rose-700 hover:bg-rose-500/15 dark:text-rose-200">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t.logOut}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
