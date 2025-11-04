import { Member } from "@/types/typeData";
import TaskCard from "./taskCard";

export default function MemberHolyCard({ member }: { member: Member }) {
  return (

    
    <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
      {member.tasks.map((task, i) => (
        <TaskCard key={`${member.name}-${task.label}-${i}`} task={task} member={member} />
      ))}
    </div>
  );
}
