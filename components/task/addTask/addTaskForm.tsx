"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Check, ChevronDown, Clock3, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { useTaskStore } from "@/lib/store/task-store";
import { useMemberStore } from "@/lib/store/member-store";
import AddMemberInlineModal from "@/components/member/add-member-inline-modal";
import { Calendar } from "@/components/ui/calendar";

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

export default function AddTaskForm({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const addTask = useTaskStore((s) => s.addTask);
  const members = useMemberStore((s) => s.members);
  const fetchMembers = useMemberStore((s) => s.fetchMembers);

  const [mounted, setMounted] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [label, setLabel] = useState("");
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [reward, setReward] = useState("0");
  const [saving, setSaving] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && members.length === 0) {
      fetchMembers();
    }
  }, [isOpen, members.length, fetchMembers]);

  const toggleMember = (id: number) => {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const formattedDate = useMemo(() => (date ? format(date, "dd MMM yyyy") : "Select date"), [date]);
  const formattedTime = time || "Select time";

  const handleSubmit = async () => {
    if (!label.trim()) return;
    if (memberIds.length === 0) return;

    setSaving(true);
    try {
      for (const id of memberIds) {
        await addTask({
          label,
          memberId: id,
          date: date ? format(date, "yyyy-MM-dd") : "",
          time,
          reward: Number(reward || 0),
          completed: false,
        });
      }
      setLabel("");
      setMemberIds([]);
      setDate(undefined);
      setTime("");
      setReward("0");
      setDateOpen(false);
      setTimeOpen(false);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-xl" onClick={onClose}>
        <div
          className="relative z-[100000] flex max-h-[85vh] w-full max-w-2xl flex-col rounded-[2rem] border border-white/10 bg-[#08111f]/98 text-white shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 pt-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Create</div>
              <h2 className="mt-1 text-3xl font-black">Add Task</h2>
            </div>
            <button onClick={onClose} className="group rounded-full border border-cyan-300/15 bg-cyan-400/10 p-2 text-cyan-100 transition hover:bg-cyan-400/15 active:scale-95">
              <X size={18} className="transition-transform duration-200 group-hover:rotate-12 group-active:rotate-90" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Task title</label>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Review dashboard redesign"
                  className="w-full rounded-2xl border border-white/10 bg-[#07111f]/80 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-slate-300">Assign members</label>
                  <button
                    type="button"
                    onClick={() => setShowAddMember(true)}
                    className="group inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/15 active:scale-95"
                  >
                    <Plus size={14} className="transition-transform duration-200 group-hover:rotate-90 group-active:rotate-180" />
                    Add Member
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {members.map((member) => {
                    const active = memberIds.includes(member.id);
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleMember(member.id)}
                        className={`rounded-full border px-3 py-2 text-sm transition ${
                          active ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-100" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {member.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Date</label>
                  <button
                    type="button"
                    onClick={() => {
                      setDateOpen((v) => !v);
                      setTimeOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#07111f]/80 px-4 py-3 text-left text-white"
                  >
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays size={18} className="text-cyan-200" />
                      <span>{formattedDate}</span>
                    </span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${dateOpen ? "rotate-180" : ""}`} />
                  </button>
                  {dateOpen && (
                    <div className="mt-3 rounded-2xl border border-white/10 bg-[#0b1525] p-3 shadow-xl">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => {
                          setDate(d);
                          setDateOpen(false);
                        }}
                        initialFocus
                        className="rounded-xl bg-transparent p-3 text-white"
                        classNames={{
                          month_caption: "text-slate-200",
                          weekday: "text-slate-500 text-xs font-medium",
                          day: "text-slate-200",
                          today: "bg-cyan-400/20 text-cyan-100 rounded-md",
                          selected: "bg-cyan-400 text-slate-950 rounded-md",
                          outside: "text-slate-700",
                          chevron: "text-slate-300",
                          button_previous: "text-slate-300 hover:bg-white/10",
                          button_next: "text-slate-300 hover:bg-white/10",
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Time</label>
                  <button
                    type="button"
                    onClick={() => {
                      setTimeOpen((v) => !v);
                      setDateOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#07111f]/80 px-4 py-3 text-left text-white"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Clock3 size={18} className="text-violet-200" />
                      <span>{formattedTime}</span>
                    </span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${timeOpen ? "rotate-180" : ""}`} />
                  </button>
                  {timeOpen && (
                    <div className="mt-3 rounded-2xl border border-white/10 bg-[#0b1525] p-3 shadow-xl">
                      <div className="mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
                        <span>Pick hour & minute</span>
                        <span className="font-semibold text-slate-200">{formattedTime}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Hour</div>
                          <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                            {HOURS.map((hour) => (
                              <button
                                key={hour}
                                type="button"
                                onClick={() => {
                                  const minute = time.split(":")[1] || "00";
                                  setTime(`${hour}:${minute}`);
                                }}
                                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                                  time.startsWith(`${hour}:`) ? "bg-cyan-400/15 text-cyan-100" : "bg-white/5 text-slate-300 hover:bg-white/10"
                                }`}
                              >
                                {hour}
                                {time.startsWith(`${hour}:`) && <Check size={14} />}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Minute</div>
                          <div className="space-y-1">
                            {MINUTES.map((minute) => {
                              const hour = time.split(":")[0] || "08";
                              const active = time.endsWith(`:${minute}`);
                              return (
                                <button
                                  key={minute}
                                  type="button"
                                  onClick={() => {
                                    setTime(`${hour}:${minute}`);
                                    setTimeOpen(false);
                                  }}
                                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                                    active ? "bg-violet-400/15 text-violet-100" : "bg-white/5 text-slate-300 hover:bg-white/10"
                                  }`}
                                >
                                  {minute}
                                  {active && <Check size={14} />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Reward points</label>
                <input
                  type="number"
                  value={reward}
                  onFocus={() => reward === "0" && setReward("")}
                  onBlur={() => reward.trim() === "" && setReward("0")}
                  onChange={(e) => setReward(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#07111f]/80 px-4 py-3 text-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-white/10 bg-[#08111f]/98 px-6 py-4">
            <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-200 hover:bg-white/10">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2.5 font-semibold text-cyan-100 hover:bg-cyan-400/15 disabled:opacity-50">
              {saving ? "Saving..." : "Create task"}
            </button>
          </div>
        </div>
      </div>

      <AddMemberInlineModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onCreated={(memberId) => setMemberIds((prev) => (prev.includes(memberId) ? prev : [...prev, memberId]))}
      />
    </>,
    document.body
  );
}
