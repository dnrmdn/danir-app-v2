"use client";
import { useState, useEffect } from "react";
import FloatButton from "@/components/floatButton";
import { Plus, Users } from "lucide-react";
import AddProfile from "./addProfile";
import { useMemberStore } from "@/lib/store/member-store";

export default function Profile({ onSelect }: { onSelect?: (ids: number[]) => void }) {
  const { members, isLoading } = useMemberStore();
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [openAdd, setOpenAdd] = useState(false);

  // 🔹 update parent setiap selectedMembers berubah
  useEffect(() => {
    onSelect?.(selectedMembers);
  }, [selectedMembers, onSelect]);

  if (isLoading) return <div className="p-4"> Loading members...</div>;
  const hasMembers = members && members.length > 0;

  const toggleSelect = (id: number) => {
    setSelectedMembers((prev) => (prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]));
  };

  return (
    <div className="bg-gray-100 rounded-lg py-3 px-4">
      <div className="flex items-center gap-3 mb-4">
        <Users size={28} className="text-gray-600" />
        <p className="text-gray-700 text-xl font-medium">Profile</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {hasMembers ? (
          members.map((member) => {
            const isSelected = selectedMembers.includes(member.id);

            return (
              <div key={member.id} className={`flex flex-col items-center text-center gap-2 transition-all duration-300 cursor-pointer ${isSelected ? "scale-105" : "opacity-40 hover:opacity-100"}`} onClick={() => toggleSelect(member.id)}>
                <div
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center 
                ${member.iconColor} transition-all duration-300
                ${isSelected ? "border-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.7)]" : ""}`}
                >
                  <p className="font-bold text-white text-md">{member.name?.[0] ?? "?"}</p>
                </div>
                <p className={`text-sm font-bold transition-all ${isSelected ? "text-gray-900" : "text-gray-500"}`}>{member.name}</p>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 italic px-4"></p>
        )}

        {/* ADD BUTTON SELALU ADA */}
        <div className="flex flex-col items-center gap-2">
          <FloatButton floating={false} bgColor="bg-green-500" shadow={false} size="w-10 h-10" icon={<Plus color="white" size={20} />} onClick={() => setOpenAdd(true)} position="fixed" />
          <p className="text-sm font-bold text-gray-800">Add</p>
        </div>
      </div>

      {openAdd && <AddProfile isOpen={openAdd} onClose={() => setOpenAdd(false)} />}
    </div>
  );
}
