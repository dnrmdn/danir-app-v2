"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Mail, Save, User2, Loader2 } from "lucide-react";
import { useUserSession } from "@/hooks/useUserSession";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { gooeyToast as toast } from "goey-toast";

const contentProfileLocal = {
  id: {
    pageTitle: "Pengaturan profil",
    heroDesc: "Rapikan identitas akun Anda agar tampilan profil lebih rapi dan personal.",
    publicProfile: "Profil publik",
    accountEmail: "Email Akun",
    noEmail: "Belum ada email",
    changeAvatar: "Ganti avatar",
    displayName: "Nama tampilan",
    username: "Username",
    bio: "Bio",
    phone: "Telepon",
    location: "Lokasi",
    email: "Email",
    saveChanges: "Simpan perubahan",
    fetchFailed: "Gagal mengambil data profil",
    saveFailed: "Gagal menyimpan perubahan. Username mungkin sudah terpakai.",
    saveSuccess: "Perubahan berhasil disimpan",
    avatarUploadSuccess: "Avatar berhasil diperbarui",
    avatarUploadFailed: "Gagal mengunggah avatar",
    invalidImage: "File harus berupa gambar",
    imageTooLarge: "Ukuran gambar maksimal 2MB",
  },
  en: {
    pageTitle: "Profile settings",
    heroDesc: "Tidy up your account identity to make your profile look clean and personal.",
    publicProfile: "Public profile",
    accountEmail: "Account email",
    noEmail: "No email yet",
    changeAvatar: "Change avatar",
    displayName: "Display name",
    username: "Username",
    bio: "Bio",
    phone: "Phone",
    location: "Location",
    email: "Email",
    saveChanges: "Save changes",
    fetchFailed: "Failed to fetch profile data",
    saveFailed: "Failed to save changes. Username might be taken.",
    saveSuccess: "Changes saved successfully",
    avatarUploadSuccess: "Avatar updated successfully",
    avatarUploadFailed: "Failed to upload avatar",
    invalidImage: "File must be an image",
    imageTooLarge: "Maximum image size is 2MB",
  },
};

type ProfileData = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  username: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
};

export default function ProfilePage() {
  const { user } = useUserSession();
  const { locale } = useLanguage();
  const t = contentProfileLocal[locale];

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);

      try {
        const res = await fetch("/api/user/profile", {
          method: "GET",
          cache: "no-store",
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          toast.error(json.error || t.fetchFailed);
          return;
        }

        const dt: ProfileData = json.data;

        setProfile(dt);
        setName(dt.name ?? "");
        setUsername(dt.username ?? "");
        setBio(dt.bio ?? "");
        setPhone(dt.phone ?? "");
        setLocation(dt.location ?? "");
      } catch (error) {
        console.error("fetch profile error:", error);
        toast.error(t.fetchFailed);
      } finally {
        setLoading(false);
      }
    }

    void fetchProfile();
  }, [locale, t.fetchFailed]);

  const initials = useMemo(() => {
    const source = name || profile?.name || user?.name || "A";
    return source
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [name, profile?.name, user?.name]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          bio,
          phone,
          location,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || t.saveFailed);
        return;
      }

      setProfile(json.data);
      setName(json.data.name ?? "");
      setUsername(json.data.username ?? "");
      setBio(json.data.bio ?? "");
      setPhone(json.data.phone ?? "");
      setLocation(json.data.location ?? "");

      toast.success(t.saveSuccess);
    } catch (error) {
      console.error("save profile error:", error);
      toast.error(t.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const handleChangeAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t.invalidImage);
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t.imageTooLarge);
      e.target.value = "";
      return;
    }

    try {
      setUploadingAvatar(true);

      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || t.avatarUploadFailed);
        return;
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              image: json.data.image,
            }
          : prev,
      );

      toast.success(t.avatarUploadSuccess);
    } catch (error) {
      console.error("avatar upload error:", error);
      toast.error(t.avatarUploadFailed);
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 pb-20 sm:space-y-6">
      <section className="overflow-hidden rounded-[1.5rem] border border-border bg-card p-4 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl dark:border-white/10 dark:bg-[#08111f]/90 sm:rounded-[2rem] sm:p-6">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-[1.75rem] border border-border bg-muted/30 p-5 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="relative mx-auto mb-4 h-40 w-40 overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-300/20 via-sky-300/10 to-emerald-300/20 shadow-lg shadow-cyan-950/20">
              {profile?.image ? (
                <Image src={profile.image} alt={profile?.name || "Profile"} fill unoptimized referrerPolicy="no-referrer" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl font-black text-white dark:text-cyan-100">{initials}</div>
              )}

              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} />

            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-black text-foreground dark:text-white">{name || profile?.name || "User"}</h2>
              <p className="text-sm text-muted-foreground dark:text-slate-400">@{username || "username"}</p>
              <p className="text-sm text-muted-foreground dark:text-slate-300">{bio || "-"}</p>
            </div>

            <div className="mt-5 rounded-2xl border border-cyan-300/10 bg-cyan-400/5 p-4 text-sm text-muted-foreground dark:text-slate-300">
              <div className="mb-2 flex items-center gap-2 font-semibold text-cyan-700 dark:text-cyan-100">
                <Mail className="h-4 w-4" />
                {t.accountEmail}
              </div>
              <p className="break-all">{profile?.email ?? user?.email ?? t.noEmail}</p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleChangeAvatar}
              disabled={uploadingAvatar}
              className="mt-4 w-full rounded-2xl border-border bg-muted/50 text-foreground hover:bg-muted dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
            >
              {uploadingAvatar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
              {t.changeAvatar}
            </Button>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-muted/30 p-5 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="mb-5">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">
                <User2 className="h-3.5 w-3.5" />
                {t.publicProfile}
              </div>
              <h1 className="text-2xl font-black text-foreground dark:text-white sm:text-3xl">{t.pageTitle}</h1>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground dark:text-slate-400 sm:mt-2 sm:text-sm">{t.heroDesc}</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground dark:text-slate-200">{t.displayName}</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-2xl border-border bg-muted/50 text-foreground dark:border-white/10 dark:bg-[#07111f]/80 dark:text-white" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground dark:text-slate-200">{t.username}</label>
                    <Input
                      value={username}
                      onChange={(e) =>
                        setUsername(
                          e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "")
                            .replace(/[^a-z0-9._]/g, ""),
                        )
                      }
                      className="h-12 rounded-2xl border-border bg-muted/50 text-foreground dark:border-white/10 dark:bg-[#07111f]/80 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-foreground dark:text-slate-200">{t.bio}</label>
                    <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[110px] rounded-2xl border-border bg-muted/50 text-foreground dark:border-white/10 dark:bg-[#07111f]/80 dark:text-white" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground dark:text-slate-200">{t.phone}</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+62..." className="h-12 rounded-2xl border-border bg-muted/50 text-foreground dark:border-white/10 dark:bg-[#07111f]/80 dark:text-white" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground dark:text-slate-200">{t.location}</label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-12 rounded-2xl border-border bg-muted/50 text-foreground dark:border-white/10 dark:bg-[#07111f]/80 dark:text-white" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-foreground dark:text-slate-200">{t.email}</label>
                    <Input value={profile?.email ?? user?.email ?? ""} disabled className="h-12 rounded-2xl border-border bg-muted/30 text-muted-foreground dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400" />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-5 py-2.5 font-semibold text-cyan-700 hover:bg-cyan-400/15 dark:text-cyan-100 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {t.saveChanges}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
