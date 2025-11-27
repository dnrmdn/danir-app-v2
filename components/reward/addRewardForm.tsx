"use client";

import { useState } from "react";
import { Star, Image as ImageIcon, Pencil } from "lucide-react";
import Image from "next/image";
import { useRewardStore } from "@/lib/store/reward-store";

export default function AddReward() {
  const { setRewardData, rewardData } = useRewardStore(); 
  // Pastikan di store ada setRewardData

  const [name, setName] = useState(rewardData.name || "");
  const [image, setImage] = useState<string | null>(rewardData.image || null);
  const [minStar, setMinStar] = useState(rewardData.minStar || 0);

  const updateStore = (updated: { name: string; image: string | null; minStar: number }) => {
    setRewardData(updated); // langsung push ke Zustand store
  };

  const handleImageUpload = (file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImage(result);
      updateStore({ name, image: result, minStar });
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (field: "name" | "minStar", value: string | number) => {
    const updated = {
      name: field === "name" ? (value as string) : name,
      image,
      minStar: field === "minStar" ? Number(value) : minStar,
    };

    if (field === "name") setName(value as string);
    if (field === "minStar") setMinStar(Number(value));

    updateStore(updated);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white/40 backdrop-blur-md rounded-2xl shadow-sm">
      {/* Reward Name */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Reward Name</label>
        <input
          type="text"
          placeholder="Input reward name..."
          className="mt-1 px-3 py-2 rounded-xl bg-white/70 focus:ring-2 focus:ring-blue-400 outline-none"
          value={name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>

      {/* Upload Image */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Reward Image</label>

        <div className="mt-2 flex items-center gap-3">
          <label className="cursor-pointer">
            <div className="w-24 h-24 bg-white/70 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-white transition">
              {image ? (
                <Image
                  src={image}
                  alt="reward"
                  width={200}
                  height={200}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <ImageIcon size={32} className="text-gray-500" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files?.[0] ?? null)}
            />
          </label>

          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition">
            <Pencil size={16} />
            Change
          </button>
        </div>
      </div>

      {/* Minimum Star Requirement */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Minimum Star Required</label>

        <div className="flex items-center gap-2 mt-1">
          <Star size={22} className="text-yellow-500" fill="#eab308" />
          <input
            type="number"
            min={0}
            placeholder="0"
            className="px-3 py-2 w-32 rounded-xl bg-white/70 focus:ring-2 focus:ring-blue-400 outline-none"
            value={minStar}
            onChange={(e) => handleChange("minStar", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
