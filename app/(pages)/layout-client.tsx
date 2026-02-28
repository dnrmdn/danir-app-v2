"use client";

import Navbar from "@/components/navbar/navbar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full y-20">
        {/* Navbar sticky di atas */}
        <div className="sticky top-0 z-50 rounded-b-full shadow-sm">
          <Navbar />
        </div>
        <div className="px-1">{children}</div>
      </main>
    </SidebarProvider>
  );
}
