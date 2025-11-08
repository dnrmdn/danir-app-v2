import { Task } from "@/types/typeData";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMemberStore } from "./member-store";

interface TaskStore {
  addTask: (memberId: number, task: Omit<Task, "id" | "createdAt" | "completed">) => void;
  toggleTask: (memberId: number, taskId: number) => void;
  deleteTask: (memberId: number, taskId: number) => void;
  getTasks: (memberId: number) => Task[];
}

export const useTaskStore = create<TaskStore>()(
  persist(
    () => ({
      // ✅ ADD TASK
      addTask: (memberId, taskData) => {
        const memberStore = useMemberStore.getState();
        const member = memberStore.getMember(memberId);
        if (!member) return;

        const newTask: Task = {
          id: Date.now(),
          createdAt: new Date(),
          completed: false,
          ...taskData,
        };

        // update hanya bagian tasks
        const updatedMember = {
          ...member,
          tasks: [...member.tasks, newTask],
        };

        memberStore.deleteMember(memberId);
        memberStore.addMember(updatedMember);
      },

      // ✅ TOGGLE TASK
      toggleTask: (memberId, taskId) => {
        const memberStore = useMemberStore.getState();
        const member = memberStore.getMember(memberId);
        if (!member) return;

        const updatedTasks = member.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );

        const updatedMember = { ...member, tasks: updatedTasks };
        memberStore.deleteMember(memberId);
        memberStore.addMember(updatedMember);
      },

      // ✅ DELETE TASK
      deleteTask: (memberId, taskId) => {
        const memberStore = useMemberStore.getState();
        const member = memberStore.getMember(memberId);
        if (!member) return;

        const filteredTasks = member.tasks.filter((t) => t.id !== taskId);
        const updatedMember = { ...member, tasks: filteredTasks };
        memberStore.deleteMember(memberId);
        memberStore.addMember(updatedMember);
      },

      // ✅ GET TASKS
      getTasks: (memberId) => {
        const memberStore = useMemberStore.getState();
        const member = memberStore.getMember(memberId);
        return member ? member.tasks : [];
      },
    }),
    { name: "task-storage" }
  )
);
