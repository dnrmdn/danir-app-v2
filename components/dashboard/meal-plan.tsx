"use client"

import { Apple } from "lucide-react"

const meals = [
  { day: "Monday", breakfast: "Oatmeal with berries", lunch: "Grilled chicken salad", dinner: "Pasta primavera" },
  { day: "Tuesday", breakfast: "Eggs and toast", lunch: "Turkey sandwich", dinner: "Grilled salmon" },
  { day: "Wednesday", breakfast: "Greek yogurt bowl", lunch: "Quinoa bowl", dinner: "Stir-fried vegetables" },
]

export function MealPlan() {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-950/10 backdrop-blur-sm">
      <div className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs font-semibold text-orange-200">
          <Apple className="h-3.5 w-3.5" />
          Weekly nutrition
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Meal Plan</h3>
        <p className="text-sm text-slate-300">Plan breakfast, lunch, and dinner with a simple weekly routine.</p>
      </div>

      <div className="space-y-4">
        {meals.map((meal) => (
          <div key={meal.day} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 transition hover:bg-white/5">
            <p className="mb-3 font-semibold text-white">{meal.day}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <span>🌅</span>
                <span>{meal.breakfast}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span>🍽️</span>
                <span>{meal.lunch}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span>🌙</span>
                <span>{meal.dinner}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
