"use client";
import { useState, useEffect, useRef } from "react";
import FloatButton from "@/components/floatButton";
import { Plus, Users } from "lucide-react";
import AddProfile from "./addProfile";
import { useMemberStore } from "@/lib/store/member-store";

interface Member {
  id: number;
  name?: string;
  iconColor: string;
}

interface MemberStoreState {
  members: Member[];
  isLoading: boolean;
}

export default function Profile({ onSelect }: { onSelect?: (ids: number[]) => void }) {
  const { members, isLoading } = useMemberStore() as MemberStoreState;
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    onSelectRef.current?.(selectedMembers);
  }, [selectedMembers]);

  if (isLoading) return <div className="rounded-2xl border border-white/10 bg-[#07111f]/80 p-4 text-sm text-slate-400">Loading members...</div>;
  const hasMembers = members && members.length > 0;

  const toggleSelect = (id: number) => {
    setSelectedMembers((prev) => (prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]));
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#07111f]/80 px-4 py-4">
      <div className="mb-4 flex items-center gap-3">
        <Users size={22} className="text-slate-400" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Members</p>
          <p className="text-base font-semibold text-white">Assign this task</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {hasMembers ? (
          members.map((member) => {
            const isSelected = selectedMembers.includes(member.id);
            const firstName = member.name?.split(" ")[0] ?? "";
            const displayFirstName = firstName.length > 6 ? firstName.slice(0, 6) + "…" : firstName;

            return (
              <button
                key={member.id}
                type="button"
                title={member.name ?? "No Name"}
                className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-3 transition-all ${
                  isSelected
                    ? "border-cyan-300/20 bg-cyan-400/10 text-white"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
                onClick={() => toggleSelect(member.id)}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${member.iconColor}`}>
                  <p className="text-sm font-bold text-white">{member.name?.[0] ?? "?"}</p>
                </div>
                <p className="text-xs font-semibold">{displayFirstName}</p>
              </button>
            );
          })
        ) : (
          <p className="px-2 text-sm italic text-slate-500">No members found.</p>
        )}

        <div className="flex flex-col items-center gap-2">
          <FloatButton
            floating={false}
            bgColor="bg-cyan-500"
            shadow={false}
            size="w-10 h-10"
            icon={<Plus color="white" size={20} />}
            onClick={() => setOpenAdd(true)}
          />
          <p className="text-xs font-semibold text-slate-400">Add</p>
        </div>
      </div>

      {openAdd && <AddProfile isOpen={openAdd} onClose={() => setOpenAdd(false)} />}
    </div>
  );
}
