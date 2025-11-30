"use client";

import { X } from "lucide-react";
import ModalOverlay from "../task/addTask/modalOverlayUI";
import GlassCard from "../task/addTask/glassCardUI";

export default function AddFormCard({ isOpen, onClose, title, onSubmit, children }: { isOpen: boolean; onClose: () => void; title: string; onSubmit: () => void; children: React.ReactNode }) {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <GlassCard className="h-full rounded-l-4xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl pl-4 font-semibold">{title}</h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-black/50 transition"
          >
            <X size={22} className="text-black hover:text-white transition" />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">{children}</div>

        {/* Submit */}
        <button onClick={onSubmit} className="bg-blue-500 text-white mt-6 rounded-xl p-3 hover:bg-blue-600 transition">
          Submit
        </button>
      </GlassCard>
    </ModalOverlay>
  );
}
