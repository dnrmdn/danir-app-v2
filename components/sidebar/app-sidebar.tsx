"use client"

import * as React from "react"
import {
  Calendar1,
  CheckCircle,
  ForkKnifeIcon,
  Image,
  Link2,
  List,
  Sparkles,
  Stars,
  Wallet,
} from "lucide-react"

import { NavMain } from "@/components/sidebar/nav-main"
import { NavUser } from "@/components/sidebar/nav-user"
import { TeamSwitcher } from "@/components/sidebar/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  workspace: {
    name: "Danir App",
    plan: "Personal Super App",
  },
  navMain: [
    { title: "Calendar", url: "/calendar", icon: Calendar1, description: "Plans & events" },
    // { title: "Task", url: "/task", icon: CheckCircle, description: "Daily focus" },
    // { title: "Reward", url: "/reward", icon: Stars, description: "Motivation" },
    { title: "Meal", url: "/meal", icon: ForkKnifeIcon, description: "Weekly meals" },
    { title: "Money", url: "/money", icon: Wallet, description: "Finance tracker" },
    // { title: "Photos", url: "/photo", icon: Image, description: "Visual memory" },
    { title: "Saved Links", url: "/saved-links", icon: Link2, description: "Knowledge vault" },
    { title: "List", url: "/list", icon: List, description: "Quick notes" },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-white/10 bg-[#040b17]/95 backdrop-blur-xl"
      {...props}
    >
      <SidebarHeader className="border-b border-white/10 px-3 py-4">
        <TeamSwitcher workspace={data.workspace} />
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <div className="mb-4 rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/10 via-white/5 to-emerald-400/10 p-4 text-white">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Internal workspace
          </div>
          <p className="text-sm font-semibold">Everything in one flow</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">
            Navigate your calendar, tasks, money, rewards, meals, and saved resources from one place.
          </p>
        </div>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="border-t border-white/10 px-3 py-4">
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
