// =========================
// TASK
// =========================
export interface Task {
  id: number;
  label: string;
  date: string;
  time: string;
  completed: boolean;
  reward?: number;
  createdAt: Date;
  memberId: number;   // ✔ number sesuai Prisma
}

// =========================
// MEMBER
// =========================
export interface Member {
  id: number;          // ✔ number
  name: string;
  bgColor: string;
  taskColor: string;
  taskColorDone: string;
  iconColor: string;
  checkColor: string;

  tasks: Task[];
  rewards?: RewardClaim[];
}

// =========================
// REWARD
// =========================
export interface Reward {
  id: number;

  memberId: number;   // FIXED ✔ wajib number (Prisma: Int)
  userId: string;     // FIXED ✔ Prisma: String

  name: string;
  minStars: number;
  image: string;

  createdAt: Date;
  updatedAt: Date;
}

// =========================
// REWARD CLAIM
// =========================
export interface RewardClaim {
  id: number;
  memberId: number;
  rewardId: number;
  claimedAt: Date;

  member?: Member;
  reward?: Reward;
}

// =========================
// INPUT TYPES
// =========================
export type CreateRewardInput = {
  name: string;
  minStars: number;
  image: string;
  userId?: string;  // FIXED ✔ Prisma: String
};

export type UpdateRewardInput = Partial<{
  name: string;
  minStars: number;
  image: string;
}>;

export type CreateRewardPayload = {
  name: string;
  image: string | null;
  minStars: number;
  memberId: number;
};
