"use client";

import Reward from "@/components/reward/reward";
import AddButtonTask from "@/components/task/addTask/addButtonTask";

export default function CalenderPage() {
  return (
    <div className="relative">
      {/* FamilyCard di bawah */}
      <Reward />

      {/* FloatButton di atas */}
      <div className="fixed bottom-10 right-10 sm:bottom-10 rounded-full shadow-sm  sm:right-15 z-50 ">
        <AddButtonTask />
      </div>
    </div>
  );
}
