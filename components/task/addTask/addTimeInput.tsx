"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AddTimeInput({ onChange }: { onChange?: (t: string) => void }) {
  const [includeTime, setIncludeTime] = useState(true);

  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  });

  useEffect(() => {
    onChange?.(time); // kirim default time saat mount
  }, []);

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
      onChange?.(time); // Kirim value default saat diaktifkan
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg">
      <div className="flex max-w-full items-center px-4 gap-2">
        <Clock size={30} />
        <div className="flex-1 pt-2">
          <p className="text-sm px-2 text-gray-400">Time</p>

          <Popover>
            <PopoverTrigger asChild>
              <button disabled={!includeTime} className={cn("w-full h-10 mb-1 px-2 rounded-md text-xl text-left", includeTime ? "cursor-pointer" : "text-black cursor-not-allowed")}>
                {includeTime ? time : "No time selected"}
              </button>
            </PopoverTrigger>

            <PopoverContent className="p-3 w-auto bg-white border shadow-lg rounded-xl flex justify-center">
              <input type="time" value={time} onChange={handleTimeChange} className="text-xl p-2 rounded-md border border-gray-300 focus:outline-none" />
            </PopoverContent>
          </Popover>
        </div>

        <div onClick={toggleIncludeTime} className={cn("w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors", includeTime ? "bg-blue-500" : "bg-gray-400")}>
          <motion.div layout transition={{ type: "spring", stiffness: 500, damping: 30 }} className="w-5 h-5 bg-white rounded-full" animate={{ x: includeTime ? 24 : 0 }} />
        </div>
      </div>
    </div>
  );
}
