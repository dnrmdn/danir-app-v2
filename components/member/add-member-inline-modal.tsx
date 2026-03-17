"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useMemberStore } from "@/lib/store/member-store";

const COLORS = [
  { index: 0, className: "bg-rose-500" },
  { index: 1, className: "bg-orange-500" },
  { index: 2, className: "bg-amber-500" },
  { index: 3, className: "bg-emerald-500" },
  { index: 4, className: "bg-cyan-500" },
  { index: 5, className: "bg-blue-500" },
  { index: 6, className: "bg-violet-500" },
  { index: 7, className: "bg-fuchsia-500" },
];

export default function AddMemberInlineModal({ isOpen, onClose, onCreated }: { isOpen: boolean; onClose: () => void; onCreated?: (memberId: number) => void }) {
  const addMember = useMemberStore((s) => s.addMember);
  const members = useMemberStore((s) => s.members);
  const isAdding = useMemberStore((s) => s.isAdding);

  const [name, setName] = useState("");
  const [colorIndex, setColorIndex] = useState<number>(4);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const beforeIds = new Set(members.map((m) => m.id));
    const success = await addMember({ name, colorIndex });
    if (!success) return;

    const updatedMembers = useMemberStore.getState().members;
    const created = updatedMembers.find((m) => !beforeIds.has(m.id));

    setName("");
    setColorIndex(4);
    onClose();
    if (created && onCreated) onCreated(created.id);
  };

  return (
    <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-[#0b1525] p-5 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Quick add</div>
            <h3 className="mt-1 text-2xl font-black">Add Member</h3>
          </div>
          <button onClick={onClose} className="group rounded-full border border-cyan-300/15 bg-cyan-400/10 p-2 text-cyan-100 transition hover:bg-cyan-400/15 active:scale-95">
            <X size={16} className="transition-transform duration-200 group-hover:rotate-12 group-active:rotate-90" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Member name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Danir"
              className="w-full rounded-2xl border border-white/10 bg-[#07111f]/80 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Choose color</label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((color) => (
                <button
                  key={color.index}
                  type="button"
                  onClick={() => setColorIndex(color.index)}
                  className={`h-10 w-10 rounded-full ${color.className} transition ${colorIndex === color.index ? "ring-4 ring-white/40" : "ring-2 ring-transparent"}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-200 hover:bg-white/10">Cancel</button>
          <button onClick={handleSubmit} disabled={isAdding} className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2.5 font-semibold text-cyan-100 hover:bg-cyan-400/15 disabled:opacity-50">
            {isAdding ? "Saving..." : "Add member"}
          </button>
        </div>
      </div>
    </div>
  );
}
