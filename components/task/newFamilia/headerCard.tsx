import { Member, Task } from "@/types/typeData";
import TodoProgressBar from "./progressBar";
import RewardsBar from "./rewardsBar";

type HeaderCardProps = {
  member: Member;
  task: Task
};

export default function HeaderCard({task, member }: HeaderCardProps) {
  const total = member.tasks.length;
  const completed = member.tasks.filter((t) => t.completed).length;
  const reward = { star: 12 }; // contoh
  const hasReward = reward.star !== null && reward.star !== undefined;

  return (
    <div className="flex items-center px-4 py-2">
      {/* Avatar */}
      <div
        className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full ${member.iconColor} flex items-center justify-center`}
      >
        <p className="font-bold text-white text-lg sm:text-xl">{member.name[0]}</p>
      </div>

      {/* Konten kanan */}
      <div className="flex flex-col flex-1 ml-3">
        {/* Nama */}
        <p className="text-lg sm:text-xl font-semibold">{member.name}</p>

        {/* Bar bawah (progress + rewards sejajar) */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1">
            <TodoProgressBar completed={completed} total={total} member={member} />
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
