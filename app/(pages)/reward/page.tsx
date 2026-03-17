"use client";

import AddButtonReward from "@/components/reward/addButtonReward";
import MemberReward from "@/components/reward/memberReward";

export default function RewardPage() {
  return (
    <div className="relative">
      {/* FamilyCard di bawah */}
      <MemberReward />

      {/* FloatButton di atas */}
      <div className="fixed bottom-10 right-10 sm:bottom-10 rounded-full shadow-sm  sm:right-15 z-50 ">
        <AddButtonReward />
      </div>
    </div>
  );
}
