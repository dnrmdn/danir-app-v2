import { Member } from "@/types/typeData";
import { create } from "zustand";

interface MemberStore {
  // State
  members: Member[];
  isLoading: boolean;
  isAdding: boolean
  error: string | null;

  //Action
  fetchMembers: () => Promise<void>
  addMember: (data: { name: string, colorIndex: number }) => Promise<boolean>
  updateMember: (id: number, data: Partial<Member>) => Promise<void>
  deleteMember: (id: number) => Promise<void>

  //Helper
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useMemberStore = create<MemberStore>((set, get) => ({
  members: [],
  isLoading: true,
  error: null,
  isAdding: false,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Get All Members
  fetchMembers: async () => {
    set({ isLoading: true, error: null })

    try {
      const res = await fetch("/api/member")
      const result = await res.json()

      if (result.success) {
        set({ members: result.data, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error) {
      console.error("Fetch members error:", error)
      set({ error: "Failed to fetch members", isLoading: false })
    }
  },

  // Create Member
  addMember: async ({ name, colorIndex }): Promise<boolean> => {
    set({ isAdding: true, error: null });

    try {
      const res = await fetch("/api/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, colorIndex })
      });

      const result = await res.json();

      if (result.success) {
        const newMember = result.data;

        set((state) => ({
          members: [newMember, ...state.members],
          isAdding: false
        }));

        return true;            // ⬅️ WAJIB
      } else {
        set({
          error: result.error || "Failed to add member",
          isAdding: false
        });

        return false;           // ⬅️ WAJIB
      }
    } catch (error) {
      console.error("Add member error:", error);

      set({
        error: "Failed to connect to server",
        isAdding: false
      });

      return false;             // ⬅️ WAJIB
    }
  },


  // Update Members
  updateMember: async (id, data) => {
    set({ isLoading: true, error: null })

    const original = get().members

    //Optimistic UI
    set((state) => ({
      members: state.members.map((m) => m.id === id ? { ...m, ...data } : m)
    }))

    try {
      const res = await fetch(`/api/member/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (result.success) {
        set((state) => ({
          members: state.members.map((m) => m.id === id ? result.data : m),
          isLoading: false
        }))
      } else {
        set({ members: original, error: result.error, isLoading: false })
      }
    } catch (error) {
      console.error("Update member failed", error)
      set({ members: original, error: "Server update failed", isLoading: false })
    }
  },

  // Delete Member
  deleteMember: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const res = await fetch(`/api/member/${id}`, { method: "DELETE" })
      const result = await res.json()

      if (result.success) {
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          isLoading: false
        }))
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      console.error("Delete member failed", error);
      set({ error: "Failed to delete member", isLoading: false });
    }
  }





}))