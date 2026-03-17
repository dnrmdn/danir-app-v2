"use client";

import { LogOut, Settings2, UserCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useUserSession } from "@/hooks/useUserSession";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, session, handleSignOut } = useUserSession();

  if (!session || !user) {
    return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">Not signed in</div>;
  }

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-auto rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-white transition hover:bg-white/[0.08] data-[state=open]:bg-white/[0.1]"
            >
              <Avatar className="h-10 w-10 rounded-2xl border border-white/10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-sm font-bold text-slate-950">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-white">{user.name}</span>
                <span className="truncate text-xs text-slate-400">{user.email}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-2xl border border-white/10 bg-[#0b1525]/95 text-white backdrop-blur-xl" side={isMobile ? "bottom" : "right"} align="end" sideOffset={8}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-3 py-3 text-left text-sm">
                <Avatar className="h-10 w-10 rounded-2xl border border-white/10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-sm font-bold text-slate-950">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white">{user.name}</span>
                  <span className="truncate text-xs text-slate-400">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="rounded-xl text-slate-200 focus:bg-white/10 focus:text-white">
                <UserCircle2 />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl text-slate-200 focus:bg-white/10 focus:text-white">
                <Settings2 />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={handleSignOut} className="rounded-xl text-red-300 focus:bg-red-500/10 focus:text-red-200">
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
