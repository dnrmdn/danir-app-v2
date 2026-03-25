import { MoneyNavId } from "../_types";

type MoneyTabsProps = {
  t: Record<MoneyNavId, string>;
  active: MoneyNavId;
  setActive: (tab: MoneyNavId) => void;
};

export function MoneyTabs({ t, active, setActive }: MoneyTabsProps) {
  return (
    <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none sm:gap-4">
      {(["dashboard", "transactions", "categories", "budgets", "goals"] as MoneyNavId[]).map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all sm:rounded-2xl sm:px-6 sm:py-2.5 sm:text-sm ${
            active === tab ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground dark:bg-white/5 dark:hover:bg-white/10"
          }`}
        >
          {t[tab]}
        </button>
      ))}
    </div>
  );
}
