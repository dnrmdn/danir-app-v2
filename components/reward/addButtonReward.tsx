"use client";

import { useState } from "react";
import FloatButton from "@/components/floatButton";
import { Plus } from "lucide-react";
import AddRewardForm from "@/components/reward/addRewardForm";

export default function AddButtonReward() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FloatButton floating shadow bgColor="bg-blue-500" size="w-14 h-14" icon={<Plus color="white" size={30} />} position="bottom-8 right-8" onClick={() => setOpen(true)} />

      <AddRewardForm isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
