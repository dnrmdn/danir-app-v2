"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AddRewardForm from "@/components/reward/addRewardForm";

export default function AddButtonReward() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="flex h-12 items-center gap-2 rounded-2xl border border-violet-300/20 bg-violet-400/15 px-4 text-violet-50 transition hover:bg-violet-400/20"
        onClick={() => setOpen(true)}
      >
        <Plus size={18} />
        <span className="font-semibold">Add reward</span>
      </button>

      <AddRewardForm isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
