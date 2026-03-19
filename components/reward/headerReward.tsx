import { Member } from "@/types/domain";
import { Star } from "lucide-react";
import HeaderCard from "../shared/headerCard";

type HeaderCardProps = {
  member: Member;
};

export default function HeaderReward({ member }: HeaderCardProps) {
  const completedTasks = member.tasks.filter((t) => t.completed);

  const totalStar = completedTasks.reduce((sum, t) => sum + (t.reward || 0), 0);

  return (
    <HeaderCard member={member}>
      <div className="h-6 pt-1 flex items-center">
        <div className="relative w-full h-6">
          <div className={`w-full h-full ${member.taskColor} rounded-full`} />

          <div className="absolute inset-0 flex items-center justify-center text-gray-700 dark:text-gray-200 font-medium text-sm select-none">
            <Star size={18} className="mr-1 text-yellow-500 dark:text-yellow-400" fill="#eab308" />
            {totalStar}
          </div>
        </div>
      </div>
    </HeaderCard>
  );
}

