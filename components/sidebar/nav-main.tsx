"use client";

import { usePathname, useRouter } from "next/navigation";
import { ComponentType, SVGProps } from "react";

export type NavItem = {
  title: string;
  url: string;
  description?: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function NavMain({ items }: { items: NavItem[] }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        Workspace modules
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1.5">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.url);

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={() => router.push(item.url)}
                className={`group h-auto min-h-14 rounded-2xl border px-3 py-3 transition-all ${
                  isActive
                    ? "border-cyan-300/25 bg-gradient-to-r from-cyan-400/15 to-emerald-400/10 text-white shadow-lg shadow-cyan-950/15"
                    : "border-transparent bg-white/[0.03] text-slate-300 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {item.icon && (
                  <div className={`flex size-9 items-center justify-center rounded-xl ${isActive ? "bg-white/10 text-cyan-200" : "bg-white/5 text-slate-400 group-hover:text-cyan-200"}`}>
                    <item.icon className="!size-5" />
                  </div>
                )}
                <div className="grid flex-1 text-left leading-tight">
                  <span className={`truncate text-sm font-semibold ${isActive ? "text-white" : "text-slate-200"}`}>{item.title}</span>
                  {item.description && <span className="truncate text-xs text-slate-500">{item.description}</span>}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
