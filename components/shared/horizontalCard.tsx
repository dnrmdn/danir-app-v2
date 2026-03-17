"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { useMemberStore } from "@/lib/store/member-store";
import type { Member } from "@/types/domain"; // 👉 pakai tipe yang sudah ada

type HorizontalCardsProps = {
  children: (member: Member) => React.ReactNode;
  autoFetch?: boolean;
};

export default function HorizontalCards({ children, autoFetch = true }: HorizontalCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { members, isLoading, fetchMembers } = useMemberStore();

  useEffect(() => {
    if (autoFetch) fetchMembers();
  }, [autoFetch, fetchMembers]);

  if (isLoading) return <div className="p-4">Loading members...</div>;
  if (!members || members.length === 0) return <div className="p-4">No member provided</div>;

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        tabIndex={0}
        className="w-full overflow-x-auto pb-2 scroll-smooth hide-scrollbar snap-x snap-mandatory"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="flex w-max min-w-full flex-nowrap gap-6 py-4 pr-0 items-stretch">
          {members.map((member: Member) => (
            <Card
              key={member.id}
              className={`flex min-h-[720px] shrink-0 flex-col rounded-[2rem] border border-white/10 ${member.bgColor ?? ""} snap-start transition-all duration-300`}
              style={{
                width: "clamp(280px, calc((100% - 72px) / 4), 360px)",
              }}
            >
              {children(member)}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

