import { Member } from "@/types/typeData";
import { Star } from "lucide-react";

type HeaderCardProps = {
  member: Member;
};

export default function HeaderReward({ member }: HeaderCardProps) {
  const completedTasks = member.tasks.filter((t) => t.completed);

  // Total star hanya dari task completed
  const totalStar = completedTasks.reduce((sum, t) => sum + (t.reward || 0), 0);

  const hasReward = totalStar > 0;

  return (
    <div className="flex items-center px-4 py-2">
      {/* Avatar */}
      <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full ${member.iconColor} flex items-center justify-center`}>
        <p className="font-bold text-white text-lg sm:text-xl">{member.name[0]}</p>
      </div>

      <div className="flex flex-col flex-1 ml-3">
        <p className="text-lg sm:text-xl font-semibold">{member.name}</p>

        {hasReward && (
          <div className="h-6 pt-1 flex items-center">
            <div className="relative w-full h-6">
              {/* Background */}
              <div className={`w-full h-full ${member.taskColor} rounded-full`} />
              {/* Teks tengah (ikon + angka) */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-700 font-medium text-sm select-none">
                <Star size={18} className="mr-1 text-yellow-500" fill="#eab308" />
                {totalStar}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
