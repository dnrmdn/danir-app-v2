"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import { useSession } from "@/lib/auth-client";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground dark:bg-[#020817] dark:text-white">
        <p className="text-sm text-muted-foreground dark:text-slate-300">Checking your session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground dark:bg-[#020817] dark:text-white">
        <p className="text-sm text-muted-foreground dark:text-slate-300">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground dark:bg-[#020817] dark:text-white">
      <Navbar />
      <main className="mx-auto w-full max-w-[1600px] px-4 pb-10 pt-6 sm:px-6 lg:px-10 xl:px-12">
        {children}
      </main>
    </div>
  );
}
