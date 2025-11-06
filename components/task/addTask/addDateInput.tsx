"use client";

import { CalendarRange } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function AddDateInput() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="bg-gray-100 rounded-lg">
      <div className="flex max-w-full items-center px-4 gap-2">
        <CalendarRange size={30} />
        <div className="flex-1 pt-2">
          <p className="text-sm px-2 text-gray-400">Date</p>

          <Popover>
            <PopoverTrigger asChild>
              <button className={cn("w-full h-10 mb-1 px-2 rounded-md text-xl text-left", !date && "text-gray-400")}>
                {date ? format(date, "EEEE, dd MMM yyyy") : "Select date"}
              </button>
            </PopoverTrigger>

            <PopoverContent className="p-0 w-auto bg-white border shadow-lg rounded-xl">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
