import { Member } from "@/types/typeData";
import TodoProgressBar from "./progressBar";

type HeaderCardProps = {
  member: Member;
};

export default function HeaderCard({ member }: HeaderCardProps) {
  const total =  member.tasks.length;
  const completed = member.tasks.filter((t) => t.completed).length;
  const reward = { star: null };
  const hasReward = reward.star !== null && reward.star !== undefined;

  return (
    <div>
      <div className="flex px-4">
        <div
          className={`relative w-20 h-20 rounded-full ${member.iconColor} flex items-center justify-center`}
        >
          <p className="font-bold text-white text-3xl">{member.name[0]}</p>
        </div>
        <div className="w-72 h-16">
          <p className="text-2xl pl-2">{member.name}</p>
          {hasReward ? (
            <div className="flex p-2 justify-around">
              <div className="bg-blue-100 w-20 h-8 rounded-lg flex items-center justify-center">
                {reward.star}
              </div>
            </div>
          ) : (
            <div className="flex p-2">
              <TodoProgressBar completed={completed} total={total} member={member}/>
              {/* <div className={` w-full h-8 rounded-2xl flex items-center justify-center ${member.taskColor}`}>
                {completed}/{member.tasks.length}
              </div> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
