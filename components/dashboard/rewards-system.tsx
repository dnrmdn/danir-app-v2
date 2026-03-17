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
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-card-foreground mb-2">Rewards</h3>
      <p className="text-sm text-muted-foreground mb-6">Earn points and redeem rewards for completing tasks.</p>

      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Current Points</p>
          <p className="text-3xl font-bold text-primary">{points}</p>
        </div>
      </div>

      <div className="space-y-3">
        {rewards.map((reward) => {
          const Icon = reward.icon
          return (
            <div
              key={reward.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <div className="p-2 bg-accent/10 rounded-lg">
                <Icon className="text-accent" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-card-foreground">{reward.name}</p>
                <p className="text-sm text-muted-foreground">{reward.points} pts</p>
              </div>
              <button
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  points >= reward.points
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
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
