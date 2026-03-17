"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSignInHandler } from "@/hooks/useSignInHandler";
import { Spinner } from "../ui/spinner";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const { email, password, setEmail, setPassword, loading, success, error, handleSubmit } = useSignInHandler();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-white/10 bg-white/6 text-white shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
        <CardHeader className="space-y-3 pb-2">
          <div className="inline-flex w-fit items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
            Welcome back
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-white">Log in to Danir App</CardTitle>
          <CardDescription className="text-sm leading-6 text-slate-300">
            Continue managing your plans, routines, money, and saved resources in one clean workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="space-y-5">
              <Field>
                <FieldLabel htmlFor="email" className="text-slate-200">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="nir@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500"
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-slate-200">Password</FieldLabel>
                  <a href="/forgot-password" className="ml-auto inline-block text-sm text-cyan-200 underline-offset-4 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500"
                />
              </Field>
              {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
              {success && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">Login successful! Redirecting...</div>}
              <Field className="space-y-3">
                <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-white font-semibold text-slate-950 hover:bg-slate-100">
                  {loading ? (
                    <>
                      <Spinner />
                      Logging in...
                    </>
                  ) : (
                    "Log in"
                  )}
                </Button>
                <Button variant="outline" type="button" className="h-12 w-full rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10">
                  Log in with Google
                </Button>
                <FieldDescription className="pt-2 text-center text-sm text-slate-400">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="font-semibold text-cyan-200 hover:text-white">
                    Create one
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
