"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, LogOut, ChevronRight, Shield } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const adminNavItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
    exact: false,
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    exact: false,
  },
];

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground dark:bg-[#020817] dark:text-white flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col border-r border-border dark:border-white/10 bg-card dark:bg-[#040d1a]">
        {/* Sidebar Header */}
        <div className="px-5 py-5 border-b border-border dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 dark:bg-cyan-400/20">
              <Shield className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground dark:text-white leading-none">
                Admin Panel
              </p>
              <p className="text-[11px] text-muted-foreground dark:text-slate-500 mt-0.5">
                Danir App
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminNavItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-cyan-100 text-cyan-900 dark:bg-cyan-400/15 dark:text-cyan-200"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
                }`}
              >
                <Icon
                  className={`h-4 w-4 flex-shrink-0 ${
                    isActive
                      ? "text-cyan-700 dark:text-cyan-300"
                      : "text-muted-foreground dark:text-slate-500 group-hover:text-foreground dark:group-hover:text-slate-300"
                  }`}
                />
                {item.label}
                {isActive && (
                  <ChevronRight className="ml-auto h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-3 py-4 border-t border-border dark:border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200 transition-all mb-1"
          >
            ← Back to App
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b border-border dark:border-white/10 bg-card/95 dark:bg-[#040d1a]/95 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-sm font-semibold dark:text-white">Admin Panel</span>
        </div>
        <nav className="flex items-center gap-1">
          {adminNavItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-cyan-100 text-cyan-900 dark:bg-cyan-400/15 dark:text-cyan-200"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground dark:text-slate-400 dark:hover:bg-white/5"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 lg:overflow-auto">
        <div className="pt-[60px] lg:pt-0 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
