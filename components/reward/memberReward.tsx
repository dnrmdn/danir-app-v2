import { useEffect, useRef } from "react";
import { Card } from "../ui/card";
import { useMemberStore } from "@/lib/store/member-store";
import HeaderReward from "./header";

export default function MemberReward() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { members, isLoading, fetchMembers } = useMemberStore();

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  if (isLoading) return <div className="p-4">Loading members...</div>;
  if (!members || members.length === 0) return <div className="p-4">No member provided</div>;

  return (
    <div className="relative">
      <div ref={containerRef} tabIndex={0} className="overflow-x-auto pb-2 scroll-smooth hide-scrollbar snap-x snap-mandatory" style={{ scrollBehavior: "smooth" }}>
        <div className="flex gap-6 py-4 flex-nowrap">
          {members.map((person) => (
            <Card
              key={person.id}
              className={`flex flex-col rounded-3xl ${person.bgColor} transition-all duration-300 snap-start`}
              style={{
                height: "200px",
                flex: "0 0 auto",
                width: "calc(100% / 1.1)",
                maxWidth: "400px",
              }}
            >
              <HeaderReward member={person} />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
