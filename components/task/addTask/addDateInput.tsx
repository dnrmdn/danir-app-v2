"use client";

import { CalendarRange } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function AddDateInput({ onChange }: { onChange?: (d: Date | undefined) => void }) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="rounded-2xl border border-white/10 bg-[#07111f]/80">
      <div className="flex max-w-full items-center gap-3 px-4 py-3">
        <CalendarRange size={22} className="text-slate-400" />
        <div className="flex-1">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Date</p>

          <Popover>
            <PopoverTrigger asChild>
              <button className={cn("w-full text-left text-base text-white", !date && "text-slate-500")}>
                {date ? format(date, "EEEE, dd MMM yyyy") : "Select date"}
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-auto rounded-xl border bg-white p-0 shadow-lg">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d);
                  onChange?.(d);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
