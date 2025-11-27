import { useEffect, useRef } from "react";
import { Card } from "../ui/card";
import { useMemberStore } from "@/lib/store/member-store";
import HeaderReward from "./header";
import Redeem from "./redeem";
import { useShallow } from "zustand/react/shallow";
import { useRewardStore } from "@/lib/store/reward-store";

export default function MemberReward() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { members, isLoading } = useMemberStore();
  const rewards = useRewardStore((s) => s.rewards);
  
  const { fetchMembers } = useMemberStore(
    useShallow((s) => ({
      fetchMembers: s.fetchMembers,
    }))
  );

  const { fetchRewards } = useRewardStore(
    useShallow((s) => ({
      fetchRewards: s.fetchRewards,
    }))
  );

  useEffect(() => {
    fetchMembers();
    fetchRewards()
  }, [fetchMembers, fetchRewards]);

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
                height: "90vh",
                flex: "0 0 auto",
                width: "calc(100% / 1.1)",
                maxWidth: "400px",
              }}
            >
              <HeaderReward member={person} />
              <div className="px-4">
                {rewards
                .filter((r) => r.userId)
                .map((reward) => (
                  <Redeem reward={reward} key={reward.id} member={person} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
