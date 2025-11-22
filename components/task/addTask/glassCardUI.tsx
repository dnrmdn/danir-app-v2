import { ReactNode } from "react";

export default function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative bg-white border border-white/30 shadow-2xl rounded-l-4xl p-6 ${className}`}
    >
      {children}
    </div>
  );
}
