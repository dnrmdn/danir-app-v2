"use client";

import { useEffect, useMemo } from "react";
import { useRewardStore } from "@/lib/store/reward-store";
import HeaderReward from "./headerReward";
import Redeem from "./redeem";
import { Member } from "@/types/domain";

interface MemberRewardContentProps {
  member: Member;
}

export default function MemberRewardContent({ member } : MemberRewardContentProps) {
  const rewards = useRewardStore((s) => s.rewards);
  const fetchRewards = useRewardStore((s) => s.fetchRewards);

  // 🔥 Fetch reward ketika member berubah
  useEffect(() => {
    if (member?.id) fetchRewards(member.id);
  }, [member?.id, fetchRewards]);

  // 🔥 Filter supaya hanya reward milik member ini
  const filteredRewards = useMemo(
    () => rewards.filter((r) => r.memberId === member.id),
    [rewards, member.id]
  );

  return (
    <>
      <HeaderReward member={member} />

      <div className="px-4 pt-2 overflow-y-auto h-full rounded-[40px] space-y-4 no-scrollbar">
        {filteredRewards.length > 0 ? (
          filteredRewards.map((reward) => (
            <Redeem key={reward.id} reward={reward} member={member} />
          ))
        ) : (
          <p className="text-center text-gray-400 py-10">
            Belum ada reward untuk member ini
          </p>
        )}
      </div>
    </>
  );
}

