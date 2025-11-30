"use client";

import { usePathname, useRouter } from "next/navigation";
import { ComponentType, SVGProps } from "react";

export type NavItem = {
  title: string;
  url: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function NavMain({ items }: { items: NavItem[] }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname.startsWith(item.url);

          return (
            <Collapsible key={item.title} asChild defaultOpen={isActive} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} onClick={() => router.push(item.url)} className={`transition-colors ${isActive ? "bg-primary/15 text-primary font-semibold rounded-lg" : ""}`}>
                    {item.icon && <item.icon className="!size-6" />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
