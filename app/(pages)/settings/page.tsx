"use client";

import { useState } from "react";
import { Bell, LogOut, MoonStar, Palette, Shield, Sparkles, Trash2 } from "lucide-react";
import { useUserSession } from "@/hooks/useUserSession";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const { handleSignOut } = useUserSession();

  const [emailNotif, setEmailNotif] = useState(true);
  const [taskReminder, setTaskReminder] = useState(true);
  const [mealReminder, setMealReminder] = useState(false);
  const [moneyReminder, setMoneyReminder] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [compactCards, setCompactCards] = useState(false);
  const [privateProfile, setPrivateProfile] = useState(false);

  const settingSections = [
    {
      icon: Bell,
      title: "Notifications",
      description: "Atur reminder biar app-nya helpful tapi gak cerewet.",
      items: [
        { label: "Email notifications", checked: emailNotif, onCheckedChange: setEmailNotif },
        { label: "Task reminders", checked: taskReminder, onCheckedChange: setTaskReminder },
        { label: "Meal plan reminders", checked: mealReminder, onCheckedChange: setMealReminder },
        { label: "Money tracker reminders", checked: moneyReminder, onCheckedChange: setMoneyReminder },
      ],
    },
    {
      icon: Palette,
      title: "Appearance",
      description: "Bikin workspace Asep keliatan makin clean dan premium.",
      items: [
        { label: "Dark mode", checked: darkMode, onCheckedChange: setDarkMode },
        { label: "Compact cards", checked: compactCards, onCheckedChange: setCompactCards },
      ],
    },
    {
      icon: Shield,
      title: "Privacy",
      description: "Kontrol hal sensitif dan akses akun dari satu tempat.",
      items: [
        { label: "Private profile", checked: privateProfile, onCheckedChange: setPrivateProfile },
      ],
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-6">
      <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#08111f]/90 p-4 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
        <div className="mb-6">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Workspace controls
          </div>
          <h1 className="text-3xl font-black text-white sm:text-4xl">Settings</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">Semua preferensi penting Asep dikumpulin di sini biar gampang diatur.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {settingSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
                <div className="mb-4 flex items-start gap-3">
                  <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/10 p-3 text-cyan-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white sm:text-xl">{section.title}</h2>
                    <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">{section.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#07111f]/75 px-4 py-3">
                      <span className="pr-4 text-sm font-medium text-slate-200">{item.label}</span>
                      <Switch checked={item.checked} onCheckedChange={item.onCheckedChange} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-2xl border border-violet-300/15 bg-violet-400/10 p-3 text-violet-200">
                <MoonStar className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Account actions</h2>
                <p className="mt-1 text-sm text-slate-400">Aksi cepat buat keamanan akun dan sesi login.</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button type="button" variant="outline" className="h-12 w-full justify-start rounded-2xl border-white/10 bg-[#07111f]/75 text-slate-200 hover:bg-white/[0.08]">
                Change password
              </Button>
              <Button type="button" variant="outline" className="h-12 w-full justify-start rounded-2xl border-white/10 bg-[#07111f]/75 text-slate-200 hover:bg-white/[0.08]">
                Log out all devices
              </Button>
              <Button type="button" onClick={handleSignOut} className="h-12 w-full justify-start rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-rose-300/10 bg-rose-500/5 p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-2xl border border-rose-300/15 bg-rose-400/10 p-3 text-rose-200">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Danger zone</h2>
                <p className="mt-1 text-sm text-slate-400">Bagian ini sengaja dipisah biar gak kepencet iseng.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-300/10 bg-[#07111f]/75 p-4">
              <h3 className="text-sm font-semibold text-white">Delete account</h3>
              <p className="mt-1 text-sm text-slate-400">Hapus akun dan data personal secara permanen. Jangan dipencet kalau belum yakin banget.</p>
              <Button type="button" variant="outline" className="mt-4 rounded-2xl border-rose-300/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete account
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
