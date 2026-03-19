"use client";

import { useEffect, useMemo } from "react";
import { Gift, Sparkles, Star, Trophy, Zap } from "lucide-react";
import AddButtonReward from "@/components/reward/addButtonReward";
import MemberReward from "@/components/reward/memberReward";
import { useMemberStore } from "@/lib/store/member-store";
import { useRewardStore } from "@/lib/store/reward-store";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/components/language-provider";

const contentRewardLocal = {
  id: {
    badge: "Hadiah v2",
    title: "Buat progres lebih berarti.",
    desc: "Hadiah sekarang terhubung dengan tugas selesai, bintang yang dikumpulkan terlihat jelas, dan progres antar member lebih terukur.",
    totalStars: "Total bintang",
    totalStarsSub: "Dikumpulkan dari tugas",
    rewardsTitle: "Hadiah",
    rewardsSub: "Hadiah yang tersedia",
    unlockedTitle: "Terbuka",
    unlockedSub: "Hadiah bisa diklaim",
    featuredTitle: "Target utama",
    featuredSub: (name: string) => `${name} butuh bintang sebanyak ini`,
    featuredNone: "Belum ada hadiah utama",
    boardTitle: "Papan hadiah per member",
    boardDesc: "Cek hadiah yang bisa diklaim, pantau progres, dan buat sistem tetap memotivasi.",
    progressTitle: "Progres member",
    progressCompleted: "tugas selesai",
    progressNone: "Belum ada progres member.",
    logTitle: "Log bintang dikumpulkan",
    logNone: "Belum ada log.",
    redeemTitle: "Riwayat klaim",
    redeemClaimed: "Hadiah diklaim",
    redeemNone: "Belum ada riwayat klaim.",
    noDate: "Tanpa tanggal",
    missingTitle: "Kekurangan versi lama",
    missingLines: [
      "• halaman hadiah belum ada rekap bintang yang jelas",
      "• hadiah utama belum terlihat",
      "• progres unlock belum langsung terbaca",
      "• hadiah terasa terpisah dari hasil tugas"
    ],
    improvesTitle: "Kelebihan versi ini",
    improvesLines: [
      "• total bintang naik ke posisi utama",
      "• target reward yang jelas buat ningkatin fokus",
      "• hadiah yang bisa diklaim jadi patokan",
      "• hadiah lebih nyambung ke progres tugas"
    ]
  },
  en: {
    badge: "Reward v2",
    title: "Make progress feel worth it.",
    desc: "Rewards now feel tied to completed tasks, visible stars, and clear unlock progress across members.",
    totalStars: "Total stars",
    totalStarsSub: "Collected from completed tasks",
    rewardsTitle: "Rewards",
    rewardsSub: "Available rewards across members",
    unlockedTitle: "Unlocked",
    unlockedSub: "Rewards currently claimable",
    featuredTitle: "Featured target",
    featuredSub: (name: string) => `${name} needs this many stars`,
    featuredNone: "No featured reward yet",
    boardTitle: "Reward board by member",
    boardDesc: "Review claimable rewards, see progress, and keep the system motivating.",
    progressTitle: "Member progress",
    progressCompleted: "completed task(s)",
    progressNone: "No member progress yet.",
    logTitle: "Earned stars log",
    logNone: "No earned log yet.",
    redeemTitle: "Redeem history",
    redeemClaimed: "Reward claimed",
    redeemNone: "No redeem history yet.",
    noDate: "No date",
    missingTitle: "What was missing before",
    missingLines: [
      "• reward page did not provide a clear star summary",
      "• featured reward was invisible",
      "• unlock progress was not instantly readable",
      "• rewards felt disconnected from task outcomes"
    ],
    improvesTitle: "What this version improves",
    improvesLines: [
      "• total stars is now the main summary",
      "• featured target rewards bring clear focus",
      "• claimable rewards serve as milestones",
      "• rewards are directly tied to task progress"
    ]
  }
};

