"use client"

import { DollarSign } from "lucide-react"

export function MoneyTracker() {
  const expenses = [
    { category: "Food", amount: 245.5, percentage: 35 },
    { category: "Transport", amount: 120.0, percentage: 17 },
    { category: "Entertainment", amount: 185.75, percentage: 26 },
    { category: "Utilities", amount: 200.0, percentage: 28 },
  ]

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <DollarSign className="text-accent" size={20} />
        <h3 className="text-xl font-semibold text-card-foreground">Money Tracking</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Monitor your expenses, income, and financial goals.</p>

      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground">Total Expenses This Month</p>
        <p className="text-2xl font-bold text-foreground">${totalExpenses.toFixed(2)}</p>
      </div>

      <div className="space-y-3">
        {expenses.map((expense, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-foreground font-medium">{expense.category}</span>
              <span className="text-muted-foreground">${expense.amount.toFixed(2)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${(expense.amount / totalExpenses) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
