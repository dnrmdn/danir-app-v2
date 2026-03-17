"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Plus, X } from "lucide-react";
import { useRewardStore } from "@/lib/store/reward-store";
import { useMemberStore } from "@/lib/store/member-store";
import AddMemberInlineModal from "@/components/member/add-member-inline-modal";

export default function AddRewardForm({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addReward, resetRewardData } = useRewardStore();
  const members = useMemberStore((s) => s.members);
  const fetchMembers = useMemberStore((s) => s.fetchMembers);

  const [mounted, setMounted] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [minStars, setMinStars] = useState("0");
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && members.length === 0) {
      fetchMembers();
    }
  }, [isOpen, members.length, fetchMembers]);

  const toggleMember = (id: number) => {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const handleImageUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    if (memberIds.length === 0) return;

    setSaving(true);
    try {
      await Promise.all(
        memberIds.map((memberId) =>
          addReward({
            name,
            image,
            minStars: Number(minStars || 0),
            memberId,
          })
        )
      );
      resetRewardData();
      setName("");
      setImage(null);
      setMinStars("0");
      setMemberIds([]);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-xl" onClick={onClose}>
        <div
          className="relative z-[100000] flex max-h-[85vh] w-full max-w-2xl flex-col rounded-[2rem] border border-white/10 bg-[#08111f]/98 text-white shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 pt-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">Create</div>
              <h2 className="mt-1 text-3xl font-black">Add Reward</h2>
            </div>
            <button onClick={onClose} className="group rounded-full border border-violet-300/15 bg-violet-400/15 p-2 text-violet-50 transition hover:bg-violet-400/20 active:scale-95">
              <X size={18} className="transition-transform duration-200 group-hover:rotate-12 group-active:rotate-90" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Reward name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Movie night"
                  className="w-full rounded-2xl border border-white/10 bg-[#07111f]/80 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-slate-300">Assign members</label>
                  <button
                    type="button"
                    onClick={() => setShowAddMember(true)}
                    className="group inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/15 px-3 py-1.5 text-xs font-semibold text-violet-50 transition hover:bg-violet-400/20 active:scale-95"
                  >
                    <Plus size={14} className="transition-transform duration-200 group-hover:rotate-90 group-active:rotate-180" />
                    Add Member
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {members.map((member) => {
                    const active = memberIds.includes(member.id);
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleMember(member.id)}
                        className={`rounded-full border px-3 py-2 text-sm transition ${
                          active ? "border-violet-300/20 bg-violet-400/15 text-violet-50" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {member.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Minimum stars</label>
                  <input type="number" value={minStars} onFocus={() => minStars === "0" && setMinStars("")} onBlur={() => minStars.trim() === "" && setMinStars("0")} onChange={(e) => setMinStars(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#07111f]/80 px-4 py-3 text-white outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Image</label>
                  <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200 hover:bg-white/10">
                    Choose file
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              </div>

              {image && (
                <div className="relative h-32 w-32 overflow-hidden rounded-2xl border border-white/10">
                  <Image src={image} alt="Reward preview" fill unoptimized className="object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-white/10 bg-[#08111f]/98 px-6 py-4">
            <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-200 hover:bg-white/10">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="rounded-2xl border border-violet-300/20 bg-violet-400/15 px-4 py-2.5 font-semibold text-violet-50 hover:bg-violet-400/20 disabled:opacity-50">
              {saving ? "Saving..." : "Create reward"}
            </button>
          </div>
        </div>
      </div>

      <AddMemberInlineModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onCreated={(memberId) => setMemberIds((prev) => (prev.includes(memberId) ? prev : [...prev, memberId]))}
      />
    </>,
    document.body
  );
}
