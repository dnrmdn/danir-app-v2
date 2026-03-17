"use client";

import { useEffect, useMemo } from "react";
import { Gift, Sparkles, Star, Trophy, Zap } from "lucide-react";
import AddButtonReward from "@/components/reward/addButtonReward";
import MemberReward from "@/components/reward/memberReward";
import { useMemberStore } from "@/lib/store/member-store";
import { useRewardStore } from "@/lib/store/reward-store";
import { Card } from "@/components/ui/card";

export default function RewardPage() {
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
            .filter((task) => task.completed && (task.reward || 0) > 0 && task.label !== "Claim Reward")
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
            .filter((task) => task.completed && task.label === "Claim Reward" && (task.reward || 0) < 0)
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
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-white shadow-2xl shadow-cyan-950/10 backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-200">
              <Sparkles className="h-3.5 w-3.5" />
              Reward v2
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Make progress feel worth it.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Rewards now feel tied to completed tasks, visible stars, and clear unlock progress across members.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-violet-300/20 bg-violet-400/10 p-1">
              <AddButtonReward />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total stars" value={String(totalStars)} subtitle="Collected from completed tasks" icon={<Star className="h-5 w-5 text-yellow-200" />} />
        <SummaryCard title="Rewards" value={String(rewards.length)} subtitle="Available rewards across members" icon={<Gift className="h-5 w-5 text-cyan-200" />} />
        <SummaryCard title="Unlocked" value={String(rewardsUnlocked)} subtitle="Rewards currently claimable" icon={<Trophy className="h-5 w-5 text-emerald-200" />} />
        <SummaryCard title="Featured target" value={featuredReward ? String(featuredReward.minStars) : "—"} subtitle={featuredReward ? `${featuredReward.name} needs this many stars` : "No featured reward yet"} icon={<Zap className="h-5 w-5 text-violet-200" />} />
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.55fr_0.85fr]">
        <Card className="rounded-[2rem] border border-white/10 bg-white/5 p-4 text-white backdrop-blur-xl sm:p-5">
          <div className="mb-4 flex items-center justify-between px-1">
            <div>
              <div className="text-xl font-black text-white">Reward board by member</div>
              <div className="text-sm text-slate-400">Review claimable rewards, see progress, and keep the system motivating.</div>
            </div>
          </div>
          <MemberReward />
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-white backdrop-blur-xl">
            <div className="mb-3 text-lg font-black">What was missing before</div>
            <div className="space-y-3 text-sm text-slate-300">
              <p>• reward page belum kasih summary stars yang jelas</p>
              <p>• featured reward belum kelihatan</p>
              <p>• unlock progress belum langsung kebaca</p>
              <p>• reward terasa terpisah dari hasil task</p>
            </div>
          </Card>

          <Card className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-white backdrop-blur-xl">
            <div className="mb-3 text-lg font-black">What this version improves</div>
            <div className="space-y-3 text-sm text-slate-300">
              <p>• total stars naik ke posisi summary utama</p>
              <p>• featured target reward bikin tujuan lebih jelas</p>
              <p>• claimable rewards lebih terasa sebagai milestone</p>
              <p>• reward sekarang lebih nyambung ke progress task</p>
            </div>
          </Card>

          <Card className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-white backdrop-blur-xl">
            <div className="mb-3 text-lg font-black">Member progress</div>
            <div className="space-y-3">
              {memberProgress.length > 0 ? (
                memberProgress.map((member) => (
                  <div key={member.id} className="rounded-2xl border border-white/10 bg-[#07111f]/70 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{member.name}</span>
                      <span className="rounded-full border border-violet-300/20 bg-violet-400/10 px-2.5 py-1 text-xs text-violet-100">{member.stars} stars</span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">{member.completed} completed task(s)</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#07111f]/50 px-4 py-4 text-sm text-slate-400">No member progress yet.</div>
              )}
            </div>
          </Card>

          <Card className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-white backdrop-blur-xl">
            <div className="mb-3 text-lg font-black">Earned stars log</div>
            <div className="space-y-3">
              {earnedLog.length > 0 ? (
                earnedLog.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-[#07111f]/70 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">{item.memberName}</div>
                        <div className="mt-1 text-xs text-slate-400">{item.label}</div>
                      </div>
                      <div className="text-right">
                        <div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-100">+{item.points} stars</div>
                        <div className="mt-1 text-[11px] text-slate-500">{item.date || "No date"}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#07111f]/50 px-4 py-4 text-sm text-slate-400">No earned log yet.</div>
              )}
            </div>
          </Card>

          <Card className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-white backdrop-blur-xl">
            <div className="mb-3 text-lg font-black">Redeem history</div>
            <div className="space-y-3">
              {redeemHistory.length > 0 ? (
                redeemHistory.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-[#07111f]/70 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">{item.memberName}</div>
                        <div className="mt-1 text-xs text-slate-400">Reward claimed</div>
                      </div>
                      <div className="text-right">
                        <div className="rounded-full border border-violet-300/20 bg-violet-400/10 px-2.5 py-1 text-xs text-violet-100">-{item.points} stars</div>
                        <div className="mt-1 text-[11px] text-slate-500">{item.date || "No date"}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#07111f]/50 px-4 py-4 text-sm text-slate-400">No redeem history yet.</div>
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
    <Card className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-white backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">{icon}</div>
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
      <div className="mt-2 text-sm font-semibold text-slate-200">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</div>
    </Card>
  );
}
