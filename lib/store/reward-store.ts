import { create } from "zustand";
import { CreateRewardPayload, Reward } from "@/types/typeData";

interface RewardFormData {
    name: string;
    image: string | null;
    minStar: number;
}

interface RewardStore {
    // Form State (untuk AddReward form)
    rewardData: RewardFormData;
    setRewardData: (data: RewardFormData) => void;

    // State utama
    rewards: Reward[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchRewards: () => Promise<void>;
    addReward: (data: CreateRewardPayload) => Promise<void>;
    updateReward: (id: number, data: Partial<Reward>) => Promise<void>;
    deleteReward: (id: number) => Promise<void>;

    // Helpers
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Computed
    getRewardStats: () => {
        total: number;
        minStarsTotal: number;
    };
}

export const useRewardStore = create<RewardStore>((set, get) => ({
    // FORM STATE UNTUK ADD REWARD
    rewardData: {
        name: "",
        image: null,
        minStar: 0,
    },

    setRewardData: (data) => set({ rewardData: data }),

    // STATE UTAMA
    rewards: [],
    isLoading: false,
    error: null,

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    // GET all rewards
    fetchRewards: async () => {
        set({ isLoading: true, error: null });

        try {
            const res = await fetch("/api/reward");
            const result = await res.json();

            if (result.success) {
                set({ rewards: result.data, isLoading: false });
            } else {
                set({ error: result.error, isLoading: false });
            }
        } catch (error) {
            console.error("Failed to fetch rewards:", error);
            set({ error: "Failed to fetch rewards", isLoading: false });
        }
    },

    // CREATE reward
    addReward: async (data: CreateRewardPayload) => {
        set({ isLoading: true, error: null });

        try {
            const res = await fetch("/api/reward", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (result.success) {
                const newReward = result.data;
                set((state) => ({
                    rewards: [newReward, ...state.rewards],
                    isLoading: false,
                }));
            } else {
                set({
                    error: result.error || "Failed to add reward",
                    isLoading: false,
                });
            }
        } catch (error) {
            console.error("Add reward failed:", error);
            set({ error: "Failed to connect to server", isLoading: false });
        }
    },

    // UPDATE reward
    updateReward: async (id, data) => {
        set({ isLoading: true, error: null });

        const original = get().rewards;

        set((state) => ({
            rewards: state.rewards.map((r) =>
                r.id === id ? { ...r, ...data } : r
            ),
        }));

        try {
            const res = await fetch(`/api/reward/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (result.success) {
                const updated = result.data;

                set((state) => ({
                    rewards: state.rewards.map((r) =>
                        r.id === id ? updated : r
                    ),
                    isLoading: false,
                }));
            } else {
                set({ rewards: original, error: result.error, isLoading: false });
            }
        } catch (error) {
            console.error("Update reward failed:", error);
            set({ rewards: original, error: "Server error", isLoading: false });
        }
    },

    // DELETE reward
    deleteReward: async (id) => {
        set({ isLoading: true, error: null });

        try {
            const res = await fetch(`/api/reward/${id}`, {
                method: "DELETE",
            });

            const result = await res.json();

            if (result.success) {
                set((state) => ({
                    rewards: state.rewards.filter((r) => r.id !== id),
                    isLoading: false,
                }));
            } else {
                set({ error: result.error, isLoading: false });
            }
        } catch (error) {
            console.error("Failed to delete reward:", error);
            set({ error: "Failed to delete reward", isLoading: false });
        }
    },

    // COMPUTED
    getRewardStats: () => {
        const { rewards } = get();

        return {
            total: rewards.length,
            minStarsTotal: rewards.reduce((sum, r) => sum + r.minStars, 0),
        };
    },
}));
