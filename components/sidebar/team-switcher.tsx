"use client"

import { Sparkles } from "lucide-react"
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
          <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-950/30">
            <Sparkles className="size-5" />
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
