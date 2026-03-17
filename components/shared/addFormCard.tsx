"use client";

import { X } from "lucide-react";
import ModalOverlay from "../task/addTask/modalOverlayUI";
import GlassCard from "../task/addTask/glassCardUI";

export default function AddFormCard({
  isOpen,
  onClose,
  title,
  onSubmit,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <GlassCard className="flex h-full rounded-l-[2rem] border-l border-white/10 bg-[#08111f]/95 text-white backdrop-blur-xl">
        <div className="flex h-full flex-col px-6 py-6 sm:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Create</div>
              <h2 className="mt-1 text-3xl font-black text-white">{title}</h2>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">{children}</div>

          <button
            onClick={onSubmit}
            className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
          >
            Submit
          </button>
        </div>
      </GlassCard>
    </ModalOverlay>
  );
}
