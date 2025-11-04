import { Member } from "@/types/typeData";
import TaskItem from "./taskItem";



export default function MemberCard({ member }: { member: Member }) {
  const completed = member.tasks.filter((t) => t.done).length;

  return (
    <div className={`rounded-3xl w-[410px] h-[90vh] shadow-sm border pt-4 pb-4 px-4 flex flex-col ${member.color}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold ${member.iconColor}`}>
          {member.name[0]}
        </div>
        <div>
          <h2 className="text-lg font-semibold">{member.name}</h2>
          <p className="text-sm text-gray-500">
            {completed}/{member.tasks.length} done
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
        {member.tasks.map((task, i) => (
          // kirim `member` juga ke TaskItem
          <TaskItem
            key={`${member.name}-${task.label}-${i}`} 
            task={task}
            member={member}
          />
        ))}
      </div>
    </div>
  );
}
