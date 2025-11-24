import { Member } from "@/types/typeData";
import TodoProgressBar from "./progressBar";
import RewardsBar from "./rewardsBar";

type HeaderCardProps = {
  member: Member;
};

export default function HeaderCard({ member }: HeaderCardProps) {
  const total = member.tasks.length;
  const completedTasks = member.tasks.filter(t => t.completed);

  // Total star hanya dari task completed
  const totalStar = completedTasks.reduce((sum, t) => sum + (t.reward || 0), 0);

  const hasReward = totalStar > 0;

  return (
    <div className="flex items-center px-4 py-2">
      {/* Avatar */}
      <div
        className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full ${member.iconColor} flex items-center justify-center`}
      >
        <p className="font-bold text-white text-lg sm:text-xl">
          {member.name[0]}
        </p>
      </div>

      <div className="flex flex-col flex-1 ml-3">
        <p className="text-lg sm:text-xl font-semibold">{member.name}</p>

        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1">
            <TodoProgressBar
              completed={completedTasks.length}
              total={total}
              member={member}
            />
          </div>

          {hasReward && (
            <div className="h-6 flex items-center">
              <RewardsBar member={member} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

