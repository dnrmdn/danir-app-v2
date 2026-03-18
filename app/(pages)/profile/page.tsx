"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Camera, Mail, Save, User2 } from "lucide-react";
import { useUserSession } from "@/hooks/useUserSession";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user } = useUserSession();

  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(() =>
    user?.email ? user.email.split("@")[0].replace(/[^a-zA-Z0-9._]/g, "") : "asep"
  );
  const [bio, setBio] = useState("Building calm systems, collecting useful links, and keeping life neat.");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("Indonesia");

  const initials = useMemo(
    () =>
      (user?.name ?? "Asep")
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    [user?.name]
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-6">
      <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#08111f]/90 p-4 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="relative mx-auto mb-4 h-40 w-40 overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-300/20 via-sky-300/10 to-emerald-300/20 shadow-lg shadow-cyan-950/20">
              {user?.avatar ? (
                <Image src={user.avatar} alt={user.name} fill unoptimized referrerPolicy="no-referrer" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl font-black text-white">{initials}</div>
              )}
            </div>

            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-black text-white">{name || user?.name || "Asep"}</h2>
              <p className="text-sm text-slate-400">@{username || "asep"}</p>
              <p className="text-sm text-slate-300">{bio}</p>
            </div>

            <div className="mt-5 rounded-2xl border border-cyan-300/10 bg-cyan-400/5 p-4 text-sm text-slate-300">
              <div className="mb-2 flex items-center gap-2 font-semibold text-cyan-100">
                <Mail className="h-4 w-4" />
                Account email
              </div>
              <p className="break-all text-slate-400">{user?.email ?? "No email"}</p>
            </div>

            <Button type="button" variant="outline" className="mt-4 w-full rounded-2xl border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]">
              <Camera className="mr-2 h-4 w-4" />
              Change avatar
            </Button>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-5">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                <User2 className="h-3.5 w-3.5" />
                Public profile
              </div>
              <h1 className="text-2xl font-black text-white sm:text-3xl">Profile settings</h1>
              <p className="mt-1.5 text-xs leading-5 text-slate-400 sm:mt-2 sm:text-sm">Rapihin identitas akun Asep biar tampilan profilnya clean dan personal.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-1">
                <label className="text-sm font-semibold text-slate-200">Display name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-2xl border-white/10 bg-[#07111f]/80 text-white" />
              </div>
              <div className="space-y-2 md:col-span-1">
                <label className="text-sm font-semibold text-slate-200">Username</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} className="h-12 rounded-2xl border-white/10 bg-[#07111f]/80 text-white" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-200">Bio</label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-28 rounded-2xl border-white/10 bg-[#07111f]/80 text-white" />
              </div>
              <div className="space-y-2 md:col-span-1">
                <label className="text-sm font-semibold text-slate-200">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+62..." className="h-12 rounded-2xl border-white/10 bg-[#07111f]/80 text-white" />
              </div>
              <div className="space-y-2 md:col-span-1">
                <label className="text-sm font-semibold text-slate-200">Location</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-12 rounded-2xl border-white/10 bg-[#07111f]/80 text-white" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-200">Email</label>
                <Input value={user?.email ?? ""} disabled className="h-12 rounded-2xl border-white/10 bg-white/[0.03] text-slate-400" />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="button" className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-5 py-2.5 font-semibold text-cyan-100 hover:bg-cyan-400/15">
                <Save className="mr-2 h-4 w-4" />
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
