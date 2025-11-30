// =========================
// TASK
// =========================
export interface Task {
  id: number;
  label: string;
  date: string;
  time: string;
  completed: boolean;
  reward?: number;      // jumlah star yang didapat dari task
  createdAt: Date;
  memberId: number;
}

// =========================
// MEMBER
// =========================
export interface Member {
  id: number;
  name: string;
  bgColor: string;
  taskColor: string;
  taskColorDone: string;
  iconColor: string;
  checkColor: string;
  tasks: Task[];
  rewards?: RewardClaim[]; // reward yang sudah diklaim
}

// =========================
// REWARD (master data reward)
// =========================
export interface Reward {
  id: number;
  userId: string
  memberId: string
  name: string;
  minStars: number;   // minimal star untuk claim
  image: string;      // URL image
  createdAt: Date;
  updatedAt: Date;
}

// =========================
// REWARD CLAIM (riwayat klaim reward oleh member)
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
  userId?: number; // optional kalau reward dibuat oleh member
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
  userId: number; // ini WAJIB dari server/auth
};

