"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { gooeyToast as toast } from "goey-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Props = {
  locale: "id" | "en";
};

type PasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
  showLabel: string;
  hideLabel: string;
};

const content = {
  id: {
    button: "Ubah Password",
    title: "Ubah Password",
    desc: "Masukkan password lama lalu buat password baru.",
    currentPassword: "Password lama",
    newPassword: "Password baru",
    confirmPassword: "Konfirmasi password baru",
    save: "Simpan Password Baru",
    saving: "Menyimpan...",
    required: "Semua field wajib diisi",
    minLength: "Password baru minimal 8 karakter",
    mismatch: "Konfirmasi password tidak cocok",
    routeNotFound: "API change password belum ditemukan. Cek file route backend.",
    failed: "Gagal mengubah password",
    success: "Password berhasil diubah",
    show: "Tampilkan password",
    hide: "Sembunyikan password",
  },
  en: {
    button: "Change Password",
    title: "Change Password",
    desc: "Enter your current password and create a new one.",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    save: "Save New Password",
    saving: "Saving...",
    required: "All fields are required",
    minLength: "New password must be at least 8 characters",
    mismatch: "Password confirmation does not match",
    routeNotFound: "Change password API route was not found. Check your backend route file.",
    failed: "Failed to change password",
    success: "Password changed successfully",
    show: "Show password",
    hide: "Hide password",
  },
} as const;

function PasswordField({ value, onChange, placeholder, visible, onToggle, showLabel, hideLabel }: PasswordFieldProps) {
  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="pr-11" />
      <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground" aria-label={visible ? hideLabel : showLabel}>
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function ChangePasswordDialog({ locale }: Props) {
  const t = content[locale];

  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function resetForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  }

  async function handleSubmit() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t.required);
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t.minLength);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t.mismatch);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/setting/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      if (res.status === 404) {
        throw new Error(t.routeNotFound);
      }

      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");

      let data: { message?: string } | null = null;

      if (isJson) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || t.failed);
      }

      if (!res.ok) {
        throw new Error(data?.message || t.failed);
      }

      toast.success(data?.message || t.success);
      resetForm();
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.failed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="h-11 w-full justify-start rounded-2xl">
          <LockKeyhole className="mr-2 h-4 w-4" />
          {t.button}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.desc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <PasswordField value={currentPassword} onChange={setCurrentPassword} placeholder={t.currentPassword} visible={showCurrent} onToggle={() => setShowCurrent((v) => !v)} showLabel={t.show} hideLabel={t.hide} />

          <PasswordField value={newPassword} onChange={setNewPassword} placeholder={t.newPassword} visible={showNew} onToggle={() => setShowNew((v) => !v)} showLabel={t.show} hideLabel={t.hide} />

          <PasswordField value={confirmPassword} onChange={setConfirmPassword} placeholder={t.confirmPassword} visible={showConfirm} onToggle={() => setShowConfirm((v) => !v)} showLabel={t.show} hideLabel={t.hide} />

          <Button type="button" onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.saving}
              </>
            ) : (
              t.save
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
