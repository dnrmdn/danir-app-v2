import { Card } from "@/components/ui/card";
import HeaderCard from "./headerCard";
import TaskCard from "./taskCard";
import { Member } from "@/types/typeData";


export default function FamilyCard({ member }: { member: Member }) {

   if (!member) {
    return <div className="p-4">No member provided</div>;
  }


  return (
    <div className="px-4">
      <Card className="max-w-[400px] h-[90vh] bg-gray-500 rounded-4xl">
        <HeaderCard member={member} task={member.tasks}/>
        <div className="px-4 space-y-4">
          {member.tasks.map((task, i) => (
            <TaskCard key={`${member.name}-${task.label}-${i}`} task={task} member={member} />
          ))}
        </div>
      </Card>
    </div>
  );
}
