"use client";

import { Star, Image as ImageIcon, Pencil } from "lucide-react";
import Image from "next/image";
import { useRewardStore } from "@/lib/store/reward-store";
import AddFormCard from "../shared/addFormCard";
import Profile from "../task/addTask/profile";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";

export default function AddRewardForm({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { rewardData, setRewardData, addReward } = useRewardStore();
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const { data: session } = useSession();

  const handleSubmit = async () => {
    const userId = session?.user?.id;

    if (!userId) {
      alert("User belum login!");
      return;
    }

    if (!rewardData.name.trim()) {
      alert("Reward name required");
      return;
    }

    if (memberIds.length === 0) {
      alert("Pilih minimal satu member");
      return;
    }

    // ⬅ MULTI-USER INSERT seperti task
    for (const id of memberIds) {
      await addReward({
        name: rewardData.name,
        image: rewardData.image,
        minStars: rewardData.minStar,
        userId: Number(userId),
        memberId: id, // ⬅ tambahan: reward dikaitkan ke member
      });
    }

    onClose();
  };

  const handleChange = (field: "name" | "minStar", value: string | number) => {
    setRewardData({
      ...rewardData,
      [field]: field === "minStar" ? Number(value) : value,
    });
  };

  const handleImageUpload = (file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRewardData({
        ...rewardData,
        image: reader.result as string,
      });
    };

    reader.readAsDataURL(file);
  };

  return (
    <AddFormCard isOpen={isOpen} onClose={onClose} title="Add Reward" onSubmit={handleSubmit}>
      {/* Reward Name */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Reward Name</label>
        <input type="text" placeholder="Input reward name..." className="mt-1 px-3 py-2 rounded-xl bg-white/70 focus:ring-2 focus:ring-blue-400 outline-none" value={rewardData.name} onChange={(e) => handleChange("name", e.target.value)} />
      </div>

      {/* Member picker */}
      <Profile onSelect={(ids) => setMemberIds(ids)} />

      {/* Image Upload */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Reward Image</label>

        <div className="mt-2 flex-row items-center space-y-2">
          {/* Preview Image */}
          <div className="w-24 h-24 bg-white/70 rounded-xl border border-gray-300 flex items-center justify-center">
            {rewardData.image ? <Image src={rewardData.image} alt="reward" width={200} height={200} className="w-full h-full rounded-xl object-cover" /> : <ImageIcon size={32} className="text-gray-500" />}
          </div>

          {/* Hidden file input */}
          <input id="imageInput" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files?.[0] ?? null)} />

          {/* Trigger button */}
          <button onClick={() => document.getElementById("imageInput")?.click()} className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition">
            <Pencil size={16} />
            Insert Image
          </button>
        </div>
      </div>

      {/* Minimum Star */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Minimum Star Required</label>

        <div className="flex items-center gap-2 mt-1">
          <Star size={22} className="text-yellow-500" fill="#eab308" />
          <input type="number" className="px-3 py-2 w-full rounded-xl bg-white/70 focus:ring-2 focus:ring-blue-400 outline-none" value={rewardData.minStar} onChange={(e) => handleChange("minStar", e.target.value)} />
        </div>
      </div>
    </AddFormCard>
  );
}
