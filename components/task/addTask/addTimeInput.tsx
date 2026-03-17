"use client";

import { Clock } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AddTimeInput({ onChange }: { onChange?: (t: string) => void }) {
  const [includeTime, setIncludeTime] = useState(true);

  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  });

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
    onChange?.(e.target.value);
  };

  const toggleIncludeTime = () => {
    const newValue = !includeTime;
    setIncludeTime(newValue);

    if (!newValue) {
      onChange?.("");
    } else {
      onChange?.(time);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#07111f]/80">
      <div className="flex max-w-full items-center gap-3 px-4 py-3">
        <Clock size={22} className="text-slate-400" />
        <div className="flex-1">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Time</p>

          <Popover>
            <PopoverTrigger asChild>
              <button disabled={!includeTime} className={cn("w-full text-left text-base", includeTime ? "text-white" : "cursor-not-allowed text-slate-500")}>
                {includeTime ? time : "No time selected"}
              </button>
            </PopoverTrigger>

            <PopoverContent className="flex w-auto justify-center rounded-xl border bg-white p-3 shadow-lg">
              <input type="time" value={time} onChange={handleTimeChange} className="rounded-md border border-gray-300 p-2 text-xl focus:outline-none" />
            </PopoverContent>
          </Popover>
        </div>

        <div onClick={toggleIncludeTime} className={cn("flex h-6 w-12 cursor-pointer items-center rounded-full p-1 transition-colors", includeTime ? "bg-cyan-500" : "bg-slate-500")}>
          <motion.div layout transition={{ type: "spring", stiffness: 500, damping: 30 }} className="h-5 w-5 rounded-full bg-white" animate={{ x: includeTime ? 24 : 0 }} />
        </div>
      </div>
    </div>
  );
}
