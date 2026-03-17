"use client"

import { Trophy, Gift, Zap } from "lucide-react"
import { useState } from "react"

const rewards = [
  { id: 1, name: "Movie Night", points: 500, icon: Gift },
  { id: 2, name: "Coffee Break", points: 100, icon: Zap },
  { id: 3, name: "Weekend Getaway", points: 2000, icon: Trophy },
]

export function RewardsSystem() {
  const [points] = useState(850)

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-950/10 backdrop-blur-sm">
      <div className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-200">
          <Trophy className="h-3.5 w-3.5" />
          Motivation system
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Rewards</h3>
        <p className="text-sm text-slate-300">Turn progress into momentum with redeemable rewards and points.</p>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-r from-violet-400/10 to-cyan-400/10 p-5 text-center">
        <p className="text-sm text-slate-300">Current Points</p>
        <p className="text-3xl font-bold text-white">{points}</p>
      </div>

      <div className="space-y-3">
        {rewards.map((reward) => {
          const Icon = reward.icon
          return (
            <div
              key={reward.id}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4 transition hover:border-violet-400/20 hover:bg-white/5"
            >
              <div className="rounded-xl bg-violet-400/10 p-2.5">
                <Icon className="text-violet-300" size={18} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{reward.name}</p>
                <p className="text-sm text-slate-400">{reward.points} pts</p>
              </div>
              <button
                className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                  points >= reward.points
                    ? "bg-white text-slate-950 hover:bg-slate-100"
                    : "bg-white/5 text-slate-500 cursor-not-allowed"
                }`}
                disabled={points < reward.points}
              >
                Redeem
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
