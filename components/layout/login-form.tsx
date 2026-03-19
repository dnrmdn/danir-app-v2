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
import { useSignInHandler } from "@/hooks/useSignInHandler";
import { Spinner } from "../ui/spinner";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const copy = {
  id: {
    badge: "Welcome back",
    title: "Masuk ke Danir App",
    description: "Masuk buat lanjut cek jadwal, task, uang, dan hal penting lainnya dari satu tempat yang rapi.",
    email: "Email",
    password: "Password",
    forgot: "Lupa password?",
    captcha: "Security check aktif buat bantu nahan brute-force login.",
    loggingIn: "Sedang masuk...",
    login: "Masuk",
    googleOff: "Google auth belum aktif. Isi env Google OAuth dulu ya.",
    noAccount: "Belum punya akun?",
    createOne: "Buat akun",
  },
  en: {
    badge: "Welcome back",
    title: "Log in to Danir App",
    description: "Log in to continue checking your schedule, tasks, money, and other important things from one clean place.",
    email: "Email",
    password: "Password",
    forgot: "Forgot password?",
    captcha: "Security check is active to help block brute-force login attempts.",
    loggingIn: "Logging in...",
    login: "Log in",
    googleOff: "Google auth is not active yet. Configure Google OAuth env first.",
    noAccount: "Don’t have an account?",
    createOne: "Create one",
  },
};

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const { email, password, setEmail, setPassword, loading, success, error, handleSubmit } = useSignInHandler();
  const { googleAuthEnabled, googleLoading, googleError, signInWithGoogle } = useGoogleAuth();
  const [captchaToken, setCaptchaToken] = useState("");
  const { locale } = useLanguage();
  const t = copy[locale];

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-border bg-card/80 text-foreground shadow-2xl shadow-cyan-950/10 backdrop-blur-xl dark:shadow-cyan-950/20">
        <CardHeader className="space-y-3 pb-2">
          <div className="inline-flex w-fit items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-200">
            {t.badge}
          </div>
          <CardTitle className="text-3xl font-black tracking-tight sm:text-[2rem]">{t.title}</CardTitle>
          <CardDescription className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleSubmit(e, { captchaToken })}>
            <FieldGroup className="space-y-5">
              <Field>
                <FieldLabel htmlFor="email" className="text-foreground">{t.email}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="danir@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-border bg-background/80 text-foreground placeholder:text-muted-foreground"
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-foreground">{t.password}</FieldLabel>
                  <a href="/forgot-password" className="ml-auto inline-block text-sm text-cyan-700 underline-offset-4 hover:underline dark:text-cyan-200">
                    {t.forgot}
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 border-border bg-background/80 text-foreground placeholder:text-muted-foreground"
                />
              </Field>
              <TurnstileWidget siteKey={TURNSTILE_SITE_KEY} onTokenChange={setCaptchaToken} />
              {TURNSTILE_SITE_KEY ? <FieldDescription className="text-xs leading-5 text-muted-foreground">{t.captcha}</FieldDescription> : null}
              {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
              {googleError && <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{googleError}</p>}
              {success && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">Login successful! Redirecting...</div>}
              <Field className="space-y-3">
                <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-foreground font-semibold text-background hover:opacity-90">
                  {loading ? (
                    <>
                      <Spinner />
                      {t.loggingIn}
                    </>
                  ) : (
                    t.login
                  )}
                </Button>
                <GoogleAuthButton mode="login" onClick={() => signInWithGoogle("/calendar")} disabled={googleLoading || !googleAuthEnabled} />
                {!googleAuthEnabled ? <FieldDescription className="text-center text-xs text-muted-foreground">{t.googleOff}</FieldDescription> : null}
                <FieldDescription className="pt-2 text-center text-sm text-muted-foreground">
                  {t.noAccount}{" "}
                  <Link href="/signup" className="font-semibold text-cyan-700 hover:text-foreground dark:text-cyan-200">
                    {t.createOne}
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