export default function RewardPage() {
  const { locale } = useLanguage();
  const t = contentRewardLocal[locale];

  const members = useMemberStore((s) => s.members);
  const fetchMembers = useMemberStore((s) => s.fetchMembers);
  const rewards = useRewardStore((s) => s.rewards);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const totalStars = useMemo(
    () =>
      members.reduce(
        (sum, member) => sum + member.tasks.filter((task) => task.completed).reduce((acc, task) => acc + (task.reward || 0), 0),
        0
      ),
    [members]
  );

  const featuredReward = useMemo(() => {
    if (rewards.length === 0) return null;
    return [...rewards].sort((a, b) => a.minStars - b.minStars)[0];
  }, [rewards]);

  const rewardsUnlocked = useMemo(
    () =>
      members.reduce((count, member) => {
        const memberStars = member.tasks.filter((task) => task.completed).reduce((sum, task) => sum + (task.reward || 0), 0);
        return count + rewards.filter((reward) => reward.memberId === member.id && memberStars >= reward.minStars).length;
      }, 0),
    [members, rewards]
  );

  const memberProgress = useMemo(
    () =>
      members.map((member) => ({
        id: member.id,
        name: member.name,
        stars: member.tasks.filter((task) => task.completed).reduce((sum, task) => sum + (task.reward || 0), 0),
        completed: member.tasks.filter((task) => task.completed).length,
      })),
    [members]
  );

  const earnedLog = useMemo(
    () =>
      members
        .flatMap((member) =>
          member.tasks
            .filter((task) => task.completed && (task.reward || 0) > 0 && task.label.toLowerCase() !== "claim reward" && task.label.toLowerCase() !== "klaim hadiah")
            .map((task) => ({
              id: `${member.id}-earned-${task.id}`,
              memberName: member.name,
              label: task.label,
              points: task.reward || 0,
              date: task.date,
            }))
        )
        .slice(0, 8),
    [members]
  );

  const redeemHistory = useMemo(
    () =>
      members
        .flatMap((member) =>
          member.tasks
            .filter((task) => task.completed && (task.label.toLowerCase() === "claim reward" || task.label.toLowerCase() === "klaim hadiah") && (task.reward || 0) < 0)
            .map((task) => ({
              id: `${member.id}-claim-${task.id}`,
              memberName: member.name,
              points: Math.abs(task.reward || 0),
              date: task.date,
            }))
        )
        .slice(0, 8),
    [members]
  );

  return (
    <div className="space-y-8 pb-8">
      <section className="rounded-[2rem] border border-border bg-card/80 p-6 text-foreground shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-2xl dark:shadow-cyan-950/10 sm:p-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-100/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-800 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200">
              <Sparkles className="h-3.5 w-3.5" />
              {t.badge}
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl dark:text-white">{t.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base dark:text-slate-300">
              {t.desc}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-1 dark:border-violet-300/20 dark:bg-violet-400/10">
              <AddButtonReward />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title={t.totalStars} value={String(totalStars)} subtitle={t.totalStarsSub} icon={<Star className="h-5 w-5 text-yellow-500 dark:text-yellow-200" />} />
        <SummaryCard title={t.rewardsTitle} value={String(rewards.length)} subtitle={t.rewardsSub} icon={<Gift className="h-5 w-5 text-cyan-600 dark:text-cyan-200" />} />
        <SummaryCard title={t.unlockedTitle} value={String(rewardsUnlocked)} subtitle={t.unlockedSub} icon={<Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-200" />} />
        <SummaryCard title={t.featuredTitle} value={featuredReward ? String(featuredReward.minStars) : "—"} subtitle={featuredReward ? t.featuredSub(featuredReward.name) : t.featuredNone} icon={<Zap className="h-5 w-5 text-violet-600 dark:text-violet-200" />} />
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.55fr_0.85fr]">
        <Card className="rounded-[2rem] border border-border bg-card/80 p-4 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white sm:p-5">
          <div className="mb-4 flex items-center justify-between px-1">
            <div>
              <div className="text-xl font-black text-foreground dark:text-white">{t.boardTitle}</div>
              <div className="text-sm text-muted-foreground dark:text-slate-400">{t.boardDesc}</div>
            </div>
          </div>
          <MemberReward />
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border border-border bg-card/80 p-6 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white">
            <div className="mb-3 text-lg font-black">{t.missingTitle}</div>
            <div className="space-y-3 text-sm text-muted-foreground dark:text-slate-300">
              {t.missingLines.map((l, i) => <p key={i}>{l}</p>)}
            </div>
          </Card>

          <Card className="rounded-[2rem] border border-border bg-card/80 p-6 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white">
            <div className="mb-3 text-lg font-black">{t.improvesTitle}</div>
            <div className="space-y-3 text-sm text-muted-foreground dark:text-slate-300">
              {t.improvesLines.map((l, i) => <p key={i}>{l}</p>)}
            </div>
          </Card>

          <Card className="rounded-[2rem] border border-border bg-card/80 p-6 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white">
            <div className="mb-3 text-lg font-black">{t.progressTitle}</div>
            <div className="space-y-3">
              {memberProgress.length > 0 ? (
                memberProgress.map((member) => (
                  <div key={member.id} className="rounded-2xl border border-border bg-muted/50 px-4 py-3 dark:border-white/10 dark:bg-[#07111f]/70">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground dark:text-white">{member.name}</span>
                      <span className="rounded-full border border-violet-200 bg-violet-100/50 px-2.5 py-1 text-xs text-violet-800 dark:border-violet-300/20 dark:bg-violet-400/10 dark:text-violet-100">{member.stars} stars</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground dark:text-slate-500">{member.completed} {t.progressCompleted}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-4 text-sm text-muted-foreground dark:border-white/10 dark:bg-[#07111f]/50 dark:text-slate-400">{t.progressNone}</div>
              )}
            </div>
          </Card>

          <Card className="rounded-[2rem] border border-border bg-card/80 p-6 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white">
            <div className="mb-3 text-lg font-black">{t.logTitle}</div>
            <div className="space-y-3">
              {earnedLog.length > 0 ? (
                earnedLog.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-muted/50 px-4 py-3 dark:border-white/10 dark:bg-[#07111f]/70">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-foreground dark:text-white">{item.memberName}</div>
                        <div className="mt-1 text-xs text-muted-foreground dark:text-slate-400">{item.label}</div>
                      </div>
                      <div className="text-right">
                        <div className="rounded-full border border-emerald-200 bg-emerald-100/50 px-2.5 py-1 text-xs text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-100">+{item.points} stars</div>
                        <div className="mt-1 text-[11px] text-muted-foreground dark:text-slate-500">{item.date || t.noDate}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-4 text-sm text-muted-foreground dark:border-white/10 dark:bg-[#07111f]/50 dark:text-slate-400">{t.logNone}</div>
              )}
            </div>
          </Card>

          <Card className="rounded-[2rem] border border-border bg-card/80 p-6 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white">
            <div className="mb-3 text-lg font-black">{t.redeemTitle}</div>
            <div className="space-y-3">
              {redeemHistory.length > 0 ? (
                redeemHistory.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-muted/50 px-4 py-3 dark:border-white/10 dark:bg-[#07111f]/70">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-foreground dark:text-white">{item.memberName}</div>
                        <div className="mt-1 text-xs text-muted-foreground dark:text-slate-400">{t.redeemClaimed}</div>
                      </div>
                      <div className="text-right">
                        <div className="rounded-full border border-violet-200 bg-violet-100/50 px-2.5 py-1 text-xs text-violet-800 dark:border-violet-300/20 dark:bg-violet-400/10 dark:text-violet-100">-{item.points} stars</div>
                        <div className="mt-1 text-[11px] text-muted-foreground dark:text-slate-500">{item.date || t.noDate}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-4 text-sm text-muted-foreground dark:border-white/10 dark:bg-[#07111f]/50 dark:text-slate-400">{t.redeemNone}</div>
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle: string; icon: React.ReactNode }) {
  return (
    <Card className="rounded-[1.75rem] border border-border bg-card/80 p-5 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-2xl border border-border bg-muted/50 p-3 dark:border-white/10 dark:bg-white/5">{icon}</div>
      </div>
      <div className="text-3xl font-black text-foreground dark:text-white">{value}</div>
      <div className="mt-2 text-sm font-semibold text-foreground dark:text-slate-200">{title}</div>
      <div className="mt-1 text-xs leading-5 text-muted-foreground dark:text-slate-500">{subtitle}</div>
    </Card>
  );
}
