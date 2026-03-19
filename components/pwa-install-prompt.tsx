"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Share2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(display-mode: standalone)")?.matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone] = useState(() => isInStandaloneMode());

  const isIos = useMemo(() => isIosDevice(), []);
  const showIosTip = isIos && !isStandalone;

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
    // Gunakan array kosong jika tidak ada variabel luar yang dibutuhkan di dalam sini
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (isStandalone) return null;

  // Render untuk Android / Chrome Desktop
  if (deferredPrompt) {
    return (
      <div className="mt-6 inline-flex max-w-xl flex-col gap-3 rounded-3xl border border-emerald-500/20 bg-emerald-50 p-4 text-left text-sm text-emerald-900 shadow-sm backdrop-blur-md dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-50 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-300/15 dark:text-emerald-200">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-emerald-950 dark:text-white">Install Danir App</p>
            <p className="mt-1 text-emerald-800/80 dark:text-emerald-100/80 text-[11px] sm:text-xs">Buka langsung dari home screen biar rasanya kayak app beneran.</p>
          </div>
        </div>
        <Button type="button" onClick={handleInstall} className="rounded-2xl bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700 dark:bg-white dark:text-slate-950 dark:hover:bg-emerald-50">
          Install app
        </Button>
      </div>
    );
  }

  // Render untuk iOS (Safari)
  if (showIosTip) {
    return (
      <div className="mt-6 inline-flex max-w-xl items-start gap-3 rounded-3xl border border-cyan-500/20 bg-cyan-50 p-4 text-left text-sm text-cyan-900 shadow-sm backdrop-blur-md dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-50">
        <div className="rounded-2xl bg-cyan-100 p-2 text-cyan-700 dark:bg-cyan-300/15 dark:text-cyan-200">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="max-w-xs sm:max-w-sm">
          <p className="text-sm font-bold text-cyan-950 dark:text-white sm:text-base">Install di iPhone</p>
          <p className="mt-1 text-[11px] leading-relaxed text-cyan-800/80 dark:text-cyan-100/70 sm:text-xs">
            Buka di Safari, tap{" "}
            <span className="inline-flex items-center gap-1 font-bold text-cyan-950 dark:text-white">
              <Share2 className="h-3 w-3" /> Share
            </span>
            , lalu pilih <span className="font-bold text-cyan-950 dark:text-white">Add to Home Screen</span>.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
