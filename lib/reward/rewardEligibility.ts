// lib/reward/rewardEligibility.ts

import { Member, Reward } from "@/types/typeData";

export type EligibilityResult = {
  eligible: boolean;      // boleh claim atau tidak
  totalStars: number;     // total star member
  requiredStars: number;  // minimal stars untuk reward
  remaining: number;      // sisa star yang dibutuhkan
};

/**
 * Hitung total star dari semua task yang sudah completed
 */
export function getMemberStars(member: Member): number {
  const completedTasks = member.tasks.filter((t) => t.completed);
  return completedTasks.reduce((sum, t) => sum + (t.reward || 0), 0);
}

/**
 * Cek apakah member memenuhi syarat untuk claim reward
 */
export function checkRewardEligibility(member: Member, reward: Reward): EligibilityResult {
  const totalStars = getMemberStars(member);
  const requiredStars = reward.minStars;

  const eligible = totalStars >= requiredStars;
  const remaining = Math.max(0, requiredStars - totalStars);

  return {
    eligible,
    totalStars,
    requiredStars,
    remaining
  };
}
