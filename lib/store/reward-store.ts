import { create } from "zustand";
import { CreateRewardPayload, Reward } from "@/types/domain";

interface RewardFormData {
    name: string;
    image: string | null;
    minStar: number;
}

interface RewardStore {
    rewardData: RewardFormData;
    setRewardData: (data: RewardFormData) => void;
    resetRewardData: () => void; // 🔥 ditambahkan

    rewards: Reward[];
    isLoading: boolean;
    error: string | null;

    claimReward: (memberId: number, rewardId: number) => Promise<void>;

    fetchRewards: (memberId: number) => Promise<void>;
    addReward: (data: CreateRewardPayload) => Promise<void>;
    updateReward: (id: number, data: Partial<Reward>) => Promise<void>;
    deleteReward: (id: number) => Promise<void>;

    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

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

    // 🔥 RESET FORM
    resetRewardData: () =>
        set({
            rewardData: {
                name: "",
                image: null,
                minStar: 0,
            },
        }),

    // STATE UTAMA
    rewards: [],
    isLoading: false,
    error: null,

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    claimReward: async (memberId, rewardId) => {
        try {
            const res = await fetch("/api/member/claim-reward", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ memberId, rewardId }),
            });

            const result = await res.json();

            if (!result.success) {
                throw new Error(result.error || "Failed to claim reward");
            }

            // kamu bisa fetch ulang data member di sini jika punya store member
            console.log("Reward claimed!");
        } catch (err) {
            console.error(err);
        }
    },


    // GET rewards by member
    fetchRewards: async (memberId: number) => {
        set({ isLoading: true, error: null });

        try {
            const res = await fetch(`/api/reward?memberId=${memberId}`);
            const result = await res.json();

            if (result.success) {
                set((state) => ({
                    rewards: [
                        ...state.rewards.filter((r) => r.memberId !== memberId),
                        ...result.data
                    ],
                    isLoading: false,
                }));
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

    getRewardStats: () => {
        const { rewards } = get();

        return {
            total: rewards.length,
            minStarsTotal: rewards.reduce((sum, r) => sum + r.minStars, 0),
        };
    },
}));

