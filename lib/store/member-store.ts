// src/store/useMemberStore.ts
import { Member } from "@/types/typeData";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MemberStore {
  members: Member[];
  addMember: (member: Omit<Member, "tasks" | "id">) => void;
  deleteMember: (id: number) => void;
  editMember: (id: number, updates: Partial<Omit<Member, "tasks">>) => void;
  getMember: (id: number) => Member | undefined;
}

export const useMemberStore = create<MemberStore>()(
  persist(
    (set, get) => ({
      members: [],

      addMember: (memberData) =>
        set((state) => ({
          members: [
            ...state.members,
            {
              id: Date.now(), // generate ID unik
              ...memberData,
              tasks: [],
            },
          ],
        })),

      deleteMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        })),

      editMember: (id, updates) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      getMember: (id) => get().members.find((m) => m.id === id),
    }),
    { name: "member-storage" }
  )
);
