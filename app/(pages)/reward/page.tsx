"use client";

import MemberReward from "@/components/reward/memberReward";
import Reward from "@/components/reward/reward";
import AddButtonTask from "@/components/task/addTask/addButtonTask";

export default function CalenderPage() {
  return (
    <div className="relative">
      <Reward/>
      {/* FamilyCard di bawah */}
      <MemberReward />

      {/* FloatButton di atas */}
      <div className="fixed bottom-10 right-10 sm:bottom-10 rounded-full shadow-sm  sm:right-15 z-50 ">
        <AddButtonTask />
      </div>
    </div>
  );
}
