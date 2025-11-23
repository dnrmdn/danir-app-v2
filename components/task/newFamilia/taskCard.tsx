"use client";
import { Card } from "@/components/ui/card";
import CheckButton from "./checkButton";
import { Member, Task } from "@/types/typeData";
import { formatTimeToAmPm } from "@/helper/timeFormat";
import { Star, Pencil, Trash2, Calendar, Repeat, Users } from "lucide-react";
import { useTaskStore } from "@/lib/store/task-store";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/animate-ui/components/radix/dialog";
import { useState } from "react";

type TaskItemProps = {
  task: Task;
  member: Member;
};

export default function TaskCard({ task, member }: TaskItemProps) {
  const { toggleTask, deleteTask, updateTask } = useTaskStore();

  // Dialog open
  const [open, setOpen] = useState(false);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);

  const [editData, setEditData] = useState({
    label: task.label,
    date: task.date || "",
    time: task.time || "",
    reward: String(task.reward ?? 0),
    completed: task.completed || false,
  });

  const handleSaveEdit = async () => {
    await updateTask(task.id, {
      label: editData.label.trim(),
      date: editData.date.trim(),
      time: editData.time.trim(), // ← FIX PENTING
      reward: Number(editData.reward),
      completed: editData.completed,
    });

    setIsEditing(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Card */}
      <DialogTrigger className="w-full">
        <Card className={`max-w-[400px] rounded-4xl cursor-pointer ${task.completed ? member.taskColorDone : member.taskColor}`}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="">
              <p className="pl-2 font-bold line-clamp-1">{task.label}</p>

              <div className="flex items-center gap-2 mt-1">
                {task.time && <p className="px-2 py-1 text-gray-500 text-sm truncate">{formatTimeToAmPm(task.time)}</p>}

                {Number(task.reward) > 0 && (
                  <div className={`flex items-center justify-center ${member.bgColor} rounded-4xl px-2 py-1 text-gray-700 font-medium text-sm`}>
                    <Star size={15} fill={task.completed ? "#eab308" : "transparent"} color={task.completed ? "#eab308" : "#9ca3af"} className="mr-1" />
                    <p className="text-gray-700 text-sm">{task.reward}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0">
              <CheckButton member={member} checked={task.completed} onToggle={() => toggleTask(task.id)} />
            </div>
          </div>
        </Card>
      </DialogTrigger>

      {/* Dialog Content */}
      <DialogContent className="rounded-3xl max-w-[420px] p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold mb-4">{isEditing ? "Edit Task" : task.label}</DialogTitle>
        </DialogHeader>

        {/* EDIT MODE */}
        {isEditing ? (
          <div className="space-y-4 mb-6">
            {/* Label */}
            <div>
              <label className="text-gray-600 text-sm">Label</label>
              <input type="text" value={editData.label} onChange={(e) => setEditData({ ...editData, label: e.target.value.trim() })} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-lg" />
            </div>

            {/* Date */}
            <div>
              <label className="text-gray-600 text-sm">Date</label>
              <input type="date" value={editData.date} onChange={(e) => setEditData({ ...editData, date: e.target.value.trim() })} className="w-full border border-gray-300 rounded-xl px-3 py-2" />
            </div>

            {/* Time */}
            <div>
              <label className="text-gray-600 text-sm">Time</label>
              <input type="time" value={editData.time} onChange={(e) => setEditData({ ...editData, time: e.target.value.trim() })} className="w-full border border-gray-300 rounded-xl px-3 py-2" />
            </div>

            {/* Reward */}
            <div>
              <label className="text-gray-600 text-sm">Reward</label>
              <input type="number" value={editData.reward} onChange={(e) => setEditData({ ...editData, reward: e.target.value.trim() })} className="w-full border border-gray-300 rounded-xl px-3 py-2" />
            </div>

            {/* Completed */}
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={editData.completed} onChange={(e) => setEditData({ ...editData, completed: e.target.checked })} className="w-5 h-5" />
              <label className="text-gray-700 text-sm">Mark as completed</label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl">
                Cancel
              </button>

              <button onClick={handleSaveEdit} className="px-4 py-2 text-white bg-blue-600 rounded-xl">
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Normal Detail View */}
            <div className="flex items-center gap-4 mb-6">
              <button className="flex items-center gap-2 text-gray-700 font-medium hover:opacity-80" onClick={() => setIsEditing(true)}>
                <Pencil size={18} />
                Edit
              </button>

              <button
                className="flex items-center gap-2 text-red-500 font-medium hover:opacity-80"
                onClick={async () => {
                  await deleteTask(task.id);
                  setOpen(false);
                }}
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>

            {/* Details */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-gray-500" />
                <p className="text-gray-700">{task.time ? formatTimeToAmPm(task.time) : "No time set"}</p>
              </div>

              <div className="flex items-center gap-3">
                <Repeat size={20} className="text-gray-500" />
                <p className="text-gray-700">Weekly on Tue</p>
              </div>

              <div className="flex items-center gap-3">
                <Users size={20} className="text-gray-500" />
                <div>
                  <p className="text-gray-500 text-sm">Assigned to</p>
                  <p className="font-medium">{member.name}</p>
                </div>
              </div>
            </div>

            {/* Complete Button */}
            <button
              onClick={async () => {
                await toggleTask(task.id);
                setOpen(false);
              }}
              className="w-full py-3 bg-blue-600 text-white rounded-2xl text-lg font-medium hover:bg-blue-700 transition"
            >
              {task.completed ? "Mark as Incomplete" : "Mark as Complete"}
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
