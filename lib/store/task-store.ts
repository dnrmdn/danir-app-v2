import { Task } from "@/types/domain";
import { create } from "zustand";

interface TaskStore {
  // State
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTasks: (memberId?: number) => Promise<void>;
  addTask: (data: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTask: (id: number, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleTask: (id: number) => Promise<void>;

  // Helpers
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed
  getTaskStats: () => {
    total: number;
    completed: number;
    active: number;
  };
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: true,
  error: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // GET tasks (optional filter by member)
  fetchTasks: async (memberId) => {
    set({ isLoading: true, error: null });

    try {
      const url = memberId ? `/api/task?memberId=${memberId}` : "/api/task";

      const res = await fetch(url);
      const result = await res.json();

      if (result.success) {
        set({ tasks: result.data, isLoading: false });
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      set({ error: "Failed to fetch tasks", isLoading: false });
    }
  },

  // CREATE task
  addTask: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const res = await fetch("/api/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        const newTask = result.data;

        set((state) => ({
          tasks: [newTask, ...state.tasks],
          isLoading: false,
        }));
      } else {
        set({
          error: result.error || "Failed to add task",
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Add task failed:", error);
      set({ error: "Failed to connect to server", isLoading: false });
    }
  },

  // UPDATE task
  updateTask: async (id, data) => {
    set({ isLoading: true, error: null });

    const original = get().tasks;

    // Optimistic UI update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...data } : t
      ),
    }));

    try {
      const res = await fetch(`/api/task/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        const updated = result.data;

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? updated : t
          ),
          isLoading: false,
        }));

        const { useMemberStore } = await import("./member-store");

        useMemberStore.getState().updateMemberTask(updated);

      } else {
        set({ tasks: original, error: result.error, isLoading: false });
      }
    } catch (error) {
      console.error("Update task failed:", error);
      set({ tasks: original, error: "Server error", isLoading: false });
    }
  },

  // TOGGLE completed
  toggleTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    await get().updateTask(id, { completed: !task.completed });
  },

  // DELETE task
  deleteTask: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const res = await fetch(`/api/task/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (result.success) {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          isLoading: false,
        }));
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      console.error("Delete task failed:", error);
      set({ error: "Failed to delete task", isLoading: false });
    }
  },

  // COMPUTED
  getTaskStats: () => {
    const { tasks } = get();

    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      active: tasks.filter((t) => !t.completed).length,
    };
  },
}));

