import { Member } from "@/types/typeData";
import { PlusIcon, Users } from "lucide-react";

type AddProfileProps = {
  members: Member[];
};

export default function AddProfile({ members }: AddProfileProps) {
  if (!members || members.length === 0) {
    return <p className="text-gray-500 italic px-4">No members found</p>;
  }

  return (
    <div className="bg-gray-100 rounded-lg py-3 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Users size={28} className="text-gray-600" />
        <p className="text-gray-700 text-xl font-medium">Profile</p>
      </div>

      {/* Looping member */}
      <div className="flex flex-wrap gap-3">
        {members.map((member, index) => (
          <div key={index} className="flex flex-col items-center text-center gap-2">
            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center ${member.taskColorDone}`}>
              <p className="font-bold text-white text-md">{member.name?.[0] ?? "?"}</p>
            </div>
            <p className="text-gray-800 font-bold text-sm">{member.name}</p>
          </div>
        ))}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-500 rounded-full">
            <PlusIcon color="white" />
          </div>
          <p className="text-sm font-bold text-gray-800">Add</p>
        </div>
      </div>
    </div>
  );
}
