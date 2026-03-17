"use client"

import * as React from "react"
import {
  AudioWaveform,
  Calendar1,
  CheckCircle,
  Command,
  ForkKnifeIcon,
  GalleryVerticalEnd,
  Image,
  Link2,
  List,
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

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Calendar",
      url: "/calendar",
      icon: Calendar1,
      
    },
    {
      title: "Task",
      url: "/task",
      icon: CheckCircle,
    },
    {
      title: "Reward",
      url: "/reward",
      icon: Stars,
    },
    {
      title: "Meal",
      url: "/meal",
      icon: ForkKnifeIcon,
    },
    
    {
      title: "MoneyTracker",
      url: "/money",
      icon: Wallet,
    },
    {
      title: "Photos",
      url: "/photo",
      icon: Image,
    },
    {
      title: "Saved Links",
      url: "/saved-links",
      icon: Link2,
    },
    {
      title: "List",
      url: "/list",
      icon: List,
    },
  ],
  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: Frame,
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "#",
  //     icon: PieChart,
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: Map,
  //   },
  // ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

