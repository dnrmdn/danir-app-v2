"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Share2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isIosDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

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
  }, [isIos]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (isStandalone) {
    return null;
  }

  if (deferredPrompt) {
    return (
      <div className="mt-6 inline-flex max-w-xl flex-col gap-3 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-left text-sm text-emerald-50 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-emerald-300/15 p-2 text-emerald-200">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-white">Install Danir App</p>
            <p className="mt-1 text-emerald-100/80">Buka langsung dari home screen biar rasanya kayak app beneran.</p>
          </div>
        </div>
        <Button type="button" onClick={handleInstall} className="rounded-2xl bg-white px-5 py-2 font-semibold text-slate-950 hover:bg-emerald-50">
          Install app
        </Button>
      </div>
    );
  }

  if (showIosTip) {
    return (
      <div className="mt-6 inline-flex max-w-xl items-start gap-3 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-left text-sm text-cyan-50 backdrop-blur-md">
        <div className="rounded-2xl bg-cyan-300/15 p-2 text-cyan-200">
          <Smartphone className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-white">Install di iPhone</p>
          <p className="mt-1 text-cyan-100/80">
            Buka di Safari, tap <span className="inline-flex items-center gap-1 font-semibold text-white"><Share2 className="h-4 w-4" /> Share</span>, lalu pilih <span className="font-semibold text-white">Add to Home Screen</span>.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
