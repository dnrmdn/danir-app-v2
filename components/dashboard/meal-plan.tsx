"use client"

import { Apple } from "lucide-react"

const meals = [
  { day: "Monday", breakfast: "Oatmeal with berries", lunch: "Grilled chicken salad", dinner: "Pasta primavera" },
  { day: "Tuesday", breakfast: "Eggs and toast", lunch: "Turkey sandwich", dinner: "Grilled salmon" },
  { day: "Wednesday", breakfast: "Greek yogurt bowl", lunch: "Quinoa bowl", dinner: "Stir-fried vegetables" },
]

export function MealPlan() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Apple className="text-accent" size={20} />
        <h3 className="text-xl font-semibold text-card-foreground">Meal Plan</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Plan your meals for a healthier and more organized lifestyle.
      </p>

      <div className="space-y-4">
        {meals.map((meal, idx) => (
          <div key={idx} className="p-4 rounded-lg border border-border hover:bg-muted transition-colors">
            <p className="font-semibold text-card-foreground mb-3">{meal.day}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">🌅</span>
                <span className="text-foreground">{meal.breakfast}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">🍽️</span>
                <span className="text-foreground">{meal.lunch}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">🌙</span>
                <span className="text-foreground">{meal.dinner}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
