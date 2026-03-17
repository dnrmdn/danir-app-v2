"use client"

import { DollarSign, TrendingUp } from "lucide-react"

export function MoneyTracker() {
  const expenses = [
    { category: "Food", amount: 245.5 },
    { category: "Transport", amount: 120.0 },
    { category: "Entertainment", amount: 185.75 },
    { category: "Utilities", amount: 200.0 },
  ]

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-950/10 backdrop-blur-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            <TrendingUp className="h-3.5 w-3.5" />
            Financial snapshot
          </div>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-emerald-300" size={20} />
            <h3 className="text-xl font-semibold text-white">Money Tracking</h3>
          </div>
          <p className="text-sm text-slate-300">Keep expenses, budgets, and monthly momentum visible at a glance.</p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-400/10 to-emerald-400/10 p-5">
        <p className="text-sm text-slate-300">Total Expenses This Month</p>
        <p className="mt-1 text-3xl font-bold text-white">${totalExpenses.toFixed(2)}</p>
      </div>

      <div className="space-y-4">
        {expenses.map((expense) => (
          <div key={expense.category} className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-100 font-medium">{expense.category}</span>
              <span className="text-slate-400">${expense.amount.toFixed(2)}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full h-2.5 transition-all"
                style={{ width: `${(expense.amount / totalExpenses) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
