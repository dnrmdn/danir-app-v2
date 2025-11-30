"use client";

import { useState } from "react";
import { LayoutDashboard, Grid, FolderKanban, CreditCard, ChartNoAxesCombined } from "lucide-react";

export default function MoneyTrackerNavbar() {
  const [active, setActive] = useState("map");
  const [hovering, setHovering] = useState<string | null>(null);

  const items = [
    { id: "map", label: "Dashboard", icon: LayoutDashboard },
    { id: "star", label: "Categories", icon: Grid },
    { id: "send", label: "Budgets", icon: FolderKanban },
    { id: "clock", label: "Accounts", icon: CreditCard },
    { id: "download", label: "Analytics", icon: ChartNoAxesCombined },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
      {/* Container with Floating Effect */}
      <div className="flex items-end justify-center gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          const isHovered = hovering === item.id;

          return (
            <div key={item.id} className="relative group">
              {/* Floating Button Container */}
              <button
                onClick={() => setActive(item.id)}
                onMouseEnter={() => setHovering(item.id)}
                onMouseLeave={() => setHovering(null)}
                className={`relative flex flex-col items-center gap-2 transition-all duration-300 ${isActive || isHovered ? "transform -translate-y-4" : "transform translate-y-0"}`}
              >
                {/* Shadow Blob */}
                <div className={`absolute -bottom-12 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/20 rounded-full blur-lg transition-all duration-300 ${isActive || isHovered ? "opacity-100" : "opacity-0"}`} />

                {/* Icon Button */}
                <div
                  className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300 shadow-lg ${
                    isActive ? "bg-linear-to-br from-cyan-400 to-teal-500 text-white scale-110" : isHovered ? "bg-emerald-500/30 text-cyan-400 border border-cyan-400/50" : "bg-white/10 text-slate-300 border border-white/20 backdrop-blur-sm"
                  }`}
                >
                  <Icon size={24} />
                </div>

                {/* Label */}
                <span className={`text-xs font-semibold transition-all duration-300 ${isActive ? "text-emerald-400 opacity-100" : "text-slate-400 opacity-0 group-hover:opacity-100"}`}>{item.label}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
