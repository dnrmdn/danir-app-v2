"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserSession } from "@/hooks/useUserSession";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2, Save, X, Plus, Folder } from "lucide-react";
import { SaveLinkDialog } from "@/components/dashboard/save-link-dialog";

export function HeroSection() {
  const [url, setUrl] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const { session } = useUserSession();
  const router = useRouter();

  const handleInitialSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    if (!session) {
      router.push("/login");
      return;
    }

    setShowDialog(true);
  };

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex items-center justify-center py-20">
      <SaveLinkDialog 
        open={showDialog} 
        onOpenChange={setShowDialog} 
        initialUrl={url} 
        onSuccess={() => setUrl("")} 
      />

      <div className="absolute inset-0 bg-gradient-to-br from-primary via-background to-secondary/20"></div>

      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl -ml-32 -mb-32"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50"></div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Accent badge */}
        <div className="inline-block mb-8 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
          <span className="text-sm font-semibold text-primary">Welcome to SnapKeep</span>
        </div>

        {/* Main heading - massive and bold */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-foreground mb-6 leading-tight text-balance">
          Save Your{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Links</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto text-balance leading-relaxed">
          The easiest way to organize and search your saved videos from Instagram, TikTok, and YouTube.
        </p>

        {/* Input Form Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <form onSubmit={handleInitialSave} className="relative flex items-center group">
            <div className="absolute left-4 text-muted-foreground group-focus-within:text-primary transition-colors">
              <Link2 size={24} />
            </div>
            <Input
              type="url"
              placeholder="Paste your video link here (Instagram, TikTok, YouTube...)"
              className="h-16 pl-14 pr-32 rounded-2xl border-2 border-primary/20 bg-background/50 backdrop-blur-md text-lg focus-visible:ring-primary focus-visible:border-primary transition-all shadow-xl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="absolute right-2 h-12 px-6 rounded-xl font-bold text-lg bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-transform shadow-lg"
            >
              <Save className="mr-2" size={20} />
              Save
            </Button>
          </form>
        </div>

        {/* CTA buttons - bold and prominent */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          {!session && (
            <Link href={"/login"}>
              <button className="px-10 py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105">
                Start Organizing Now
              </button>
            </Link>
          )}
          <Link href={"/saved-links"}>
            <button className="px-10 py-4 border-2 border-primary text-foreground rounded-xl font-bold text-lg hover:bg-primary/10 transition-colors duration-300 backdrop-blur-sm">
              View Saved Links
            </button>
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: "🔗", label: "Saved Links", href: "/saved-links" },
            { icon: "📅", label: "Calendar", href: "/calender" },
            { icon: "✅", label: "Tasks", href: "/task" },
            { icon: "🏆", label: "Rewards", href: "/reward" },
          ].map((feature, i) => (
            <Link
              key={i}
              href={feature.href}
              className="p-4 rounded-xl bg-card/40 backdrop-blur-sm border border-primary/10 hover:border-primary/40 hover:bg-card/60 transition-all group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{feature.icon}</div>
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{feature.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
