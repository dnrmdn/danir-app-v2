"use client";

import { useState } from "react";
import Link from "next/link";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useSignUpHandler } from "@/hooks/useSignUpHandler";
import { Spinner } from "../ui/spinner";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const copy = {
  id: {
    badge: "Create workspace",
    title: "Mulai dengan Danir App",
    description: "Bikin satu tempat buat kalender, task, uang, reward, meal, dan link pentingmu.",
    name: "Nama lengkap",
    email: "Email",
    password: "Password",
    confirmPassword: "Konfirmasi password",
    passwordHint: "Pakai minimal 8 karakter biar workspace kamu tetap aman.",
    captcha: "Security check aktif buat nahan bot register otomatis.",
    creating: "Membuat akun...",
    createAccount: "Buat akun",
    googleOff: "Google auth belum aktif. Isi env Google OAuth dulu ya.",
    alreadyHave: "Sudah punya akun?",
    login: "Masuk",
    footer: "Dengan lanjut, kamu setuju buat bikin workflow lebih rapi dan jalan terus.",
  },
  en: {
    badge: "Create workspace",
    title: "Start with Danir App",
    description: "Build one place for your calendar, tasks, money, rewards, meals, and saved links.",
    name: "Full name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    passwordHint: "Use at least 8 characters so your workspace stays secure.",
    captcha: "Security check is active to help block automated signups.",
    creating: "Creating account...",
    createAccount: "Create account",
    googleOff: "Google auth is not active yet. Configure Google OAuth env first.",
    alreadyHave: "Already have an account?",
    login: "Log in",
    footer: "By continuing, you agree to keep your workflow tidy and your plans moving.",
  },
};

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const { name, email, password, confirmPassword, setName, setEmail, setPassword, setConfirmPassword, loading, success, error, handleSubmit } = useSignUpHandler();
  const { googleAuthEnabled, googleLoading, googleError, signInWithGoogle } = useGoogleAuth();
  const [captchaToken, setCaptchaToken] = useState("");
  const [website, setWebsite] = useState("");
  const { locale } = useLanguage();
  const t = copy[locale];

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-border bg-card/80 text-foreground shadow-2xl shadow-cyan-950/10 backdrop-blur-xl dark:shadow-cyan-950/20">
        <CardHeader className="space-y-3 pb-2">
          <div className="inline-flex w-fit items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-200">
            {t.badge}
          </div>
          <CardTitle className="text-3xl font-black tracking-tight">{t.title}</CardTitle>
          <CardDescription className="text-sm leading-6 text-muted-foreground">{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleSubmit(e, { captchaToken, honeyField: website })}>
            <FieldGroup className="space-y-5">
              <Field>
                <FieldLabel htmlFor="name" className="text-foreground">{t.name}</FieldLabel>
                <Input id="name" type="text" placeholder="Danir" value={name} onChange={(e) => setName(e.target.value)} required className="h-12 border-border bg-background/80 text-foreground placeholder:text-muted-foreground" />
              </Field>
              <Field>
                <FieldLabel htmlFor="email" className="text-foreground">{t.email}</FieldLabel>
                <Input id="email" type="email" placeholder="danir@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 border-border bg-background/80 text-foreground placeholder:text-muted-foreground" />
              </Field>
              <Field className="hidden" aria-hidden="true">
                <FieldLabel htmlFor="website">Website</FieldLabel>
                <Input id="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="password" className="text-foreground">{t.password}</FieldLabel>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 border-border bg-background/80 text-foreground placeholder:text-muted-foreground" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirm-password" className="text-foreground">{t.confirmPassword}</FieldLabel>
                  <Input id="confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="h-12 border-border bg-background/80 text-foreground placeholder:text-muted-foreground" />
                </Field>
              </div>
              <FieldDescription className="text-sm text-muted-foreground">{t.passwordHint}</FieldDescription>
              <TurnstileWidget siteKey={TURNSTILE_SITE_KEY} onTokenChange={setCaptchaToken} />
              {TURNSTILE_SITE_KEY ? <FieldDescription className="text-xs text-muted-foreground">{t.captcha}</FieldDescription> : null}
              {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
              {googleError && <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{googleError}</p>}
              {success && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">Signup successful! Redirecting...</div>}
              <Field className="space-y-3">
                <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-foreground font-semibold text-background hover:opacity-90">
                  {loading ? (
                    <>
                      <Spinner />
                      {t.creating}
                    </>
                  ) : t.createAccount}
                </Button>
                <GoogleAuthButton mode="signup" onClick={() => signInWithGoogle("/calendar")} disabled={googleLoading || !googleAuthEnabled} />
                {!googleAuthEnabled ? <FieldDescription className="text-center text-xs text-muted-foreground">{t.googleOff}</FieldDescription> : null}
                <FieldDescription className="pt-2 text-center text-sm text-muted-foreground">
                  {t.alreadyHave}{" "}
                  <Link href="/login" className="font-semibold text-cyan-700 hover:text-foreground dark:text-cyan-200">
                    {t.login}
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-3 text-center text-sm text-muted-foreground">{t.footer}</FieldDescription>
    </div>
  );
}
