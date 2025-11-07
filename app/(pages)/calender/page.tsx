"use client"

import AddButtonTask from "@/components/task/addTask/addButtonTask";
import { members } from "@/components/task/data/members";
import FamilyCard from "@/components/task/newFamilia/familyCard";

export default function CalenderPage() {
  const member = members[0];
  return (
    <div className="relative">
      {/* FamilyCard di bawah */}
      <FamilyCard member={member} />

      {/* FloatButton di atas */}
      <div className="fixed bottom-10 right-10 sm:bottom-10 rounded-full shadow-sm  sm:right-15 z-50 ">
        <AddButtonTask/>
      </div>
    </div>
  );
}
