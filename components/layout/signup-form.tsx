"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSignUpHandler } from "@/hooks/useSignUpHandler";
import { Spinner } from "../ui/spinner";

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const { name, email, password, confirmPassword, setName, setEmail, setPassword, setConfirmPassword, loading, success, error, handleSubmit } = useSignUpHandler();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-white/10 bg-white/6 text-white shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
        <CardHeader className="space-y-3 pb-2">
          <div className="inline-flex w-fit items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            Create workspace
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-white">Start with Danir App</CardTitle>
          <CardDescription className="text-sm leading-6 text-slate-300">
            Build one place for your calendar, tasks, money, rewards, meals, and saved links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="space-y-5">
              <Field>
                <FieldLabel htmlFor="name" className="text-slate-200">Full name</FieldLabel>
                <Input id="name" type="text" placeholder="Danir" value={name} onChange={(e) => setName(e.target.value)} required className="h-12 border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500" />
              </Field>
              <Field>
                <FieldLabel htmlFor="email" className="text-slate-200">Email</FieldLabel>
                <Input id="email" type="email" placeholder="nir@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="password" className="text-slate-200">Password</FieldLabel>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirm-password" className="text-slate-200">Confirm password</FieldLabel>
                  <Input id="confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="h-12 border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500" />
                </Field>
              </div>
              <FieldDescription className="text-sm text-slate-400">Use at least 8 characters so your workspace stays secure.</FieldDescription>
              {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
              {success && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">Signup successful! Redirecting...</div>}
              <Field className="space-y-3">
                <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-white font-semibold text-slate-950 hover:bg-slate-100">
                  {loading ? (
                    <>
                      <Spinner />
                      Creating account...
                    </>
                  ) : "Create account"}
                </Button>
                <FieldDescription className="pt-2 text-center text-sm text-slate-400">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-cyan-200 hover:text-white">
                    Log in
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-3 text-center text-sm text-slate-500">
        By continuing, you agree to keep your workflow tidy and your plans moving.
      </FieldDescription>
    </div>
  );
}
