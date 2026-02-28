"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { useMemberStore } from "@/lib/store/member-store";
import type { Member } from "@/types/typeData"; // 👉 pakai tipe yang sudah ada

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
    <div className="relative">
      <div ref={containerRef} tabIndex={0} className="overflow-x-auto pb-2 scroll-smooth hide-scrollbar snap-x snap-mandatory" style={{ scrollBehavior: "smooth" }}>
        <div className="flex gap-6 px-2 py-4 flex-nowrap">
          {members.map((member: Member) => (
            <Card
              key={member.id}
              className={`flex flex-col rounded-3xl ${member.bgColor ?? ""} transition-all duration-300 snap-start`}
              style={{
                height: "89vh",
                flex: "0 0 auto",
                width: "calc(100% / 1.1)",
                maxWidth: "400px",
              }}
            >
              {children(member)}
            </Card>
          ))}

          <div className="shrink-0 w-4 sm:w-10"></div>
        </div>
      </div>
    </div>
  );
}
