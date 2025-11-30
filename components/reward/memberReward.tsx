"use client";

import { useEffect } from "react";
import { useRewardStore } from "@/lib/store/reward-store";
import { useShallow } from "zustand/react/shallow";
import HeaderReward from "./headerReward";
import Redeem from "./redeem";
import HorizontalCards from "../shared/horizontalCard";

export default function MemberReward() {
  const rewards = useRewardStore((s) => s.rewards);

  const { fetchRewards } = useRewardStore(
    useShallow((s) => ({
      fetchRewards: s.fetchRewards,
    }))
  );

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  return (
    <HorizontalCards>
      {(member) => (
        <>
          <HeaderReward member={member} />

          <div className="px-4 overflow-y-auto h-full rounded-[40px] space-y-4 no-scrollbar">
            {rewards
              .filter((r) => r.memberId)
              .map((reward) => (
                <Redeem key={reward.id} reward={reward} member={member} />
              ))}
          </div>
        </>
      )}
    </HorizontalCards>
  );
}
