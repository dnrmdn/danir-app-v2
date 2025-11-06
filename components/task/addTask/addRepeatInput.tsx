"use client";
import { Repeat2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function AddRepeatInput() {
  const [includeTime, setIncludeTime] = useState(false);

  const toggleIncludeTime = () => setIncludeTime((prev) => !prev);

  return (
    <div className="bg-gray-100 rounded-xl p-3 space-y-3">
      {/* Header Row */}
      <div className="flex items-center px-2 gap-3">
        <Repeat2 size={24} className="text-gray-700" />
        <span className="text-gray-800 font-medium text-lg flex-1">Repeats</span>

        {/* Toggle Switch */}
        <div
          onClick={toggleIncludeTime}
          className={cn(
            "w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors",
            includeTime ? "bg-blue-500" : "bg-gray-400"
          )}
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-5 h-5 bg-white rounded-full"
            animate={{
              x: includeTime ? 24 : 0,
            }}
          />
        </div>
      </div>

      {/* Animated Dropdown Form */}
      <AnimatePresence>
        {includeTime && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 overflow-hidden px-2"
          >
            {/* Every */}
            <div className="flex items-center justify-between bg-white rounded-lg px-4 py-2">
              <span className="text-gray-500 text-sm flex items-center gap-1">
                <ChevronRight size={14} />
                Every
              </span>
              <div className="flex items-center gap-3">
                <ChevronLeft className="w-4 h-4 text-gray-500 cursor-pointer" />
                <span className="text-gray-700 font-medium">1</span>
                <ChevronRight className="w-4 h-4 text-gray-500 cursor-pointer" />
              </div>
            </div>

            {/* Unit of Time */}
            <div className="flex items-center justify-between bg-white rounded-lg px-4 py-2">
              <span className="text-gray-500 text-sm flex items-center gap-1">
                <ChevronRight size={14} />
                Unit of time
              </span>
              <div className="flex items-center gap-1 text-gray-700 font-medium cursor-pointer">
                Week
                <ChevronDown size={16} />
              </div>
            </div>

            {/* On */}
            <div className="flex items-center justify-between bg-white rounded-lg px-4 py-2">
              <span className="text-gray-500 text-sm flex items-center gap-1">
                <ChevronRight size={14} />
                On
              </span>
              <div className="flex items-center gap-1 text-gray-700 font-medium cursor-pointer">
                Tue
                <ChevronDown size={16} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
