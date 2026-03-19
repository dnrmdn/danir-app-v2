"use client";

import { Apple } from "lucide-react";

const meals = [
  { day: "Monday", breakfast: "Oatmeal with berries", lunch: "Grilled chicken salad", dinner: "Pasta primavera" },
  { day: "Tuesday", breakfast: "Eggs and toast", lunch: "Turkey sandwich", dinner: "Grilled salmon" },
  { day: "Wednesday", breakfast: "Greek yogurt bowl", lunch: "Quinoa bowl", dinner: "Stir-fried vegetables" },
];

export function MealPlan() {
  return (
    <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-xl shadow-cyan-950/5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:shadow-cyan-950/10">
      <div className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1 text-xs font-semibold text-orange-700 dark:border-orange-400/20 dark:text-orange-200">
          <Apple className="h-3.5 w-3.5" />
          Weekly nutrition
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground dark:text-white">Meal Plan</h3>
        <p className="text-sm text-muted-foreground dark:text-slate-300">Plan breakfast, lunch, and dinner with a simple weekly routine.</p>
      </div>

      <div className="space-y-4">
        {meals.map((meal) => (
          <div key={meal.day} className="rounded-2xl border border-border bg-background p-4 transition hover:border-cyan-400/40 hover:bg-accent dark:border-white/10 dark:bg-slate-950/50 dark:hover:border-cyan-400/30 dark:hover:bg-white/5">
            <p className="mb-3 font-semibold text-foreground dark:text-white">{meal.day}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground dark:text-slate-300">
                <span aria-hidden="true">🌅</span>
                <span>{meal.breakfast}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground dark:text-slate-300">
                <span aria-hidden="true">🍽️</span>
                <span>{meal.lunch}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground dark:text-slate-300">
                <span aria-hidden="true">🌙</span>
                <span>{meal.dinner}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
