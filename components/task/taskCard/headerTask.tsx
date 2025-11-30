import { Member } from "@/types/typeData";
import TodoProgressBar from "../addTask/progressBar";
import RewardsBar from "../addTask/rewardsBar";
import HeaderCard from "@/components/shared/headerCard";

type HeaderTaskProps = {
  member: Member;
};

export default function HeaderTask({ member }: HeaderTaskProps) {
  const total = member.tasks.length;
  const completedTasks = member.tasks.filter((t) => t.completed);

  const totalStar = completedTasks.reduce((sum, t) => sum + (t.reward || 0), 0);

  const hasReward = totalStar > 0;

  return (
    <HeaderCard member={member}>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1">
          <TodoProgressBar completed={completedTasks.length} total={total} member={member} />
        </div>

        {hasReward && (
          <div className="h-6 flex items-center">
            <RewardsBar member={member} />
          </div>
        )}
      </div>
    </HeaderCard>
  );
}
