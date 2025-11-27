"use client";

import { useState } from "react";
import FloatButton from "@/components/floatButton";
import { Plus } from "lucide-react";
import AddReward from "@/components/reward/addRewardForm";

export default function AddButtonReward() {
  const [open, setOpen] = useState(false);

  // State untuk menampung data reward
  const [rewardData] = useState({
    name: "",
    image: null as string | null,
    minStar: 0,
  });

  return (
    <>
      {/* Floating Button */}
      <FloatButton floating={true} shadow={true} bgColor="bg-blue-500" size="w-14 h-14" icon={<Plus color="white" size={30} />} position="bottom-8 right-8" onClick={() => setOpen(true)} />

      {/* Modal / Form Reward */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-lg shadow-xl">
            {/* Form Reward */}
            <AddReward />

            {/* Tombol Save */}
            <div className="mt-6 flex justify-end gap-3">
              <button className="px-4 py-2 bg-gray-300 rounded-lg" onClick={() => setOpen(false)}>
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={() => {
                  console.log("Saved Reward:", rewardData);
                  setOpen(false);
                }}
              >
                Save Reward
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
