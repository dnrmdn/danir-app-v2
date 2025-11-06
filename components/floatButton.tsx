"use client";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useEffect, useState } from "react";
import AddTaskCard from "./task/addTask/AddTask";

export default function FloatButton() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  // close with ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full sm:w-20 sm:h-20 cursor-pointer ">
        <Plus color="white" size={isMobile ? 20 : 45} />
      </button>
      {open && <AddTaskCard isOpen={open} onClose={() => setOpen(false)} />}
    </>
  );
}
