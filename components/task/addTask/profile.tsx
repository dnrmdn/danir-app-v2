"use client";
import { useState } from "react";
import FloatButton from "@/components/floatButton";
import { Member } from "@/types/typeData";
import { Plus, Users } from "lucide-react";
import AddProfile from "./addProfile";

type AddProfileProps = {
  members: Member[];
};

export default function Profile({ members }: AddProfileProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [openAdd, setOpenAdd] = useState(false);

  if (!members || members.length === 0) {
    return <p className="text-gray-500 italic px-4">No members found</p>;
  }

  // ✅ toggle select/deselect
  const toggleSelect = (name: string) => {
    setSelectedMembers(
      (prev) =>
        prev.includes(name)
          ? prev.filter((n) => n !== name) // hapus jika sudah ada
          : [...prev, name] // tambah jika belum ada
    );
  };

  return (
    <div className="bg-gray-100 rounded-lg py-3 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Users size={28} className="text-gray-600" />
        <p className="text-gray-700 text-xl font-medium">Profile</p>
      </div>

      {/* Looping member */}
      <div className="flex flex-wrap gap-3">
        {members.map((member, index) => {
          const isSelected = selectedMembers.includes(member.name);

          return (
            <div key={index} className={`flex flex-col items-center text-center gap-2 transition-all duration-300 cursor-pointer ${isSelected ? "scale-105" : "opacity-40 hover:opacity-100"}`} onClick={() => toggleSelect(member.name)}>
              <div
                className={`relative w-10 h-10 rounded-full flex items-center justify-center 
                ${member.taskColorDone} transition-all duration-300
                ${isSelected ? "border-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.7)]" : ""}`}
              >
                <p className="font-bold text-white text-md">{member.name?.[0] ?? "?"}</p>
              </div>
              <p className={`text-sm font-bold transition-all ${isSelected ? "text-gray-900" : "text-gray-500"}`}>{member.name}</p>
            </div>
          );
        })}

        {/* Add button */}
        <div className="flex flex-col items-center gap-2">
          <FloatButton floating={false} bgColor="bg-green-500" shadow={false} size="w-10 h-10" icon={<Plus color="white" size={20} />} onClick={() => setOpenAdd(true)} position="fixed" />
          <p className="text-sm font-bold text-gray-800">Add</p>
        </div>
      </div>

      {/* Modal AddProfile */}
      {openAdd && <AddProfile isOpen={openAdd} onClose={() => setOpenAdd(false)} />}
    </div>
  );
}
