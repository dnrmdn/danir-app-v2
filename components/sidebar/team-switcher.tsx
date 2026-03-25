"use client"

import Image from "next/image"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  workspace,
}: {
  workspace: {
    name: string
    plan: string
  }
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="h-auto rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-white hover:bg-white/[0.08]"
        >
          <div className="flex aspect-square size-10 items-center justify-center rounded-2xl overflow-hidden shadow-lg shadow-cyan-950/30">
            <Image 
              src="/app-icon.png" 
              alt="Danir App Icon" 
              width={40} 
              height={40} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-white">{workspace.name}</span>
            <span className="truncate text-xs text-slate-400">{workspace.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
